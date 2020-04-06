import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor () {
    super();

    this.personFilters = [];
    this.selectedPeopleTimestamps = [];

    this.housingFilters = [];
    this.selectedHouseTimestamp = null;

    this.selectedHospital = null;
  }
  selectPerson (timestamp, keepPrior = false) {
    if (!keepPrior) {
      this.selectedPeopleTimestamps = [];
    }
    this.selectedPeopleTimestamps.push(timestamp);
    this.trigger('peopleSelection');
  }
  selectHouse (timestamp) {
    this.selectedHouseTimestamp = timestamp;
    this.trigger('houseSelection');
  }
  selectHospital (id) {
    this.selectedHospital = id;
    // TODO: add a personFilter AND a housingFilter
  }
}

export default AppState;
