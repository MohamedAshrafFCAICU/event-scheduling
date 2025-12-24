#!/bin/bash
set -e

echo "========================================"
echo "Initializing Event Scheduling Database..."
echo "========================================"

# Create user with password and grant privileges
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create auth_user if doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'auth_user') THEN
            CREATE USER auth_user WITH PASSWORD 'mohamed2004###';
        END IF;
    END
    \$\$;
    
    -- Grant privileges
    GRANT ALL PRIVILEGES ON DATABASE event_scheduling_db TO auth_user;
    ALTER USER auth_user CREATEDB;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO auth_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO auth_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO auth_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO auth_user;
    
    -- Log success
    SELECT 'Database initialization completed!' as status;
EOSQL

echo "========================================"
echo "✓ Database initialization completed!"
echo "========================================"