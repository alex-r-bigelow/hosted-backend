import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor() {
    super();

    this.personFilters = {};
    this.selectedPeopleTimestamps = [];

    this.housingFilters = {};
    this.selectedHouseTimestamp = null;
    this.selectedHouseLatLng = null
    this.selectedZip = null

    this.selectedHospital = null;
    this.prevSelectedHospital = null
  }
  selectPerson(timestamp, keepPrior = false) {
    if (keepPrior) {
      // Toggle
      const index = this.selectedPeopleTimestamps.indexOf(timestamp);
      if (index === -1) {
        this.selectedPeopleTimestamps.push(timestamp);
      } else {
        this.selectedPeopleTimestamps.splice(index, 1);
      }
    } else {
      // Set
      this.selectedPeopleTimestamps = [timestamp];
    }
    this.trigger('peopleSelection');
  }
  selectHouse(timestamp) {
    this.selectedHouseTimestamp = timestamp;
    this.trigger('houseSelection');

    // trigger a map house click on the correct icon
    this.trigger("generatedHouseClick")
  }
  addHousingFilter(key, func) {
    this.housingFilters[key] = func;
    this.trigger('housingFiltersChanged');
  }
  removeHousingFilter(key) {
    delete this.housingFilters[key];
    this.trigger('housingFiltersChanged');
  }
  addPersonFilter(key, func) {
    this.personFilters[key] = func;
    this.trigger('personFiltersChanged');
  }
  removePersonFilter(key) {
    delete this.personFilters[key];
    this.trigger('personFiltersChanged');
  }
  hoverOverZip(zip) {
    console.log("hovering on zip", zip);
    let layer = zip.target
    layer.setStyle({
      fillColor: "red",
    })
  }
  hoverOutZip(zip) {
    window.controller.zipGeoJson.resetStyle(zip.target)
  }
  // have to go from number to zip geojson object 
  zipInputChanged(zipNumber) {
    // zips must be 5
    if (zipNumber.length < 5 || zipNumber.length > 5) {
      return
    }
    // or just check some basic stuff and then try to filter with it?
    // check through the existing zips and figure out which matches then select it
    // trigger zipClick on it
    window.controller.zipGeoJson.eachLayer((layer) => {
      // clear red style on all
      window.controller.zipGeoJson.resetStyle(layer)
      if (zipNumber == layer.feature.properties["ZCTA5CE10"]) {
        // perform a manual zipClic
        layer.setStyle({
          fillColor: "red"
        })
        this.zipClick(zipNumber)
      }
    })


  }
  zipClick(zip) {
    // undo previous zip filter
    window.controller.appState.removeHousingFilter("zipcode")
    // if zip is a layer from event not 
    let selectedZip
    if (zip.target != undefined) {
      selectedZip = zip.target.feature.properties["ZCTA5CE10"]
    } else {
      // the zip is already just a string
      selectedZip = zip
    }
    if (window.controller.appState.selectedZip == null || window.controller.appState.selectedZip != selectedZip) {
      window.controller.appState.selectedZip = selectedZip
      // ZCTA5CE10 is the name for what we commonly think of as zip codes
      // TODO: ask alex why for some reason `this` is overloaded to be a leaflet obj instead of appstate 
      // TODO: also ask why the filter gets run 5 times?
      if (window.controller.appState.housingFilters["zipcode"] == undefined) {
        window.controller.appState.addHousingFilter("zipcode", house => {
          return window.controller.appState.houseIsInZipCode(house, selectedZip)
        })
      }
    }
    window.controller.appState.trigger("zipClicked")
  }
  selectHospital(hospital) {
    if (this.selectedHospital) {

      if (this.selectedHospital.layer.feature.properties.name == hospital.layer.feature.properties.name) {
        // same one toggle it off
        this.trigger("removeCircle")
        // clear filters
        this.removeHousingFilter("hospital")
        this.trigger("hospitalSelection")
        //make the selected hospital null
        this.selectedHospital = null
        return

      }
    }
    this.selectedHospital = hospital;

    // Add a housing filter AND a person filter
    this.addHousingFilter('hospital', house => {
      return this.houseIsWithinRangeOfSelectedHospital(house);
    });

    // TODO: once we know the name of the column where people report
    // the hospital that they're associated with... (also doing something
    // to make sure the strings will match)
    /*
    this.addPersonFilter({
      key: 'hospital',
      filterFunc: person => {
        return person['Name/location of your primary work site'] ===
          hospital.feature.properties.name;
      }
    });
    */

    this.trigger('hospitalSelection');
  }
  distanceBetween(a, b) {
    // factor   .001 of lat or lng is 111.32m
    const convFactor = 111.32 / 0.001;

    const deltaLng = Math.abs(a.lng - b.lng);
    const deltaLat = Math.abs(a.lat - b.lat);

    const deltaXMeters = deltaLng * convFactor;
    const deltaYMeters = deltaLat * convFactor;

    const dist = Math.sqrt(Math.pow(deltaXMeters, 2) + Math.pow(deltaYMeters, 2));

    // Convert to miles
    return dist / 1800;
  }
  houseIsInZipCode(house, zip) {
    //create a regex
    let regexZip = new RegExp(zip)
    // TODO: figure out is the space after address going to be there always?
    if (regexZip.test(house["Property Address "])) {
      console.log("house in zipcode", house)
      return true
    } else {
      return false
    }
  }
  houseIsWithinRangeOfSelectedHospital(house) {
    if (this.selectedHospital === null) {
      // No hospital selected; treat all houses as if they are in range
      return true;
    } else {
      // distance is less than 1.5 miles
      return this.distanceBetween(this.selectedHospital.latlng, house) < 1.5;
    }
  }
  //house timestamp
  mapHouseSelect(houseTS) {
    this.selectedHouseTimestamp = timestamp;
    this.trigger('houseSelection');
  }
  clearSelections() {
    this.selectedHouseTimestamp = null;
    this.selectedPeopleTimestamps = [];
    this.trigger('peopleSelection');
    this.trigger('houseSelection');
  }
}

export default AppState;
