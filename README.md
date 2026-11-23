# JustinGIS

Full-stack GIS starter: React + Vite + TypeScript + ArcGIS Maps SDK for JavaScript; Node.js + Apollo GraphQL; PostgreSQL + PostGIS.

## Prerequisites
- Node.js 22 LTS or newer
- PostgreSQL with PostGIS installed and enabled (e.g. PostgreSQL 16/17 + matching PostGIS package)
- npm

## 1. Database
Create a PostgreSQL database named `justingis` (e.g. `createdb -U postgres justingis`). Then run:

```bash
psql -U postgres -d justingis -f backend/sql/init.sql
```

The script creates `gis.locations`, a GiST spatial index, and five sample points. Your PostgreSQL user must have permission to create the PostGIS extension (or ask your database administrator).

## 2. Backend

```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL in .env with your actual PostgreSQL credentials
npm install
npm run dev
```

On Windows PowerShell, replace `cp` with `Copy-Item` (or use `copy`).

- GraphQL: http://localhost:4000/graphql
- Health: http://localhost:4000/health

Example query:

```graphql
query {
  locations { id name description latitude longitude }
  locationsInBBox(minLongitude: -130, minLatitude: 30, maxLongitude: -60, maxLatitude: 60) { name latitude longitude }
}
```

## 3. Frontend
In a separate terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173. The initial map extent includes the United States and Canada. The public OpenStreetMap basemap does not require an ArcGIS API key. Some Esri services and basemaps do require credentials; configure those separately if you switch basemaps.

## Build
In each subfolder run `npm run build`.

## Architecture
- `frontend/src/components/GISMap.tsx`: ArcGIS MapView, initial extent, and PostGIS point markers
- `frontend/src/App.tsx`: sidebar and Apollo GraphQL query
- `backend/src/graphql`: schema and resolvers; parameterized bounding-box query
- `backend/src/db`: PostgreSQL connection pool
- `backend/sql/init.sql`: PostGIS schema, sample data, spatial index

This is a local development starter, not a production-ready security configuration. Add authentication, authorization, pagination, environment-specific CORS, logging, and deployment configuration before production use.


## Public boundary layers (added)

`frontend/src/layers/boundaryLayers.ts` defines public ArcGIS FeatureLayers for Canada provinces/territories and US states. `frontend/src/components/GISMap.tsx` adds them to the existing map and provides an expandable Layer List. The PostGIS point markers remain on top. These layers are hosted by third parties and require internet access; verify their availability if a layer fails to load.
