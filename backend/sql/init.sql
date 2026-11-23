-- Run against the justingis database. PostGIS must be installed on the PostgreSQL server.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE SCHEMA IF NOT EXISTS gis;
CREATE TABLE IF NOT EXISTS gis.locations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name varchar(150) NOT NULL,
  description text,
  geom geometry(Point,4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_locations_geom ON gis.locations USING GIST (geom);
-- Only seed an empty table (safe to rerun).
INSERT INTO gis.locations (name, description, geom)
SELECT v.name, v.description, ST_SetSRID(ST_MakePoint(v.longitude,v.latitude),4326)
FROM (VALUES
 ('Calgary', 'Alberta, Canada', -114.0719::float8, 51.0447::float8),
 ('Vancouver', 'British Columbia, Canada', -123.1207::float8, 49.2827::float8),
 ('Toronto', 'Ontario, Canada', -79.3832::float8, 43.6532::float8),
 ('New York', 'New York, United States', -74.0060::float8, 40.7128::float8),
 ('Los Angeles', 'California, United States', -118.2437::float8, 34.0522::float8)
) AS v(name,description,longitude,latitude)
WHERE NOT EXISTS (SELECT 1 FROM gis.locations);
