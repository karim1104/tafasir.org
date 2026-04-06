# tafasir.org

This GitHub repository contains the web application for `tafasir.org`.
The mobile app is a separate WebView wrapper around the web app and is not included in this repository.

`tafasir.org` itself is a two-part application:

- A FastAPI backend that serves Qur'an/Tafsir data from PostgreSQL.
- A React frontend (`tafasir-app/`) that calls backend endpoints under `/api`.

## Repository Layout

- `main.py`: FastAPI routes.
- `database.py`: SQLAlchemy async engine/session setup (reads `DATABASE_URL` from env).
- `models.py`: SQLAlchemy ORM models.
- `start_app.sh`: production startup script (loads `/var/www/app/.env` if present).
- `tafasir-app/`: Create React App frontend.

## Backend API (Current Routes)

- `GET /suras`
- `GET /ayahs/{sura_number}`
- `GET /madhabs`
- `GET /tafsirs?madhab_numbers=...`
- `GET /tafsirs/count?madhab_number=...`
- `GET /ayah/{sura_number}/{ayah_number}`
- `GET /tafsir_texts/{sura_number}/{ayah_number}?tafsir_numbers=...`
- `GET /search_tafsir?search_term=...&tafsir_numbers=...&page=...&limit=...`
- `GET /search_ayahs?search_term=...&page=...&limit=...`

## Database Structure

The schema below was read from the live PostgreSQL database on **2026-02-26**.

### Tables

- `languages`
  - PK: `id`
  - Unique: `language_number`
  - Columns: `id`, `language_number`, `name`
- `madhabs`
  - PK: `id`
  - Unique: `madhab_number`
  - Columns: `id`, `madhab_number`, `name`
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
  - Columns: `id`, `tafsir_number`, `name`, `language_number`, `madhab_number`, `author`, `book_name`, `author_death`, `description`, `description_ar`
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

### Approximate Table Sizes

- `tafsir_texts`: ~562,855 rows
- `ayahs`: ~6,236 rows
- `tafsirs`: ~130 rows
- `suras`: ~114 rows
- `madhabs`: ~4 rows
- `languages`: ~3 rows

## Local Setup

### 1. Backend

1. Create env file:
   - `cp .env.example .env`
   - Set `DATABASE_URL` in `.env`.
2. Create Python venv and install dependencies:
   - `python3 -m venv .venv`
   - `. .venv/bin/activate`
   - `pip install fastapi uvicorn sqlalchemy asyncpg`
3. Export env vars and run:
   - `set -a; . ./.env; set +a`
   - `uvicorn main:app --host 0.0.0.0 --port 8000`

### 2. Frontend

1. `cd tafasir-app`
2. `cp .env.example .env`
3. `npm install`
4. `npm start`

### Download and Restore Database

The PostgreSQL database .sql dump can be downloaded from:

[https://bit.ly/tafasir-db](https://bit.ly/tafasir-db)


Then it can imported/restored using:

```bash

psql -h <host> -p 5432 -U <user> -d db_tafasir -f db_tafasir.sql
```

