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
  getAssignmentCounts () {
    const currentAssignments = {};
    const assignmentCounts = {};
    for (const assignment of this.table.slice().reverse()) {
      const currentAssignment = currentAssignments[assignment['Person Timestamp']];
      if (currentAssignment) {
        assignmentCounts[currentAssignment] -= 1;
      }

      if (assignment['House Timestamp'] !== null) {
        assignmentCounts[assignment['House Timestamp']] = 1 + (assignmentCounts[assignment['House Timestamp']] || 0);
        currentAssignments[assignment['Person Timestamp']] = assignment['House Timestamp'];
      } else {
        delete currentAssignments[assignment['Person Timestamp']];
      }
    }
    return assignmentCounts;
  }
  addAssignments (rows) {
    this.resources[0].unshift(...rows);
    this.trigger('assignmentMade');
  }
}

export default Assignments;
