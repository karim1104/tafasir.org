#!/bin/bash

# Export variables from /var/www/app/.env if present.
if [ -f /var/www/app/.env ]; then
  set -a
  # shellcheck disable=SC1091
  . /var/www/app/.env
  set +a
fi

# Navigate to the React app directory and build it
cd /var/www/app/tafasir-app
npm run build

# Navigate to the FastAPI app directory and start the FastAPI server
cd /var/www/app
/usr/bin/env uvicorn main:app --host 0.0.0.0 --port 8000
