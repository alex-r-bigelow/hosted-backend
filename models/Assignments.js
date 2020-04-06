import { Model } from '../node_modules/uki/dist/uki.esm.js';

class Assignments extends Model {
  constructor () {
    super([
      { type: 'csv', url: 'models/fakeAssignmentsTable.csv' }
    ]);
    // TODO: change this to push / pull / update data from the Google Sheet
  }
  get table () {
    return this.resources[0];
  }
}

export default Assignments;
