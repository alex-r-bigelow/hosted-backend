/* globals L, d3, uki */

class MapView extends uki.ui.goldenlayout.GLView {
  constructor (options) {
    options.resources = [
      { type: 'css', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css' },
      { type: 'js', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js' },
      { type: 'json', url: './views/MapView/Hospitals.geojson', name: 'hospitals' },
      { type: 'json', url: './views/MapView/az_zip.geojson', name: 'ziplines' },
      { type: 'less', url: './views/MapView/style.less' }
    ];
    super(options);

    this.houseMarkers = {};
    this.hospitalCircle = null;
  }
  get title () {
    return 'Map';
  }
  setup () {
    super.setup(...arguments);

    this.d3el.classed('MapView', true);

    window.controller.appState.on('hospitalSelection', () => { this.render(); });
    window.controller.appState.on('housingFiltersChanged', () => { this.render(); });
    window.controller.appState.on('zipSelection', () => { this.render(); });
    window.controller.appState.on('houseSelection', () => {
      // We do the popup update outside of the regular render/setup/draw call
      // because we don't want to keep re-opening the popup if the user closed
      // it already
      this.updatePopup();
      this.render();
    });
    window.controller.houses.on('dataUpdated', () => { this.render(); });
    window.controller.houses.on('headersUpdated', () => { this.render(); });

    // div holding the actual map elements
    const mapContainer = this.d3el.append('div')
      .attr('id', 'mapcontainer').node();

    // for each hospitalhouse as key, simply mark true, and break out of the looping if so
    this.hospitalHousePairs = {};
    this.leafletMap = this.makeMap(mapContainer);

    this.setupCustomMapControls();
  }
  setupCustomMapControls () {
    const inputContainer = this.d3el.insert('div', '#mapcontainer');
    inputContainer.attr('id', 'mapControlHolder');

    // Add radius slider label
    inputContainer.append('label')
      .attr('id', 'hospitalRadiusLabel')
      .attr('for', 'hospitalRadiusSlider');

    // Add radius slider
    inputContainer.append('input')
      .attr('id', 'hospitalRadiusSlider')
      .attr('type', 'range')
      .attr('min', 0.5)
      .attr('max', 15)
      .on('change', function () {
        window.controller.appState.setHospitalRadius(this.value);
      });

    // Add a separator
    inputContainer.append('div')
      .classed('separator', true);

    // add zip label
    inputContainer.append('label')
      .text('Zip Code')
      .attr('for', 'zipInput');

    // add an input for searching zips
    const zipInput = inputContainer.append('input');
    zipInput.attr('id', 'zipInput');
    zipInput.on('input', () => {
      const zip = zipInput.node().value;
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
    this.updateCustomMapControls();
  }
  updateHouseMarkers () {
    const blackHotelIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/hotel_icon.svg'
    });
    const greyHotelIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/grey_hotel_icon.svg'
    });
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
    const propertyType = {};
    window.controller.houses.getRows().forEach(house => {
      // Only show houses that have lat lng and pass all the filters
      const markerKey = house.Timestamp;
      let correctIcon;
      if (house['Hotel/House'] === 'house') {
        correctIcon = blackHouseIcon;
        propertyType[markerKey] = 'house';
      } else {
        correctIcon = blackHotelIcon;
        propertyType[markerKey] = 'hotel';
      }
      if (house.lat !== 'fail' && house.passesAllFilters) {
        housesThatPassed[markerKey] = true;
        if (this.houseMarkers[markerKey]) {
          // This house marker already exists, make sure it has a black icon
          this.houseMarkers[markerKey].setIcon(correctIcon);
        } else {
          // generate popup info
          // expects visibleAttributes to be a list of columns that are permitted
          let popupText = '';
          if (house.visibleAttributes) {
            for (let attr of house.visibleAttributes) {
              popupText += `<p>${attr[0]}: ${attr[1]}</p>`;
            }
          } else {
            popupText = `<p>Property name: ${house['Property Name']}</p>`;
          }
          // Create a new black marker
          this.houseMarkers[markerKey] = L.marker([house.lat, house.lng], {
            icon: correctIcon
          }).addTo(this.leafletMap)
            .bindPopup(popupText)
            .on('click', (e) => {
              window.controller.appState.selectHouse(house['Timestamp']);
            });
        }
      }
    });
    // Grey out any markers that didn't pass the filters
    for (const [markerKey, marker] of Object.entries(this.houseMarkers)) {
      if (!housesThatPassed[markerKey]) {
        if (propertyType[markerKey] === 'house') {
          marker.setIcon(greyHouseIcon);
        } else {
          marker.setIcon(greyHotelIcon);
        }
      }
    }
  }
  updatePopup () {
    const houseTimestamp = window.controller.appState.selectedHouseTimestamp;
    if (houseTimestamp && this.houseMarkers[houseTimestamp]) {
      // Selected a house (maybe not from the map); make sure the popup is open
      this.houseMarkers[houseTimestamp].openPopup();
    } else {
      // Clicked on a house without a valid lat / lng or deselected a house,
      // close all popups
      this.leafletMap.closePopup();
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
      // Get the contrasting color from the theme
      const color = window.getComputedStyle(document.documentElement)
        .getPropertyValue('--error-color');

      // Add (or move) the circle to the clicked hospital
      this.hospitalCircle = L.circle(selectedHospital.latlng, {
        color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 1609.344 * window.controller.appState.hospitalRadius
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
      const selected = zipNumber === layer.feature.properties['ZCTA5CE10'];
      // set or clear the 'selected' class
      d3.select(layer._path).classed('selected', selected);
      if (selected) {
        // Move the selected layer (if it exists) to the front
        layer._path.parentNode.appendChild(layer._path);
      }
    });
  }
  updateCustomMapControls () {
    // Update the hospital radius slider and its label
    this.d3el.select('#hospitalRadiusSlider')
      .property('value', window.controller.appState.hospitalRadius);
    this.d3el.select('#hospitalRadiusLabel')
      .text(`Hospital radius (${window.controller.appState.hospitalRadius}mi)`);

    // Update the number in the zip field
    this.d3el.select('#zipInput')
      .property('value', window.controller.appState.selectedZip || '');
  }
}

export default MapView;
