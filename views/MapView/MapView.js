/* globals L, d3 */
import GoldenLayoutView from '../common/GoldenLayoutView.js';

class MapView extends GoldenLayoutView {
  constructor (argObj) {
    argObj.resources = [
      { type: 'css', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css' },
      { type: 'js', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js' },
      { type: 'json', url: './views/MapView/Hospitals.geojson', name: 'hospitals' },
      { type: 'json', url: './views/MapView/az_zip.geojson', name: 'ziplines' },
      { type: 'less', url: './views/MapView/style.less' }
    ];
    super(argObj);

    this.houseMarkers = {};
    this.hospitalCircle = null;

    window.controller.appState.on('hospitalSelection', () => { this.render(); });
    window.controller.appState.on('zipSelection', () => { this.render(); });
    window.controller.appState.on('houseSelection', () => { this.render(); });
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

    // for each hospitalhouse as key, simply mark true, and break out of the looping if so
    this.hospitalHousePairs = {};
    this.leafletMap = this.makeMap(mapContainer);
    // add the input line for searching zips
    // must have input line, that searches on change
    // do on change call the window controller, then have the window.controller.appstate on(zipinput)
    const inputContainer = this.content.insert('div', '#mapcontainer');
    inputContainer.attr('id', 'zipInputHolder');
    this.makeZipInput(inputContainer);
  }
  makeZipInput (inputContainer) {
    // add textual description
    let title = inputContainer.append('p');
    title.text('ZipCode Selector');

    // add an input

    let inp = inputContainer.append('input');
    inp.attr('id', 'zipInput');
    inp.on('input', () => {
      const zip = inp.node().value;
      if (zip.length === 5) {
        // Only bother changing state when a valid zip code has been entered
        window.controller.appState.selectZip(zip);
      }
    });
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
      window.controller.appState.selectHospital(e);
    }).addTo(map);
    // add the zip codes
    let zipEventHelper = (feature, layer) => {
      layer.on({
        click: zip => { window.controller.appState.selectZip(zip); } // needs to be wrapped in a function or else selectZip will get called with this === the leaflet instance, not appState
      });
    };
    this.zipGeoJson = L.geoJSON(this.getNamedResource('ziplines'), {
      onEachFeature: zipEventHelper,
      className: 'zipBoundary'
    }).addTo(map);

    return map;
  }
  draw () {
    super.draw();
    if (this.isHidden || this.isLoading) {
      return;
    }
    this.leafletMap.invalidateSize();

    this.updateHospitalCircle();
    this.updateHouseMarkers();
    this.updateZipLayers();
    this.updateZipInput();
  }
  updateHouseMarkers () {
    const blackHouseIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/house_icon.svg'
    });
    const greyHouseIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/grey_house_icon.svg'
    });
    // First pass through houses that pass all filters
    const housesThatPassed = {};
    window.controller.houses.getValues().forEach(house => {
      // Only show houses that have lat lng and pass all the filters
      if (house.lat !== 'fail' && house.passesAllFilters) {
        const markerKey = house.lat + ',' + house.lng;
        housesThatPassed[markerKey] = true;
        if (this.houseMarkers[markerKey]) {
          // This house marker already exists, make sure it has a black icon
          this.houseMarkers[markerKey].setIcon(blackHouseIcon);
        } else {
          // Create a new black marker
          this.houseMarkers[markerKey] = L.marker([house.lat, house.lng], {
            icon: blackHouseIcon
          }).addTo(this.leafletMap)
            .bindPopup(`<p>House Located: ${house['Property Address ']}</p>
                        <p>Contact: ${house['Primary Contact Name']},
                          ${house['Primary Contact Email Address']},
                          ${house['Primary Contact Phone Number']}`)
            .on('click', (e) => {
              window.controller.appState.selectHouse(house['Timestamp']);
            });
        }
      }
    });
    // Grey out any markers that didn't pass the filters
    for (const [markerKey, marker] of Object.entries(this.houseMarkers)) {
      if (!housesThatPassed[markerKey]) {
        marker.setIcon(greyHouseIcon);
      }
    }
  }
  updateHospitalCircle () {
    const selectedHospital = window.controller.appState.selectedHospital;
    if (selectedHospital) {
      // A hospital is selected; in case it's not the same as before, replace
      // the circle
      if (this.hospitalCircle && this.hospitalCircle !== null) {
        // Remove the old circle
        this.hospitalCircle.remove();
      }
      // Add (or move) the circle to the clicked hospital
      this.hospitalCircle = L.circle(selectedHospital.latlng, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 2414.016
      }).addTo(this.leafletMap);
    } else {
      if (this.hospitalCircle) {
        // There's no longer a hospital selection; remove the circle
        this.hospitalCircle.remove();
        this.hospitalCircle = null;
      }
    }
  }
  updateZipLayers () {
    const zipNumber = window.controller.appState.selectedZip;
    this.zipGeoJson.eachLayer((layer) => {
      // set or clear the "selected" class
      d3.select(layer._path).classed('selected', zipNumber === layer.feature.properties['ZCTA5CE10']);
    });
  }
  updateZipInput () {
    this.d3el.select('#zipInput')
      .property('value', window.controller.appState.selectedZip || '');
  }
}

export default MapView;
