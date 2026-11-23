import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type Map from '@arcgis/core/Map';

/** Public ArcGIS services. Names of attribute fields can vary between services. */
const CANADA_URL = 'https://services.arcgis.com/EgePHk52tsFjmhbJ/ArcGIS/rest/services/Canada_Provinces/FeatureServer/0';
const USA_URL = 'https://services.arcgis.com/o6oETlrWetREI1A2/ArcGIS/rest/services/States_LQ/FeatureServer/0';

/** Use a full-name attribute, never an abbreviation/code. */
function findNameField(layer: FeatureLayer, preferred: string[]): string | undefined {
  const fields = layer.fields.filter(f => f.type === 'string');
  for (const candidate of preferred) {
    const match = fields.find(f => f.name.toLowerCase() === candidate.toLowerCase());
    if (match) return match.name;
  }
  // Fall back only to fields explicitly describing a state/province name.
  const match = fields.find(f => /^(province|prov|state|territory)[_ ]?name$/i.test(f.name));
  return match?.name;
}

async function enableFullNameLabels(layer: FeatureLayer, preferred: string[]): Promise<void> {
  try {
    await layer.load();
    const nameField = findNameField(layer, preferred);
    if (!nameField) {
      console.warn(`${layer.title}: no full-name field found. Available fields:`, layer.fields.map(f => f.name));
      return;
    }
    layer.labelingInfo = [{
      labelExpressionInfo: { expression: `$feature[${JSON.stringify(nameField)}]` },
      symbol: {
        type: 'text',
        color: '#1d2939',
        haloColor: '#ffffff',
        haloSize: 1.5,
        font: { family: 'Arial', size: 10, weight: 'bold' }
      },
      labelPlacement: 'always-horizontal',
      minScale: 0,
      maxScale: 0
    } as __esri.LabelClassProperties];
    layer.labelsVisible = true;
    layer.popupTemplate = {
      title: `{${nameField}}`,
      content: [{ type: 'fields', fieldInfos: [{ fieldName: nameField, label: 'Name' }] }]
    };
    console.info(`${layer.title}: labeling with ${nameField}`);
  } catch (error) {
    console.error(`${layer.title}: failed to load or configure labels`, error);
  }
}

export function addBoundaryLayers(map: Map) {
  const canadaProvinces = new FeatureLayer({
    id: 'canada-provinces', url: CANADA_URL,
    title: 'Canada Provinces and Territories', visible: true, opacity: 0.8,
    outFields: ['*'],
    renderer: {
      type: 'simple', symbol: {
        type: 'simple-fill', color: [40, 130, 210, 25],
        outline: { color: [0, 90, 190, 255], width: 1.5 }
      }
    } as __esri.SimpleRendererProperties,
    popupEnabled: true
  });

  const usStates = new FeatureLayer({
    id: 'us-states', url: USA_URL,
    title: 'United States - States', visible: true, opacity: 0.8,
    outFields: ['*'],
    renderer: {
      type: 'simple', symbol: {
        type: 'simple-fill', color: [235, 110, 65, 25],
        outline: { color: [210, 75, 35, 255], width: 1.5 }
      }
    } as __esri.SimpleRendererProperties,
    popupEnabled: true
  });

  map.addMany([canadaProvinces, usStates]);
  void enableFullNameLabels(canadaProvinces, [
    'PRENAME', 'PRENAME_EN', 'PRNAME', 'ProvinceName', 'Province_Name',
    'PROV_NAME', 'NAME_EN', 'NAME', 'Name'
  ]);
  void enableFullNameLabels(usStates, [
    'STATE_NAME', 'State_Name', 'StateName', 'NAME', 'Name'
  ]);
  return { canadaProvinces, usStates };
}
