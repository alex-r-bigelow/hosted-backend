import GoldenLayoutView from '../common/GoldenLayoutView.js';

class AssignmentView extends GoldenLayoutView {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/AssignmentView/style.less' },
      { type: 'text', url: './views/AssignmentView/template.html' }
    ];
    super(argObj);

    window.controller.appState.on('houseSelection', () => {
      this.render();
    });
    window.controller.appState.on('peopleSelection', () => {
      this.render();
    });
  }
  get title () {
    return 'Assignments';
  }
  setup () {
    super.setup();
    // Apply the template
    this.content.html(this.resources[1]);

    // Fill the emptyStateDiv with our warning
    this.emptyStateDiv.html('<h3>TODO: View for making assignments</h3>');
  }
  getPotentialAssignment () {
    const assignerTag = this.d3el.select('#assignerTag').node();
    const lastAssignments = window.controller.assignments.getLastAssignments();
    const temp = {
      house: window.controller.appState.selectedHouseTimestamp,
      people: window.controller.appState.selectedPeopleTimestamps,
      caseWorker: assignerTag.value || assignerTag.placeholder
    };
    temp.reassign = temp.people.some(pTime => !!lastAssignments[pTime]);
    return temp;
  }
  draw () {
    super.draw();

    const potential = this.getPotentialAssignment();

    this.d3el.select('.assign.button')
      .classed('disabled', potential.reassign || !potential.house || potential.people.length === 0)
      .on('click', () => {
        const potential = this.getPotentialAssignment();
        if (!potential.reassign && potential.house && potential.people.length > 0) {
          window.controller.assignments.addAssignments(potential.people.map(pTime => {
            return {
              'Timestamp': new Date().toLocaleString('en-GB'),
              'Case Worker': potential.caseWorker,
              'House Timestamp': potential.house,
              'Person Timestamp': pTime
            };
          }));
          window.controller.appState.clearSelections();
        }
      });

    this.d3el.select('.reassign.button')
      .classed('disabled', !potential.reassign || !potential.house || potential.people.length === 0)
      .on('click', () => {
        const potential = this.getPotentialAssignment();
        if (potential.reassign && potential.house && potential.people.length > 0) {
          window.controller.assignments.addAssignments(potential.people.map(pTime => {
            return {
              'Timestamp': new Date().toLocaleString('en-GB'),
              'Case Worker': potential.caseWorker,
              'House Timestamp': potential.house,
              'Person Timestamp': pTime
            };
          }));
          window.controller.appState.clearSelections();
        }
      });

    this.d3el.select('.unassign.button')
      .classed('disabled', !potential.reassign || potential.people.length === 0)
      .on('click', () => {
        const potential = this.getPotentialAssignment();
        if (potential.reassign && potential.people.length > 0) {
          window.controller.assignments.addAssignments(potential.people.map(pTime => {
            return {
              'Timestamp': new Date().toLocaleString('en-GB'),
              'Case Worker': potential.caseWorker,
              'House Timestamp': null,
              'Person Timestamp': pTime
            };
          }));
          window.controller.appState.clearSelections();
        }
      });
  }
}

export default AssignmentView;
