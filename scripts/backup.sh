#!/bin/sh
# Hostel Grievance System (HGS) - Automated PostgreSQL Backup Script
set -e

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_CONTAINER="${DB_CONTAINER:-hgs-postgres}"
DB_NAME="${DB_NAME:-hgs_db}"
DB_USER="${DB_USER:-hgs_user}"

mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/hgs_backup_${TIMESTAMP}.sql.gz"

echo "=== Starting HGS Database Backup at $(date) ==="

# Check if running within Docker or local host
if docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
    echo "Running pg_dump inside Docker container: $DB_CONTAINER..."
    docker exec "$DB_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
else
    echo "Running pg_dump directly on host..."
    pg_dump -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"
fi

echo "Backup completed successfully: $BACKUP_FILE (Size: $(du -h "$BACKUP_FILE" | cut -f1))"

# Retention Policy: keep backups for 30 days, purge older ones
find "$BACKUP_DIR" -name "hgs_backup_*.sql.gz" -type f -mtime +30 -delete
echo "Retention check complete (retained files younger than 30 days)."
