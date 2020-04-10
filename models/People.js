import { Model } from '../node_modules/uki/dist/uki.esm.js';

class People extends Model {
  constructor () {
    super([
      { type: 'csv', url: 'models/hcw_enroll_mockup.csv' }
    ]);
    // TODO: change this to an uploaded CSV, and later to integrated
    // SurveyMonkey responses
  }
  getValues () {
    return this.resources[0];
  }
}

export default People;
