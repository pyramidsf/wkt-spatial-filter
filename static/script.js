let wmsBaseUrl = null;
let geoLayer = null;
let currentWKT = null;
let currentLayerName = null;
let currentGeomColumn = null;

// mapa base para o carregamento de camadas
const drawSource = new ol.source.Vector();

const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({ source: new ol.source.OSM() }),
    new ol.layer.Vector({
      source: drawSource,
      style: new ol.style.Style({
        fill:   new ol.style.Fill({ color: 'rgba(0, 122, 255, 0.15)' }),
        stroke: new ol.style.Stroke({ color: '#007aff', width: 2 }),
      }),
    }),
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-47.9, -15.8]),
    zoom: 4,
  }),
});

const wktFormat = new ol.format.WKT();

// log helper 
function log(msg) {
  const logEl = document.getElementById('log');
  const empty = document.getElementById('empty-msg');
  if (empty) empty.remove();
  const entry = document.createElement('div');
  entry.className = 'entry';
  entry.textContent = `${new Date().toLocaleTimeString()} — ${msg}`;
  logEl.prepend(entry);
}

// carrega a camada do geoserver
async function carregarCamada() {
  const layerName = document.getElementById('layer-name').value.trim();
  const geomColumn = document.getElementById('geom-column').value.trim() || 'geom';

  if (!layerName) {
    alert('Informe o nome técnico da camada (ex: workspace:nome_da_camada).');
    return;
  }

  if (!wmsBaseUrl) {
    const resp = await fetch('/wms-base-url');
    const data = await resp.json();
    wmsBaseUrl = data.wms_url;
  }

  // se tiver uma camada ja carregada, remove ela
  if (geoLayer) {
    map.removeLayer(geoLayer);
  }

  geoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: wmsBaseUrl,
      params: {
        LAYERS: layerName,
        TILED: true,
        FORMAT: 'image/png',
        TRANSPARENT: true,
      },
      serverType: 'geoserver',
    }),
    opacity: 0.75,
  });

  map.addLayer(geoLayer);

  currentLayerName = layerName;
  currentGeomColumn = geomColumn;

  document.getElementById('info-layer').textContent = layerName;
  document.getElementById('cql-box').textContent = '—';

  log(`Camada "${layerName}" carregada (coluna geom: ${geomColumn})`);
}

// draw interaction
let drawInteraction = null;

function setDraw(type) {
  if (drawInteraction) {
    map.removeInteraction(drawInteraction);
  }

  document.querySelectorAll('.tool').forEach(b => b.classList.remove('active'));
  document.getElementById('btn-polygon').classList.add('active');

  drawInteraction = new ol.interaction.Draw({
    source: drawSource,
    type: type,
  });

  drawInteraction.on('drawend', (event) => {
    const geometry = event.feature.getGeometry();
    const geomClone = geometry.clone().transform('EPSG:3857', 'EPSG:4326');
    currentWKT = wktFormat.writeGeometry(geomClone);

    document.getElementById('wkt-box').textContent = currentWKT;
    document.getElementById('btn-filter').disabled = !currentLayerName;

    log('Polígono desenhado — WKT gerado.');
  });

  map.addInteraction(drawInteraction);
}

function clearDraw() {
  drawSource.clear();
  currentWKT = null;
  document.getElementById('wkt-box').textContent = '—';
  document.getElementById('cql-box').textContent = '—';
  document.getElementById('btn-filter').disabled = true;

  // tira o filtro da camada (se tiver)
  if (geoLayer) {
    geoLayer.getSource().updateParams({ CQL_FILTER: undefined });
  }

  log('Desenho e filtro limpos.');
}

// aplica o filtro
async function aplicarFiltro() {
  if (!currentWKT || !currentLayerName) {
    alert('Desenhe um polígono e carregue uma camada antes.');
    return;
  }

  log('Enviando WKT ao backend para montar o filtro...');

  const resp = await fetch('/apply-filter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      layer_name: currentLayerName,
      geometry_column: currentGeomColumn,
      wkt: currentWKT,
    }),
  });

  const data = await resp.json();

  if (data.status === 'ok') {
    document.getElementById('cql-box').textContent = data.cql_filter;

    // aplica o filtro diretamente na camada do geoserver via openlayers 
    geoLayer.getSource().updateParams({ CQL_FILTER: data.cql_filter });

    log('Filtro aplicado na camada — apenas feições dentro do polígono aparecem agora.');
  } else {
    log('Erro ao aplicar filtro.');
  }
}