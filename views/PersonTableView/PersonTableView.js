/* globals d3 */
import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class PersonTableView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/PersonTableView/style.less' }
    ];
    argObj.tableModel = window.controller.people;
    super(argObj);

    const renderFunc = () => { this.render(); };
    window.controller.appState.on('peopleSelection', renderFunc);
    window.controller.appState.on('personFiltersChanged', renderFunc);
    window.controller.people.on('dataUpdated', renderFunc);
    window.controller.assignments.on('dataUpdated', renderFunc);
  }
  get title () {
    return 'People';
  }
  get isLoading () {
    return !this.tableModel.loggedInAndLoaded;
  }
  getTableHeaders () {
    const nativeHeaders = this.tableModel.getHeaders();
    return ['Currently Assigned'].concat(nativeHeaders);
  }
  getTableRows () {
    const lastAssignments = window.controller.assignments.getLastAssignments();
    return this.tableModel.getValues().map(person => {
      const tempPerson = Object.assign({
        'Currently Assigned': lastAssignments[person.Timestamp] ? 'Yes' : 'No'
      }, person);
      return tempPerson;
    });
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }

    this.rows
      .classed('selected', row => {
        return window.controller.appState.selectedPeopleTimestamps
          .indexOf(row.Timestamp) !== -1;
      })
      .classed('filteredOut', row => !row.passesAllFilters)
      .on('click', row => {
        const keepPrior = d3.event.ctrlKey || d3.event.metaKey;
        window.controller.appState.selectPerson(row.Timestamp, keepPrior);
      });
  }
}

export default PersonTableView;
