import { Model } from '../node_modules/uki/dist/uki.esm.js';

class AppState extends Model {
  constructor () {
    super();

    this.personFilters = [];
    this.selectedPeople = [];

    this.housingFilters = [];
    this.selectedHouse = null;

    this.selectedHospital = null;
  }
  selectPerson (timestamp, keepPrior = false) {
    if (!keepPrior) {
      this.selectedPeople = [];
    }
    this.selectedPeople.push(timestamp);
    this.trigger('peopleSelection');
  }
  selectHouse (timestamp) {
    this.selectedHouse = timestamp;
    this.trigger('houseSelection');
  }
  selectHospital (id) {
    this.selectedHospital = id;
    // TODO: add a personFilter AND a housingFilter
  }
}

export default AppState;
