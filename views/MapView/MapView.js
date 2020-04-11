/* globals L */
import GoldenLayoutView from '../common/GoldenLayoutView.js';

class MapView extends GoldenLayoutView {
  constructor (argObj) {
    argObj.resources = [
      { type: 'css', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css' },
      { type: 'js', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js' },
      { type: 'json', url: './views/MapView/Hospitals.geojson', name: 'hospitals' },
      { type: 'less', url: './views/MapView/style.less' }
    ];
    super(argObj);

    window.controller.houses.on('dataUpdated', () => { this.render(); });
  }
  get title () {
    return 'Map';
  }
  setup () {
    super.setup();
    // div holding the actual map elements
    const mapContainer = this.content.append('div')
      .attr('id', 'mapcontainer').node();

    this.leafletMap = this.makeMap(mapContainer);
  }
  makeMap (mapContainer) {
    const map = L.map(mapContainer, {
      center: [32.253460, -110.911789], // latitude, longitude in decimal degrees (find it on Google Maps with a right click!)
      zoom: 12, // can be 0-22, higher is closer
      scrollWheelZoom: true // don't zoom the map on scroll
    });
    map.invalidateSize();
    L.tileLayer(
      'https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}@2x.png' // stamen toner tiles
      // stamen toner tiles
    ).addTo(map);

    // now add the hospitals
    const newIcon = L.icon({
      iconSize: [10, 20],
      iconUrl: './views/MapView/hospital_icon.svg'
    });
    const markerSetFunc = (gjpt, latlng) => {
      // substitute the newIcon as the marker
      return L.marker(latlng, {
        icon: newIcon
      });
    };
    L.geoJSON(this.getNamedResource('hospitals'), {
      pointToLayer: markerSetFunc
    }).bindPopup(l => {
      return l.feature.properties.name;
    }).on('click', (e) => {
      console.log('clicked hospital', e);
      // circle
      L.circle(e.latlng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 500
      }).addTo(map);
    }).addTo(map);

    return map;
  }
  draw () {
    super.draw();
    if (this.isHidden || this.isLoading) {
      return;
    }
    this.leafletMap.invalidateSize();

    // Update the house markers
    const houseIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/house_icon.svg'
    });
    window.controller.houses.getValues().map(house => {
      // has lat lng
      if (house.lat !== 'fail') {
        L.marker([house.lat, house.lng], {
          icon: houseIcon
        }).addTo(this.leafletMap)
          .bindPopup(`<p>House Located: ${house['Property Address ']}</p>
                      <p>Contact: ${house['Primary Contact Name']},
                        ${house['Primary Contact Email Address']},
                        ${house['Primary Contact Phone Number']}`);
      }
    });
  }
}

export default MapView;
