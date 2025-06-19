#!/bin/bash

# * chmod +x ./prisma/apply-sql.sh
# * ./prisma/apply-sql.sh

export $(grep -v '^#' .env | xargs)

# * Apply triggers
psql -d "$POSTGRES_URL" -f prisma/sql/triggers/apply-triggers.sql

if [ $? -eq 0 ]; then
  echo "[OK] SQL applied successfully"
else
  echo "[FAIL] Failed to apply SQL"
  exit 1
fi
