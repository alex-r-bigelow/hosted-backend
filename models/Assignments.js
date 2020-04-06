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
  getLastAssignments () {
    const lastAssignments = {};
    for (const assignment of this.table) {
      if (lastAssignments[assignment['Person Timestamp']] === undefined) {
        lastAssignments[assignment['Person Timestamp']] = assignment['House Timestamp'];
      }
    }
    return lastAssignments;
  }
  addAssignments (rows) {
    this.resources[0].unshift(...rows);
    this.trigger('assignmentMade');
  }
}

export default Assignments;
