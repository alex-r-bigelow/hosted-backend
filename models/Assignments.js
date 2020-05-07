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
    // Figure out the last assignment a person had
    const lastAssignments = {};
    // First sort assignments by timestamp
    const sortedAssignments = this.getValues()
      .sort((a, b) => {
        return new Date(a.Timestamp) - new Date(b.Timestamp);
      });
    // Starting at the beginning, add or remove assignments for people in order
    for (const assignment of sortedAssignments) {
      if (!assignment['House Timestamp']) {
        delete lastAssignments[assignment['Person Timestamp']];
      } else {
        lastAssignments[assignment['Person Timestamp']] = assignment['House Timestamp'];
      }
    }
    return lastAssignments;
  }
  getAssignmentCounts () {
    // Figure out how many people are in a house; start with everyone's last
    // assignments...
    const lastAssignments = this.getLastAssignments();
    // ... and count how many people are in each property
    const assignmentCounts = {};
    for (const houseTimestamp of Object.values(lastAssignments)) {
      assignmentCounts[houseTimestamp] = 1 + (assignmentCounts[houseTimestamp] || 0);
    }
    return assignmentCounts;
  }
  addAssignments (rows) {
    this.addRows(rows);
  }
}

export default Assignments;
