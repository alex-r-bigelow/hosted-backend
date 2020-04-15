import GoldenLayoutView from '../common/GoldenLayoutView.js';
import TableViewMixin from '../common/TableViewMixin.js';

class HouseTableView extends TableViewMixin(GoldenLayoutView) {
  constructor (argObj) {
    argObj.resources = [
      { type: 'less', url: './views/HouseTableView/style.less' }
    ];
    super(argObj);

    const renderFunc = () => { this.render(); };
    window.controller.appState.on('houseSelection', renderFunc);
    window.controller.appState.on('housingFiltersChanged', renderFunc);
    window.controller.assignments.on('dataUpdated', renderFunc);
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
    }).sort((a, b) => {
      // First priority: sort by whether rows passed all filters
      if (a.passesAllFilters && !b.passesAllFilters) {
        return -1;
      } else if (b.passesAllFilters && !a.passesAllFilters) {
        return 1;
      }
      // Second priority: sort by distance to the currently selected hospital
      if (a.distToSelectedHospital !== null && b.distToSelectedHospital !== null) {
        return a.distToSelectedHospital - b.distToSelectedHospital;
      }
      // For now, don't enforce any other sorting criteria
      return 0;
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
      .classed('filteredOut', row => !row.passesAllFilters)
      .on('click', row => {
        window.controller.appState.selectHouse(row.Timestamp);
      });
  }
}

export default HouseTableView;
