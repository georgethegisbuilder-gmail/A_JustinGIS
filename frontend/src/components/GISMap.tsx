import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Extent from '@arcgis/core/geometry/Extent';
import Home from '@arcgis/core/widgets/Home';
import Zoom from '@arcgis/core/widgets/Zoom';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { addBoundaryLayers } from '../layers/boundaryLayers';
import type { GISLocation } from '../types';

type Props = { locations: GISLocation[]; onMapReady?: (ready: boolean) => void };
export default function GISMap({ locations, onMapReady }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const layerRef = useRef<GraphicsLayer | null>(null);
  useEffect(() => {
    if (!divRef.current) return;
    const graphics = new GraphicsLayer({ title: 'GIS Locations' });
    const map = new Map({ basemap: 'osm', layers: [graphics] });
    const { canadaProvinces, usStates } = addBoundaryLayers(map);
    // Keep PostGIS point markers above the boundary polygons.
    map.reorder(graphics, map.layers.length - 1);
    const initialExtent = new Extent({ xmin: -168, ymin: 23, xmax: -52, ymax: 74, spatialReference: { wkid: 4326 } });
    const view = new MapView({ container: divRef.current, map, extent: initialExtent, ui: { components: ['attribution'] } });
    view.ui.add(new Zoom({ view }), 'top-right');
    view.ui.add(new Home({ view }), 'top-right');
    const layerList = new LayerList({ view });
    const layerListExpand = new Expand({
      view,
      content: layerList,
      expanded: true,
      expandIcon: 'layers',
      expandTooltip: 'Show GIS Layers'
    });
    view.ui.add(layerListExpand, 'top-right');
    void Promise.allSettled([canadaProvinces.load(), usStates.load()]).then(results => {
      for (const [i, result] of results.entries()) {
        const name = i === 0 ? 'Canada Provinces' : 'US States';
        if (result.status === 'rejected') console.error(`${name} layer failed to load:`, result.reason);
      }
    });
    viewRef.current = view;
    layerRef.current = graphics;
    void view.when().then(() => onMapReady?.(true)).catch(console.error);
    return () => { onMapReady?.(false); viewRef.current = null; layerRef.current = null; view.destroy(); };
  }, []);
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.removeAll();
    locations.forEach((loc) => layer.add(new Graphic({
      geometry: new Point({ longitude: loc.longitude, latitude: loc.latitude }),
      symbol: { type: 'simple-marker', color: '#1e88e5', size: 11, outline: { color: '#ffffff', width: 1.5 } } as __esri.SimpleMarkerSymbolProperties,
      attributes: { name: loc.name, description: loc.description || '' },
      popupTemplate: { title: '{name}', content: '{description}' }
    })));
  }, [locations]);
  return <div ref={divRef} className="map" aria-label="Interactive GIS map of United States and Canada" />;
}
