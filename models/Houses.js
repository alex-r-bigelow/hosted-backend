/* globals uki */

class Houses extends uki.google.AuthSheetModel {
  constructor () {
    super({
      resources: [
        { type: 'json', url: 'models/google.json', name: 'google' }
      ],
      spreadsheetId: '1Gq8sK5UVguy4OV0HpezDoNtRWOwRMFH5bOAVi66Cb-8',
      mode: uki.google.AuthSheetModel.MODE.AUTH_READ_WRITE,
      sheet: 'Form Responses 1'
    });
    this.ready.then(() => {
      const { key, client } = this.getNamedResource('google');
      this.setupAuth(key, client);
    });
  }
  getRows () {
    // Return copies of each house, with an extra columns for distance to the
    // currently selected hospital, as well as whether they pass all filters
    return super.getRows().map(house => {
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
    return this.status === uki.google.AuthSheetModel.STATUS.SIGNED_IN &&
      !!this.getRows();
  }
  get selectedHouse () {
    return this.getRows().find(d => d.Timestamp === window.controller.appState.selectedHouseTimestamp);
  }
}

export default Houses;
