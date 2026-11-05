#!/usr/bin/env bash

export NEXT_PUBLIC_API_BASE_URL="http://$(ipconfig getifaddr en0):8000"

NEXT_PUBLIC_API_BASE_URL="${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8000}"
echo "NEXT_PUBLIC_API_BASE_URL: $NEXT_PUBLIC_API_BASE_URL"
export APP_VARIANT=development
export APP_ENV=development

# export API_BASE_URL=https://your-ngrok-url ./start-server.sh

# npx expo start --clear
npm run dev --reload
