/* globals L */
import GoldenLayoutView from '../common/GoldenLayoutView.js';

class MapView extends GoldenLayoutView {
  constructor(argObj) {
    argObj.resources = [
      { type: 'css', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css' },
      { type: 'js', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js' },
      { type: 'json', url: './views/MapView/Hospitals.geojson', name: 'hospitals' },
      { type: "json", url: "./views/MapView/az_zip.geojson", name: "ziplines" },
      { type: 'less', url: './views/MapView/style.less' }
    ];
    super(argObj);

    this.houseMarkers = {};
    this.hospitalCircle = null;

    window.controller.appState.on('hospitalSelection', () => { this.render(); });
    window.controller.appState.on("zipClicked",()=> {this.render();})
    window.controller.houses.on('dataUpdated', () => { this.render(); });
  }
  get title() {
    return 'Map';
  }
  setup() {
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
    const inputContainer = this.content.append("div")
    this.makeZipInput(inputContainer)

    

  }
  makeZipInput(inputContainer) {
    // add an input
    let inp = inputContainer.append("input")
    inp.attr("id","zipInput")
    inp.on("input",()=> {
      window.controller.appState.zipInputChanged(inp.node().value)
    })
  }
  makeMap(mapContainer) {
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
        mouseover: window.controller.appState.hoverOverZip,
        mouseout: window.controller.appState.hoverOutZip,
        click: window.controller.appState.zipClick,
      })
    }
    window.controller.zipGeoJson = L.geoJSON(this.getNamedResource("ziplines"), {
      onEachFeature: zipEventHelper
    }).addTo(map)

    return map;
  }
  draw() {
    super.draw();
    if (this.isHidden || this.isLoading) {
      return;
    }
    this.leafletMap.invalidateSize();

    this.updateHouseMarkers();
    this.updateHospitalCircle();
  }
  updateHouseMarkers() {
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
                          ${house['Primary Contact Phone Number']}`);
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
  updateHospitalCircle() {
    const selectedHospital = window.controller.appState.selectedHospital;
    if (selectedHospital) {
      if (this.hospitalCircle) {
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

}

export default MapView;
