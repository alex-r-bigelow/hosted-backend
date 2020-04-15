/* globals d3 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

class People extends Model {
  constructor () {
    super([
      { type: 'csv', url: 'models/hcw_enroll_mockup.csv' }
    ]);
    this.initTable();
    // TODO: change this to integrate directly with REDCap's API
  }
  async initTable () {
    await this.ready;
    this._currentTable = window.localStorage.getItem('peopleTable');
    if (this._currentTable) {
      this._currentTable = JSON.parse(this._currentTable);
      this._currentHeaders = JSON.parse(window.localStorage.getItem('peopleHeaders'));
    } else {
      this._currentTable = this.resources[0];
      this._currentHeaders = this.resources[0].columns;
    }
  }
  getValues () {
    // Return copies of each person, with an extra column indicating whether
    // they pass all the current filters
    return this._currentTable.map(person => {
      const passesAllFilters = Object
        .values(window.controller.appState.personFilters)
        .every(filterFunc => filterFunc(person));
      return Object.assign({ passesAllFilters }, person);
    });
  }
  getHeaders () {
    return this._currentHeaders;
  }
  updateTable (rawText) {
    this._currentTable = d3.csvParse(rawText);
    this._currentHeaders = this._currentTable.columns;
    window.localStorage.setItem('peopleTable', JSON.stringify(this._currentTable));
    window.localStorage.setItem('peopleHeaders', JSON.stringify(this._currentHeaders));
    this.trigger('dataUpdated');
  }
}

export default People;
