-- Applied on first Postgres start by init-databases.sh.
-- Main DB is created via POSTGRES_DB (${DB_NAME}) in docker-compose.
-- Placeholders are filled from container env (docker-compose env_file: .env).
CREATE DATABASE "${DB_EVENTS_NAME}";