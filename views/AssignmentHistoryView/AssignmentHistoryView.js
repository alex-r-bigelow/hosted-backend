import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class AssignmentHistoryView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/AssignmentHistoryView/style.less' }
    ];
    super(argObj);

    window.controller.appState.on('houseSelection', () => {
      this.render();
    });
    window.controller.appState.on('peopleSelection', () => {
      this.render();
    });
    window.controller.appState.on('assignmentMade', () => {
      this.render();
    });
  }
  get title () {
    return 'History';
  }
  get isLoading () {
    return !window.controller.assignments.loggedInAndLoaded;
  }
  getTableHeaders () {
    return ['Case worker', 'Person Timestamp', 'House Timestamp'];
  }
  getTableRows () {
    return window.controller.assignments.table;
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }

    this.rows
      .on('click', row => {
        window.controller.appState.selectHouse(row['House Timestamp']);
        window.controller.appState.selectPerson(row['Person Timestamp']);
      });
  }
}

export default AssignmentHistoryView;
