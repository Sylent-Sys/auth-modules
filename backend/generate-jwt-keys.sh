#!/bin/sh
# Script to generate RSA key pair for JWT RS256
# Keys are stored in /app/keys directory (volume mounted)

KEYS_DIR="${KEYS_DIR:-/app/keys}"
PRIVATE_KEY_FILE="$KEYS_DIR/jwt-private.pem"
PUBLIC_KEY_FILE="$KEYS_DIR/jwt-public.pem"

# Create keys directory if it doesn't exist
mkdir -p "$KEYS_DIR"

# Check if keys already exist
if [ -f "$PRIVATE_KEY_FILE" ] && [ -f "$PUBLIC_KEY_FILE" ]; then
    echo "🔐 JWT keys already exist, skipping generation..."
    exit 0
fi

echo "Generating new RSA key pair for JWT RS256..."

# Generate 2048-bit RSA private key
openssl genrsa -out "$PRIVATE_KEY_FILE" 2048 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Failed to generate private key"
    exit 1
fi

# Extract public key from private key
openssl rsa -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "Failed to generate public key"
    rm -f "$PRIVATE_KEY_FILE"
    exit 1
fi

# Set appropriate permissions
chmod 600 "$PRIVATE_KEY_FILE"
chmod 644 "$PUBLIC_KEY_FILE"

echo "JWT keys generated successfully."
echo "   Private key: $PRIVATE_KEY_FILE"
echo "   Public key:  $PUBLIC_KEY_FILE"
