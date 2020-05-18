import { GoogleSheetModel } from '../node_modules/uki/dist/uki.esm.js';
import FlexHeaderTableMixin from './FlexHeaderTableMixin.js';

class People extends FlexHeaderTableMixin(GoogleSheetModel) {
  constructor () {
    super([
      { type: 'json', url: 'models/google.json', name: 'google' }
    ], {
      spreadsheetId: '1qEdu0TrGTl1yeN8LAU0aMB86-8oTde25ZjX4HG-cRQM',
      mode: GoogleSheetModel.MODE.AUTH_READ_WRITE,
      sheet: 'Form Responses 1'
    });
    // Override the default visible headers
    this.visibleHeaders = [
      'Timestamp',
      'Name',
      'Email address',
      'Need for housing / type',
      'Date (if applicable)',
      'Has there been any change in symptoms of COVID 19 or testing status or results since you filled out the registration form?'
    ];
    this.ready.then(() => {
      const { key, client } = this.getNamedResource('google');
      this.setupAuth(key, client);
    });
  }
  getValues () {
    // Return copies of each person, with an extra column for whether they pass
    // all filters
    return super.getValues().map(house => {
      const passesAllFilters = Object
        .values(window.controller.appState.housingFilters)
        .every(filterFunc => filterFunc(house));
      return Object.assign({
        passesAllFilters
      }, house);
    });
  }
  get loggedInAndLoaded () {
    return this.status === GoogleSheetModel.STATUS.SIGNED_IN &&
      !!this.getValues();
  }
  get selectedHouse () {
    return this.getValues().find(d => d.Timestamp === window.controller.appState.selectedHouseTimestamp);
  }
}

export default People;
