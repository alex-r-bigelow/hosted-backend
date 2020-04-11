import { GoogleSheetModel } from '../node_modules/uki/dist/uki.esm.js';

class Assignments extends GoogleSheetModel {
  constructor () {
    super([
      { type: 'json', url: 'models/google.json', name: 'google' }
    ], {
      spreadsheetId: '1l7Xoysx1kVfpRy_Xcsu6AEySp3yk9VOjQtOWYndvE-Y',
      mode: GoogleSheetModel.MODE.AUTH_READ_WRITE,
      sheet: 'Sheet1'
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
  getLastAssignments () {
    const lastAssignments = {};
    for (const assignment of this.getValues()) {
      if (lastAssignments[assignment['Person Timestamp']] === undefined) {
        lastAssignments[assignment['Person Timestamp']] = assignment['House Timestamp'];
      }
    }
    return lastAssignments;
  }
  getAssignmentCounts () {
    const currentAssignments = {};
    const assignmentCounts = {};
    for (const assignment of this.getValues().slice().reverse()) {
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
    this.addRows(rows);
  }
}

export default Assignments;
