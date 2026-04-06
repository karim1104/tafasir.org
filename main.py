import logging
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql import func, text
from database import get_session, engine
from models import Base, Language, Madhab, Sura, Ayah, Tafsir, TafsirText

app = FastAPI(title="Tafasir API")

SEARCH_INDEX_DDL = (
    "CREATE EXTENSION IF NOT EXISTS pg_trgm",
    """
    CREATE INDEX IF NOT EXISTS idx_tafsir_texts_text_trgm
    ON tafsir_texts
    USING gin (text gin_trgm_ops)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_tafsir_texts_sura_ayah
    ON tafsir_texts (sura_number, ayah_number)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_ayahs_text_trgm
    ON ayahs
    USING gin (text gin_trgm_ops)
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_ayahs_text_with_tashkeel_trgm
    ON ayahs
    USING gin (text_with_tashkeel gin_trgm_ops)
    WHERE text_with_tashkeel IS NOT NULL
    """,
    """
    CREATE INDEX IF NOT EXISTS idx_ayahs_text_english_trgm
    ON ayahs
    USING gin (text_english gin_trgm_ops)
    WHERE text_english IS NOT NULL
    """,
)


async def ensure_postgres_search_indexes(connection):
    if connection.dialect.name != "postgresql":
        return

    for ddl in SEARCH_INDEX_DDL:
        await connection.execute(text(ddl))


def normalize_search_term(search_term: str) -> str:
    normalized = " ".join(search_term.split())
    if not normalized:
        raise HTTPException(status_code=400, detail="Search term cannot be empty")
    return normalized


async def force_custom_postgres_plan(session: AsyncSession):
    if engine.dialect.name == "postgresql":
        await session.execute(text("SET LOCAL plan_cache_mode = force_custom_plan"))

# Initialize the database
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await ensure_postgres_search_indexes(conn)


@app.get("/suras")
async def get_suras(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Sura))
    return result.scalars().all()


@app.get("/ayahs/{sura_number}")
async def get_ayahs(sura_number: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Ayah).where(Ayah.sura_number == sura_number))
    return result.scalars().all()


@app.get("/madhabs")
async def get_madhabs(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Madhab))
    return result.scalars().all()


@app.get("/tafsirs")
async def get_tafsirs(madhab_numbers: str, session: AsyncSession = Depends(get_session)):
    madhab_numbers = [int(mn) for mn in madhab_numbers.split(",")]
    result = await session.execute(select(Tafsir).where(Tafsir.madhab_number.in_(madhab_numbers)))
    tafsirs = result.scalars().all()
    # Include author_death and description in the response
    return [
        {
            "tafsir_number": tafsir.tafsir_number,
            "name": tafsir.name,
            "author_death": tafsir.author_death,
            "description": tafsir.description,
        }
        for tafsir in tafsirs
    ]


@app.get("/tafsirs/count")
async def get_tafsir_count(madhab_number: int, session: AsyncSession = Depends(get_session)):
    count = await session.execute(
        select(func.count(Tafsir.id)).where(Tafsir.madhab_number == madhab_number)
    )
    return count.scalar()


