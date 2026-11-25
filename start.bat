@echo off
REM ReTech Nepal - start script (Windows)
cd /d "%~dp0backend"

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

if not exist prisma\dev.db (
  echo Creating database...
  call npx prisma db push
  echo Seeding demo data...
  call npm run seed
)

echo Starting ReTech Nepal on http://localhost:4000 ...
start "" http://localhost:4000
call npm run dev