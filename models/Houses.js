import { GoogleSheetModel } from '../node_modules/uki/dist/uki.esm.js';
import FlexHeaderTableMixin from './FlexHeaderTableMixin.js';

class Houses extends FlexHeaderTableMixin(GoogleSheetModel) {
  constructor () {
    super([
      { type: 'json', url: 'models/google.json', name: 'google' }
    ], {
      spreadsheetId: '1Gq8sK5UVguy4OV0HpezDoNtRWOwRMFH5bOAVi66Cb-8',
      mode: GoogleSheetModel.MODE.AUTH_READ_WRITE,
      sheet: 'Form Responses 1'
    });
    // Override the default visible headers
    this.visibleHeaders = [
      'Timestamp',
      'Property Name',
      'Hotel/House',
      'Rate if hotel',
      'Notes'
    ];
    this.ready.then(() => {
      const { key, client } = this.getNamedResource('google');
      this.setupAuth(key, client);
    });
  }
  getValues () {
    // Return copies of each house, with an extra columns for distance to the
    // currently selected hospital, as well as whether they pass all filters
    return super.getValues().map(house => {
      const passesAllFilters = Object
        .values(window.controller.appState.housingFilters)
        .every(filterFunc => filterFunc(house));
      const hospital = window.controller.appState.selectedHospital;
      const distToSelectedHospital = hospital &&
        window.controller.appState.distanceBetween(hospital.latlng, house);
      return Object.assign({
        passesAllFilters,
        distToSelectedHospital
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

export default Houses;
