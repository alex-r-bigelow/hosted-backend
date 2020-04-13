/* globals L */
import GoldenLayoutView from '../common/GoldenLayoutView.js';

class MapView extends GoldenLayoutView {
  constructor(argObj) {
    argObj.resources = [
      { type: 'css', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.css' },
      { type: 'js', url: 'https://unpkg.com/leaflet@1.6.0/dist/leaflet.js' },
      { type: 'json', url: './views/MapView/Hospitals.geojson', name: 'hospitals' },
      { type: 'less', url: './views/MapView/style.less' }
    ];
    super(argObj);

    this.houseMarkers = {};
    this.hospitalCircle = null;

    window.controller.appState.on('hospitalSelection', () => { this.render(); });
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
    this.hospitalHousePairs = {}
    this.leafletMap = this.makeMap(mapContainer);
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
    // establish nearbyhouses property
    this.getNamedResource("hospitals").features.forEach(e=> {
      e.properties.nearbyHouses = "\n"
    })
    L.geoJSON(this.getNamedResource('hospitals'), {
      pointToLayer: markerSetFunc
    }).bindPopup(l => {
      if (l.feature.properties.nearbyHouses != "\n") {
        return l.feature.properties.name + l.feature.properties.nearbyHouses
      } else {
        return l.feature.properties.name + "No nearby houses"
      }
    }).on('click', (e) => {
      window.controller.appState.selectHospital(e);
    }).addTo(map);

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
    const houseIcon = L.icon({
      iconSize: [20, 20],
      iconUrl: './views/MapView/house_icon.svg'
    });
    const seenHouseMarkers = {};
    // TODO: .getValues() will probably change to something else when we start
    // adding filters
    window.controller.houses.getValues().forEach(house => {
      // has lat lng
      if (house.lat !== 'fail') {
        const markerKey = house.lat + ',' + house.lng;
        if (this.houseMarkers[markerKey]) {
          // This house already exists, just mark that we saw it and that it
          // (TODO: if we're just greying out houses instead of removing them,
          // we should restore the non-grey icon here
          seenHouseMarkers[markerKey] = true;
        } else {
          // This is a new house marker; create it
          seenHouseMarkers[markerKey] = true;
          this.houseMarkers[markerKey] = L.marker([house.lat, house.lng], {
            icon: houseIcon
          }).addTo(this.leafletMap)
            .bindPopup(`<p>House Located: ${house['Property Address ']}</p>
                        <p>Contact: ${house['Primary Contact Name']},
                          ${house['Primary Contact Email Address']},
                          ${house['Primary Contact Phone Number']}`);
        }
      }
    });
    // TODO: Remove / grey out any markers that don't pass the current house
    // filters; these will be in this.houseMarkers but not in seenHouseMarkers


    // factor   .001 of lat or lng is 111.32m
    let convFactor = 111.32 / .001
    // make async somehow?
    for (let hospital of this.getNamedResource('hospitals').features) {
      for (let house of window.controller.houses.getValues()) {
        if (house.lat != "fail" && this.hospitalHousePairs[house["Timestamp"] + hospital.properties.name] == undefined) {
          // perform calculation
          //console.log("hospital is ",hospital.geometry.coordinates,"house",house.lat,house.lng)
          let deltaLng = Math.abs(hospital.geometry.coordinates[0] - house.lng)
          let deltaLat = Math.abs(hospital.geometry.coordinates[1] - house.lat)
          //console.log("dif is lat:",deltaLat,"lng:",deltaLng)
          let deltaXMeters = deltaLng * convFactor
          let deltaYMeters = deltaLat * convFactor
          // do dist calculation
          let dist = Math.sqrt(Math.pow(deltaXMeters, 2) + Math.pow(deltaYMeters, 2))
          //console.log("dist",dist)
          this.hospitalHousePairs[house["Timestamp"] + hospital.properties.name] = dist
          // value is less than 1.5 miles
          if (dist < 2700 && house["Timestamp"] != undefined) {
            hospital.properties.nearbyHouses += `<p>House ID:${house["Timestamp"]}</p>`
          }
        }
      }
    }



    // calculate collection of nearest houses for each hospital, or ones that fall in the radius mark
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
