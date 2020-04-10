/* globals d3 */
import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class PersonTableView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/PersonTableView/style.less' }
    ];
    super(argObj);

    window.controller.appState.on('peopleSelection', () => {
      this.render();
    });
    window.controller.assignments.on('dataUpdated', () => {
      this.render();
    });
  }
  get title () {
    return 'People';
  }
  getHeaders () {
    const nativeHeaders = Object.keys(window.controller.people.getValues()[0]);
    return ['Currently Assigned'].concat(nativeHeaders);
  }
  getTable () {
    const lastAssignments = window.controller.assignments.getLastAssignments();
    return window.controller.people.getValues().map(person => {
      const tempPerson = Object.assign({
        'Currently Assigned': lastAssignments[person.Timestamp] ? 'Yes' : 'No'
      }, person);
      return tempPerson;
    });
  }
  getTableHeaders () {
    return this.getHeaders();
  }
  getTableRows () {
    return this.getTable();
  }
  draw () {
    super.draw();

    this.rows
      .classed('selected', row => {
        return window.controller.appState.selectedPeopleTimestamps
          .indexOf(row.Timestamp) !== -1;
      })
      .on('click', row => {
        const keepPrior = d3.event.ctrlKey || d3.event.metaKey;
        window.controller.appState.selectPerson(row.Timestamp, keepPrior);
      });
  }
}

export default PersonTableView;
