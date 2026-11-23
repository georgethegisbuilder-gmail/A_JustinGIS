import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import GISMap from './components/GISMap';
import type { GISLocation } from './types';
const GET_LOCATIONS = gql`query Locations { locations { id name description latitude longitude } }`;
export default function App() {
  const [ready, setReady] = useState(false);
  const { data, loading, error, refetch } = useQuery<{ locations: GISLocation[] }>(GET_LOCATIONS);
  const locations = data?.locations ?? [];
  return <div className="shell">
    <header><div className="brand"><span className="brand-icon">◎</span><div><h1>JustinGIS</h1><small>North America GIS Explorer</small></div></div><span className="pill">{ready ? '● Map ready' : '○ Loading map'}</span></header>
    <main><aside><div className="section-title">OVERVIEW</div><h2>Explore locations</h2><p>ArcGIS Maps SDK for JavaScript with a GraphQL + PostGIS spatial backend.</p><div className="stats"><div><strong>{locations.length}</strong><span>Locations</span></div><div><strong>US + CA</strong><span>Default extent</span></div></div><div className="section-title">POSTGIS DATA</div>{loading ? <p>Loading locations…</p> : error ? <div className="notice">Backend unavailable. Start the GraphQL server and verify your database connection.<div className="detail">{error.message}</div></div> : locations.length === 0 ? <p>No locations yet. Add records to the PostGIS database.</p> : <ul>{locations.map(l => <li key={l.id}><strong>{l.name}</strong><span>{l.latitude.toFixed(3)}, {l.longitude.toFixed(3)}</span></li>)}</ul>}<button onClick={() => void refetch()}>Refresh locations</button></aside><section className="map-wrap"><GISMap locations={locations} onMapReady={setReady}/><div className="map-label">United States & Canada</div></section></main>
    <footer>JustinGIS · React + ArcGIS Maps SDK + Apollo GraphQL + PostgreSQL/PostGIS</footer>
  </div>;
}
