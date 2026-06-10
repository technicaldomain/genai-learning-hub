#!/bin/bash
# Register a new OIDC client with the mock provider
# Usage: ./register-oidc-client.sh [redirect_uri]

set -euo pipefail

REDIRECT_URI="${1:-http://localhost:4200/auth/callback}"

echo "Registering OIDC client with redirect_uri: $REDIRECT_URI"

RESPONSE=$(curl -s -X POST "https://oidc-mock.technicaldomain.xyz/oauth2/clients" \
  -H "Content-Type: application/json" \
  -d "{
    \"redirect_uris\": [\"$REDIRECT_URI\"],
    \"token_endpoint_auth_method\": \"none\",
    \"grant_types\": [\"authorization_code\"],
    \"response_types\": [\"code\"]
  }")

CLIENT_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['client_id'])")
CLIENT_SECRET=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['client_secret'])")

echo ""
echo "✓ Client registered successfully!"
echo ""
echo "Add these to your apps/backend/.env file:"
echo ""
echo "OIDC_AUTHORITY=https://oidc-mock.technicaldomain.xyz"
echo "OIDC_CLIENT_ID=$CLIENT_ID"
echo "OIDC_REDIRECT_URI=$REDIRECT_URI"
echo ""
echo "Then run: uv run uvicorn app.main:app --reload --port 8000"
