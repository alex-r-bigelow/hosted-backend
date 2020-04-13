import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor () {
    super();

    this.personFilters = {};
    this.selectedPeopleTimestamps = [];

    this.housingFilters = {};
    this.selectedHouseTimestamp = null;

    this.selectedHospital = null;
  }
  selectPerson (timestamp, keepPrior = false) {
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
  selectHouse (timestamp) {
    this.selectedHouseTimestamp = timestamp;
    this.trigger('houseSelection');
  }
  selectHospital (hospital) {
    this.selectedHospital = hospital;
    // TODO: add a personFilter AND a housingFilter
    this.addHouseFilter({
      key: 'hospital',
      filterFunc: house => {
        return
      }
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
  clearSelections () {
    this.selectedHouseTimestamp = null;
    this.selectedPeopleTimestamps = [];
    this.trigger('peopleSelection');
    this.trigger('houseSelection');
  }
}

export default AppState;
