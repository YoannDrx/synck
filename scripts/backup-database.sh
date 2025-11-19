#!/bin/bash

# Load environment variables
source .env

# Create backups directory if it doesn't exist
mkdir -p backups

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/synck_backup_${TIMESTAMP}.sql"

echo "🔄 Creating database backup..."
echo "   File: $BACKUP_FILE"

# Create backup using pg_dump
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created successfully!"
    echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
    echo "   Location: $BACKUP_FILE"

    # List recent backups
    echo ""
    echo "Recent backups:"
    ls -lht backups/ | head -6
else
    echo "❌ Backup failed!"
    exit 1
fi
