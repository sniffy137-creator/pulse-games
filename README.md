# Pulse Games

Local MVP: lobby, 5 games (Crash, Mines, Dice, Plinko, Limbo), JWT, PostgreSQL, admin.

> Demo without real money.

## Quick start (Mac)

```bash
git clone https://github.com/sniffy137-creator/pulse-games.git
cd pulse-games

docker run -d --name pulse-pg \
  -e POSTGRES_USER=pulse \
  -e POSTGRES_PASSWORD=pulse \
  -e POSTGRES_DB=pulse_games \
  -p 5433:5432 \
  postgres:16-alpine

cd backend
cp .env.example .env
npm install
export DATABASE_URL='postgres://pulse:pulse@localhost:5433/pulse_games'
sleep 3
npm run db:init
npm start
```

Other terminal:

```bash
cd pulse-games
python3 -m http.server 8080
```

Open http://localhost:8080/ and register (latin username, not email).

## Update after changes

```bash
cd pulse-games
git pull
```
