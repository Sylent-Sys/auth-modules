#!/bin/sh
set -e

echo "Starting Auth Modules Backend..."

# ========================================
# JWT Keys Generation/Loading
# ========================================
KEYS_DIR="${KEYS_DIR:-/app/keys}"
PRIVATE_KEY_FILE="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY_FILE="$KEYS_DIR/jwt-public.pem"

echo "✅ JWT keys loaded successfully!"
# Generate keys if they don't exist
/app/generate-jwt-keys.sh

# Load keys from files if environment variables are not set
if [ -z "$JWT_PRIVATE_KEY" ] && [ -f "$PRIVATE_KEY_FILE" ]; then
    echo "Loading JWT private key from file..."
    export JWT_PRIVATE_KEY=$(cat "$PRIVATE_KEY_FILE")
fi

if [ -z "$JWT_PUBLIC_KEY" ] && [ -f "$PUBLIC_KEY_FILE" ]; then
    echo "Loading JWT public key from file..."
    export JWT_PUBLIC_KEY=$(cat "$PUBLIC_KEY_FILE")
fi

# Verify keys are available
if [ -z "$JWT_PRIVATE_KEY" ] || [ -z "$JWT_PUBLIC_KEY" ]; then
    echo "JWT keys are not available. Please check your configuration."
    exit 1
fi

echo "JWT keys loaded successfully"

# ========================================
# Database Migration
# ========================================

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
