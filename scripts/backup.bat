@echo off
REM Hostel Grievance System (HGS) - Windows PostgreSQL Backup Script
setlocal enabledelayedexpansion

set BACKUP_DIR=.\backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

set BACKUP_FILE=%BACKUP_DIR%\hgs_backup_%TIMESTAMP%.sql

echo Starting HGS Database Backup...
docker exec hgs-postgres pg_dump -U hgs_user hgs_db > "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Backup created successfully at %BACKUP_FILE%
) else (
    echo Backup failed with error code %ERRORLEVEL%
)
