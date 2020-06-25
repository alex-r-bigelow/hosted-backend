import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor () {
    super();

    this.housingFilters = {};
    this.selectedHouseTimestamp = null;
    this.selectedZip = null;
    this.selectedHospital = null;

    this.hospitalRadius = 1.5;
  }
  selectHouse (timestamp) {
    this.selectedHouseTimestamp = timestamp;
    this.trigger('houseSelection');
  }
  setHousingFilter (key, func) {
    this.housingFilters[key] = func;
    this.trigger('housingFiltersChanged');
  }
  removeHousingFilter (key) {
    delete this.housingFilters[key];
    this.trigger('housingFiltersChanged');
  }
  selectZip (zip) {
    if (zip !== null && zip.target !== undefined) {
      // if zip is a layer from event not
      // ZCTA5CE10 is the name for what we commonly think of as zip codes
      zip = zip.target.feature.properties['ZCTA5CE10'];
    }
    if (zip === this.selectedZip) {
      // the same zip was selected; toggle it off
      zip = null;
    }
    this.selectedZip = zip;
    this.selectedHospital = null;

    if (this.selectedZip === null) {
      // We're deselecting; clear the filter
      this.removeHousingFilter('geographic');
    } else {
      // Add a housing filter
      this.setHousingFilter('geographic', house => {
        return this.houseIsInZipCode(house, this.selectedZip);
      });
    }

    // Let the views know that the selection changed
    window.controller.appState.trigger('zipSelection');
  }
  selectHospital (hospital) {
    if (this.selectedHospital) {
      if (this.selectedHospital.layer.feature.properties.name === hospital.layer.feature.properties.name) {
        // Selected the same hospital as before; toggle it off
        hospital = null;
      }
    }

    this.selectedHospital = hospital;
    this.selectedZip = null;

    if (this.selectedHospital === null) {
      // We're deselecting; clear the filter
      this.removeHousingFilter('geographic');
    } else {
      // Add a housing filter
      this.setHousingFilter('geographic', house => {
        return this.houseIsWithinRangeOfSelectedHospital(house);
      });
    }

    // Let the views know that the selection changed
    this.trigger('hospitalSelection');
  }
  distanceBetween (a, b) {
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
  houseIsInZipCode (house, zip) {
    // create a regex
    let regexZip = new RegExp(zip);
    // TODO: figure out is the space after address going to be there always?
    if (regexZip.test(house['Property Address '])) {
      // console.log('house in zipcode', house);
      return true;
    } else {
      return false;
    }
  }
  houseIsWithinRangeOfSelectedHospital (house) {
    if (this.selectedHospital === null) {
      // No hospital selected; treat all houses as if they are in range
      return true;
    } else {
      // distance is less than the current radius in miles
      return this.distanceBetween(this.selectedHospital.latlng, house) < this.hospitalRadius;
    }
  }
  setHospitalRadius (radius) {
    this.hospitalRadius = radius;
    this.trigger('housingFiltersChanged');
  }
  clearSelections () {
    this.selectedHouseTimestamp = null;
    this.trigger('houseSelection');
  }
}

export default AppState;
