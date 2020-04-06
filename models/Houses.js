import { Model } from '../node_modules/uki/dist/uki.esm.js';

class Houses extends Model {
  constructor () {
    super([
      { type: 'csv', url: 'models/fakeHousesTable.csv' }
    ]);
    // TODO: change this to pull / update data from the Google Sheet
  }
  get table () {
    return this.resources[0];
  }
  selectedHouse () {
    return this.table.find(d => d.Timestamp === window.controller.appState.selectedHouseTimestamp);
  }
}

export default Houses;
