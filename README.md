# tafasir.org

This GitHub repository contains the web application for `tafasir.org`.
The mobile app is a separate WebView wrapper around the web app and is not
included in this repository.

`tafasir.org` itself is a two-part application:

- A FastAPI backend that serves Qur'an and tafsir data from PostgreSQL.
- A React frontend (`tafasir-app/`) that calls backend endpoints under `/api`.

## Repository Layout

- `main.py`: FastAPI routes.
- `database.py`: SQLAlchemy async engine/session setup. It reads `DATABASE_URL` from the environment.
- `models.py`: SQLAlchemy ORM models for the application database.
- `start_app.sh`: Production startup script. It loads `/var/www/app/.env` if present.
- `tafasir-app/`: Create React App frontend.

## Backend API

Current documented routes:

- `GET /suras`
- `GET /ayahs/{sura_number}`
- `GET /madhabs`
- `GET /tafsirs?madhab_numbers=...`
- `GET /tafsirs/count?madhab_number=...`
- `GET /ayah/{sura_number}/{ayah_number}`
- `GET /tafsir_texts/{sura_number}/{ayah_number}?tafsir_numbers=...`
- `GET /search_tafsir?search_term=...&tafsir_numbers=...&page=...&limit=...`
- `GET /search_ayahs?search_term=...&page=...&limit=...`

The database now also contains normalized sect metadata and two read-only views
that can be used by future API endpoints or admin/reporting screens.

## Database Structure

The schema below reflects the live application database after the sect metadata
update applied on **2026-06-29**.

### Core Tables

- `languages`
  - PK: `id`
  - Unique: `language_number`
  - Columns: `id`, `language_number`, `name`

- `madhabs`
  - PK: `id`
  - Unique: `madhab_number`
  - Columns: `id`, `madhab_number`, `name`

- `sects`
  - PK: `id`
  - Unique: `sect_id`
  - Columns: `id`, `sect_id`, `name`
  - Indexes:
    - `ix_sects_name` on `name`

- `suras`
  - PK: `id`
  - Unique: `sura_number`
  - Columns: `id`, `sura_number`, `name`, `revelation_place_english`, `revelation_place_arabic`, `revelation_order`, `name_english`, `verses_count`, `pages`, `translated_name_english`

- `ayahs`
  - PK: `id`
  - Unique: `(sura_number, ayah_number)`
  - FKs:
    - `sura_number -> suras.sura_number`
    - `language_id -> languages.id`
  - Columns: `id`, `sura_number`, `ayah_number`, `text`, `language_id`, `text_with_tashkeel`, `text_english`

- `tafsirs`
  - PK: `id`
  - Unique: `tafsir_number`
  - FKs:
    - `language_number -> languages.language_number`
    - `madhab_number -> madhabs.madhab_number`
    - `sect_id -> sects.sect_id`
  - Columns: `id`, `tafsir_number`, `name`, `language_number`, `madhab_number`, `sect_id`, `author`, `book_name`, `author_death`, `description`, `description_ar`
  - Indexes:
    - `ix_tafsirs_sect_id` on `sect_id`

- `tafsir_texts`
  - PK: `id`
  - Unique: `(tafsir_number, sura_number, ayah_number)`
  - FKs:
    - `tafsir_number -> tafsirs.tafsir_number`
    - `sura_number -> suras.sura_number`
    - `(sura_number, ayah_number) -> ayahs(sura_number, ayah_number)`
    - `language_number -> languages.language_number`
    - `madhab_number -> madhabs.madhab_number`
  - Columns: `id`, `tafsir_number`, `sura_number`, `ayah_number`, `text`, `language_number`, `madhab_number`

### Sect Seed Data

The `sects` table contains these stable `sect_id` values:

| sect_id | name |
| ---: | --- |
| 2001 | إباضي |
| 2002 | أهل الحديث |
| 2003 | جعفري |
| 2004 | حنبلي |
| 2005 | حنفي |
| 2006 | زيدي |
| 2007 | سلفي |
| 2008 | شافعي |
| 2009 | ظاهري |
| 2010 | غير محدد |
| 2011 | مالكي |
| 2012 | متعدد |
| 2013 | معتزلي |

All existing rows in `tafsirs` have a non-null `sect_id` linked to this table.

### Schema Notes

- `madhabs` remains the broad source grouping already used by the app:
  - `1001`: تفاسير أهل السنة والجماعة
  - `1002`: تفاسير الشيعة الإثنى عشرية
  - `1003`: تفاسير الزيدية
  - `1004`: تفاسير الاباضية
- `sects` is a more granular per-tafsir classification seeded from the reviewed tafsir comprehensiveness report.
- `tafsirs.sect_id` should be treated as tafsir-work metadata. It is not per-ayah or per-quotation metadata.
- Existing endpoints that filter by `madhab_number` can continue to work unchanged. New app features can join through `sects` or use the views below.

### Views

#### `tafsirs_view`

Convenience view for tafsir metadata with human-readable madhab and sect names.

Columns:

- `id`
- `tafsir_number`
- `name`
- `author`
- `author_death`
- `sect_name`
- `madhab_name`

Example:

```sql
SELECT *
FROM tafsirs_view
ORDER BY tafsir_number;
```

#### `tafsirs_comprehensiveness_report_view`

Read-only report view that combines `tafsirs_view` metadata with live coverage
statistics calculated from `tafsir_texts` and `ayahs`.

Columns:

- `id`
- `tafsir_number`
- `name`
- `author`
- `author_death`
- `sect_name`
- `madhab_name`
- `tafsir_text_row_count`
- `nonempty_tafsir_text_row_count`
- `covered_ayah_count`
- `nonempty_covered_ayah_count`
- `total_quran_ayah_count`
- `missing_ayah_count`
- `coverage_percent`
- `nonempty_missing_ayah_count`
- `nonempty_coverage_percent`
- `total_text_characters`
- `average_characters_per_covered_ayah`
- `average_characters_per_nonempty_covered_ayah`

Example:

```sql
SELECT
    tafsir_number,
    name,
    sect_name,
    madhab_name,
    coverage_percent,
    total_text_characters
FROM tafsirs_comprehensiveness_report_view
ORDER BY tafsir_number;
```

### Approximate Table Sizes

- `tafsir_texts`: ~562,855 rows
- `ayahs`: ~6,236 rows
- `tafsirs`: ~130 rows
- `suras`: ~114 rows
- `sects`: ~13 rows
- `madhabs`: ~4 rows
- `languages`: ~3 rows

## Local Setup

### 1. Backend

1. Create an env file:

   ```bash
   cp .env.example .env
   ```

2. Set `DATABASE_URL` in `.env`.

3. Create a Python virtual environment and install dependencies:

   ```bash
   python3 -m venv .venv
   . .venv/bin/activate
   pip install fastapi uvicorn sqlalchemy asyncpg
   ```

4. Export env vars and run the backend:

   ```bash
   set -a
   . ./.env
   set +a
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

### 2. Frontend

```bash
cd tafasir-app
cp .env.example .env
npm install
npm start
```

## Download and Restore Database

The PostgreSQL database dump can be downloaded from:

[https://bit.ly/tafasir-db](https://bit.ly/tafasir-db)

Then it can be imported/restored using:

```bash
psql -h <host> -p 5432 -U <user> -d db_tafasir -f db_tafasir.sql
```

If the dump predates the 2026-06-29 sect update, apply the schema migration
that creates `sects`, fills `tafsirs.sect_id`, and creates the two views before
using sect-aware app features.
