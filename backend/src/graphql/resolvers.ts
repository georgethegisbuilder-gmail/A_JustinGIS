import { pool } from '../db/pool';
const fields = `id, name, description, ST_Y(geom)::float8 AS latitude, ST_X(geom)::float8 AS longitude`;
export const resolvers = { Query: {
  health: () => 'ok',
  locations: async () => (await pool.query(`SELECT ${fields} FROM gis.locations ORDER BY name LIMIT 1000`)).rows,
  locationsInBBox: async (_: unknown, args: {minLongitude:number;minLatitude:number;maxLongitude:number;maxLatitude:number}) => {
    const { minLongitude, minLatitude, maxLongitude, maxLatitude } = args;
    if (![minLongitude,minLatitude,maxLongitude,maxLatitude].every(Number.isFinite) || minLongitude > maxLongitude || minLatitude > maxLatitude || minLongitude < -180 || maxLongitude > 180 || minLatitude < -90 || maxLatitude > 90) throw new Error('Invalid bounding box');
    return (await pool.query(`SELECT ${fields} FROM gis.locations WHERE geom && ST_MakeEnvelope($1,$2,$3,$4,4326) ORDER BY name LIMIT 1000`, [minLongitude,minLatitude,maxLongitude,maxLatitude])).rows;
  }
}};
