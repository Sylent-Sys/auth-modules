#!/bin/sh
set -e

echo "Starting Auth Modules Backend..."

# Wait for database to be ready
echo "Waiting for database connection..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if bun run src/migrations/migrate.ts run --yes 2>/dev/null; then
        echo "Database migrations completed successfully!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Database not ready, retrying in 2 seconds... ($RETRY_COUNT/$MAX_RETRIES)"
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "Failed to connect to database after $MAX_RETRIES attempts"
    exit 1
fi

# Start the server with clustering
echo "Starting server on port ${PORT:-3000} in cluster mode..."
exec bun run src/index.ts