@app.get("/ayah/{sura_number}/{ayah_number}")
async def get_ayah(sura_number: int, ayah_number: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(
        select(Ayah).where(
            Ayah.sura_number == sura_number,
            Ayah.ayah_number == ayah_number
        )
    )
    ayah = result.scalars().first()
    if not ayah:
        raise HTTPException(status_code=404, detail="Ayah not found")
    return ayah


@app.get("/tafsir_texts/{sura_number}/{ayah_number}")
async def get_tafsir_texts(
    sura_number: int,
    ayah_number: int,
    tafsir_numbers: str,
    session: AsyncSession = Depends(get_session)
):
    try:
        logging.info(
            f"Fetching tafsir texts for sura {sura_number}, ayah {ayah_number} "
            f"with tafsir numbers {tafsir_numbers}"
        )
        tafsir_numbers = [int(tn) for tn in tafsir_numbers.split(",")]
        result = await session.execute(
            select(TafsirText).where(
                TafsirText.sura_number == sura_number,
                TafsirText.ayah_number == ayah_number,
                TafsirText.tafsir_number.in_(tafsir_numbers)
            )
        )
        tafsir_texts = result.scalars().all()
        logging.info(f"Found {len(tafsir_texts)} tafsir texts")
        return tafsir_texts
    except Exception as e:
        logging.error(f"Error fetching tafsir texts: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/search_tafsir")
async def search_tafsir(
    search_term: str,
    tafsir_numbers: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    include_total: bool = Query(False),
    session: AsyncSession = Depends(get_session)
):
    try:
        search_term = normalize_search_term(search_term)
        logging.info(
            f"Searching tafsirs for term '{search_term}' "
            f"with tafsir numbers {tafsir_numbers}"
        )
        tafsir_numbers = [int(tn) for tn in tafsir_numbers.split(",")]

        # Calculate offset for pagination
        offset = (page - 1) * limit

        # Use raw SQL so we can keep the joined search result shape lean.
        query = text("""
            SELECT 
                tt.id,
                tt.sura_number,
                tt.ayah_number,
                tt.text,
                s.name as sura_name,
                a.text_with_tashkeel as ayah_text,
                t.name as tafsir_name,
                t.author as author
            FROM 
                tafsir_texts tt
            JOIN 
                suras s ON tt.sura_number = s.sura_number
            JOIN 
                ayahs a ON tt.sura_number = a.sura_number AND tt.ayah_number = a.ayah_number
            JOIN 
                tafsirs t ON tt.tafsir_number = t.tafsir_number
            WHERE 
                tt.tafsir_number = ANY(:tafsir_numbers)
                AND tt.text ILIKE :search_pattern
            ORDER BY 
                tt.sura_number, tt.ayah_number
            LIMIT :limit_plus_one OFFSET :offset
        """)

        # Count total results for pagination info
        count_query = text("""
            SELECT 
                COUNT(*)
            FROM 
                tafsir_texts tt
            WHERE 
                tt.tafsir_number = ANY(:tafsir_numbers)
                AND tt.text ILIKE :search_pattern
        """)

        # Execute search query
        search_pattern = f"%{search_term}%"
        await force_custom_postgres_plan(session)
        result = await session.execute(
            query,
            {
                "tafsir_numbers": tafsir_numbers,
                "search_pattern": search_pattern,
                "limit_plus_one": limit + 1,
                "offset": offset
            }
        )
        search_results = result.mappings().all()
        has_more = len(search_results) > limit
        search_results = search_results[:limit]

        total_count = offset + len(search_results) if not has_more else None
        if include_total and has_more:
            await force_custom_postgres_plan(session)
            count_result = await session.execute(
                count_query,
                {
                    "tafsir_numbers": tafsir_numbers,
                    "search_pattern": search_pattern
                }
            )
            total_count = count_result.scalar_one()

        logging.info(
            f"Found {len(search_results)} results for search term "
            f"'{search_term}' (page {page})"
        )

        # Convert results to list of dictionaries
        results = [dict(row) for row in search_results]

        return {
            "results": results,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "has_more": has_more
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error searching tafsirs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


# NEW: search directly in Qur’an verses (ayahs)
@app.get("/search_ayahs")
async def search_ayahs(
    search_term: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    include_total: bool = Query(False),
    session: AsyncSession = Depends(get_session)
):
    """
    Search in Qur'anic verses (ayahs) by keyword.
    Looks into ayahs.text_with_tashkeel, ayahs.text and ayahs.text_english.
    """
    try:
        search_term = normalize_search_term(search_term)
        logging.info(
            f"Searching ayahs for term '{search_term}' "
            f"(page {page}, limit {limit})"
        )

        offset = (page - 1) * limit
        search_pattern = f"%{search_term}%"

        # Main query: verses + sura name
        query = text("""
            SELECT
                a.id,
                a.sura_number,
                a.ayah_number,
                COALESCE(a.text_with_tashkeel, a.text) AS ayah_text,
                s.name AS sura_name
            FROM
                ayahs a
            JOIN
                suras s ON a.sura_number = s.sura_number
            WHERE
                (a.text_with_tashkeel ILIKE :search_pattern
                 OR a.text ILIKE :search_pattern
                 OR a.text_english ILIKE :search_pattern)
            ORDER BY
                a.sura_number,
                a.ayah_number
            LIMIT :limit_plus_one OFFSET :offset
        """)

        # Count query for pagination
        count_query = text("""
            SELECT
                COUNT(*)
            FROM
                ayahs a
            WHERE
                (a.text_with_tashkeel ILIKE :search_pattern
                 OR a.text ILIKE :search_pattern
                 OR a.text_english ILIKE :search_pattern)
        """)

        await force_custom_postgres_plan(session)
        result = await session.execute(
            query,
            {
                "search_pattern": search_pattern,
                "limit_plus_one": limit + 1,
                "offset": offset
            }
        )
        rows = result.mappings().all()
        has_more = len(rows) > limit
        rows = rows[:limit]

        total_count = offset + len(rows) if not has_more else None
        if include_total and has_more:
            await force_custom_postgres_plan(session)
            count_result = await session.execute(
                count_query,
                {"search_pattern": search_pattern}
            )
            total_count = count_result.scalar_one()

        results = [dict(row) for row in rows]

        logging.info(
            f"Found {len(results)} ayahs for term '{search_term}' "
            f"(total {total_count if total_count is not None else 'skipped'}, page {page})"
        )

        return {
            "results": results,
            "total_count": total_count,
            "page": page,
            "limit": limit,
            "has_more": has_more
        }

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error searching ayahs: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
