import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor() {
    super();

    this.personFilters = {};
    this.selectedPeopleTimestamps = [];

    this.housingFilters = {};
    this.selectedHouseTimestamp = null;
    this.selectedZip = null

    this.selectedHospital = null;
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
  zipClick(zip) {
    // undo previous zip filter
    window.controller.appState.removeHousingFilter("zipcode")
    let selectedZip = zip.target.feature.properties["ZCTA5CE10"]
    if (window.controller.appState.selectedZip == null || window.controller.appState.selectedZip != selectedZip) {
      window.controller.appState.selectedZip = selectedZip
      //perform some sort of selection on the houses inside this zipcode
      console.log("checking zips on houses", zip.target.feature.properties)
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
  clearSelections() {
    this.selectedHouseTimestamp = null;
    this.selectedPeopleTimestamps = [];
    this.trigger('peopleSelection');
    this.trigger('houseSelection');
  }
}

export default AppState;
