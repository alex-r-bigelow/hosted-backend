/* globals d3 */
import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class PersonTableView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/PersonTableView/style.less' }
    ];
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
  getTableHeaders () {
    const nativeHeaders = window.controller.people.getHeaders();
    return ['Currently Assigned'].concat(nativeHeaders);
  }
  getTableRows () {
    const allAssignments = window.controller.assignments.getAllAssignments();
    return window.controller.people.getValues().map(person => {
      let assignment;
      // check for any assignment
      if (allAssignments.current[person.Timestamp] === undefined) {
        assignment = 'No';
      } else if (allAssignments.current[person.Timestamp]['house'] === '') {
        // this is the result of unassignment
        assignment = 'No';
      } else {
        assignment = 'Yes';
      }
      const tempPerson = Object.assign({ 'Currently Assigned': assignment }, person);
      return tempPerson;
    });
  }
  draw () {
    super.draw();

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
