import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class AssignmentHistoryView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/AssignmentHistoryView/style.less' }
    ];
    argObj.tableModel = window.controller.assignments;
    super(argObj);

    window.controller.appState.on('houseSelection', () => { this.render(); });
    window.controller.appState.on('peopleSelection', () => { this.render(); });
    window.controller.assignments.on('dataUpdated', () => { this.render(); });
  }
  get title () {
    return 'History';
  }
  get isLoading () {
    return !this.tableModel.loggedInAndLoaded;
  }
  getTableHeaders () {
    return this.tableModel.getHeaders();
  }
  getTableRows () {
    return this.tableModel.getValues();
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
