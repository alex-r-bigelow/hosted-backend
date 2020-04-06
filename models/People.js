import { Model } from '../node_modules/uki/dist/uki.esm.js';

class People extends Model {
  constructor () {
    super([
      { type: 'csv', url: 'models/hcw_enroll_mockup.csv' }
    ]);
    // TODO: change this to an uploaded CSV, and later to integrated
    // SurveyMonkey responses
  }
  getHeaders () {
    return Object.keys(this.resources[0][0]).concat('lastAssignment');
  }
  getTable () {
    const lastAssignments = window.controller.assignments.getLastAssignments();
    return this.resources[0].map(person => {
      const tempPerson = Object.assign({}, person);
      tempPerson.lastAssignment = lastAssignments[person.Timestamp] || null;
      return tempPerson;
    });
  }
}

export default People;
