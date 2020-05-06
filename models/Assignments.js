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
  // meant to be used for person table current assignment resolution
  // last assignments seems to be missing some logic that unassignment influences
  getAllAssignments () {
    // have
    const allAssignments = {
      all: {},
      current: {}
    };
    for (const assignment of this.getValues()) {
      allAssignments.all[assignment.Timestamp] = assignment;
      // put in current if that person stamp is missing, but if found do a time comparison
      if (allAssignments.current[assignment['Person Timestamp']] === undefined) {
        // use house value, if this is null we know they aren't assigned
        allAssignments.current[assignment['Person Timestamp']] = {
          house: assignment['House Timestamp'],
          Timestamp: assignment.Timestamp
        };
      } else {
        let currentTime = new Date(allAssignments.current[assignment['Person Timestamp']].Timestamp);
        let otherTime = new Date(assignment.Timestamp);
        if (otherTime > currentTime) {
          // othertime is more recent, update allAssign current
          allAssignments.current[assignment['Person Timestamp']] = {
            house: assignment['House Timestamp'],
            Timestamp: assignment.Timestamp
          };
        }
      }
    }
    return allAssignments;
  }
  getLastAssignments () {
    // this needs some indication of order or there's nothing preventing older entries trumping recent
    const lastAssignments = {};
    for (const assignment of this.getValues()) {
      if (lastAssignments[assignment['Person Timestamp']] === undefined) {
        lastAssignments[assignment['Person Timestamp']] = assignment['House Timestamp'];
      }
    }
    return lastAssignments;
  }
  // unassign aware counts
  getHouseCounts () {
    // this is meant to return a house time stamp accurate count
    // move person object from place to place
    // strip out the missing
    let assignments = this.getValues().sort((a, b) => {
      return (new Date(a.Timestamp)) - (new Date(b.Timestamp));
    });
    let peoplePlaces = {};
    assignments.map(assig => {
      // overwrites previous entries so that whats left is current state
      peoplePlaces[assig['Person Timestamp']] = assig['House Timestamp'];
    });
    let places = {};
    for (let e in peoplePlaces) {
      if (places[peoplePlaces[e]] === undefined) {
        places[peoplePlaces[e]] = 1;
      } else {
        places[peoplePlaces[e]] += 1;
      }
    }
    return places;
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
