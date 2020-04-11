import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class HouseTableView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/HouseTableView/style.less' }
    ];
    super(argObj);

    window.controller.appState.on('houseSelection', () => {
      this.render();
    });
    window.controller.assignments.on('dataUpdated', () => {
      this.render();
    });
  }
  get title () {
    return 'Properties';
  }
  get isLoading () {
    return !window.controller.houses.loggedInAndLoaded;
  }
  getTableHeaders () {
    const nativeHeaders = window.controller.houses.getHeaders();
    return ['People Assigned'].concat(nativeHeaders);
  }
  getTableRows () {
    const counts = window.controller.assignments.getAssignmentCounts();
    return window.controller.houses.getValues().map(row => {
      return Object.assign({
        'People Assigned': counts[row.Timestamp] || 0
      }, row);
    });
  }
  draw () {
    super.draw();

    if (this.isHidden || this.isLoading) {
      return;
    }

    this.rows
      .classed('selected', row => {
        return row.Timestamp === window.controller.appState.selectedHouseTimestamp;
      })
      .on('click', row => {
        window.controller.appState.selectHouse(row.Timestamp);
      });
  }
}

export default HouseTableView;
