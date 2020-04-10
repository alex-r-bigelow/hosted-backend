import { GoogleSheetModel } from '../node_modules/uki/dist/uki.esm.js';

class Houses extends GoogleSheetModel {
  constructor () {
    super([
      { type: 'json', url: 'models/google.json', name: 'google' }
    ], {
      spreadsheetId: '1Gq8sK5UVguy4OV0HpezDoNtRWOwRMFH5bOAVi66Cb-8',
      mode: GoogleSheetModel.MODE.AUTH_READ_WRITE,
      sheet: 'Form Responses 1'
    });
    this.ready.then(() => {
      const { key, client } = this.getNamedResource('google');
      this.setupAuth(key, client);
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
