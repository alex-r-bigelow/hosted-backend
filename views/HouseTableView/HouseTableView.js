/* globals uki */

class HouseTableView extends uki.ui.goldenlayout.GLViewMixin(
                               uki.ui.utils.LoadingViewMixin( // eslint-disable-line indent
                                 uki.ui.tables.FlexTableView)) { // eslint-disable-line indent
  constructor (options) {
    options.resources = [{ type: 'less', url: './views/HouseTableView/style.less' }];
    super(options);
    // Override the default visible headers
    this.visibleHeaderIndices = ['itemIndex', 8, 2, 7, 6, 4];
  }
  get title () {
    return 'Properties';
  }
  get isLoading () {
    return !window.controller.houses.loggedInAndLoaded;
  }
  getRawRows () {
    return window.controller.houses.getRows().sort((a, b) => {
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
  setup () {
    super.setup(...arguments);

    this.d3el.classed('HouseTableView', true);

    const renderFunc = () => { this.render(); };
    window.controller.appState.on('houseSelection', renderFunc);
    window.controller.appState.on('housingFiltersChanged', renderFunc);
    window.controller.houses.on('dataUpdated', renderFunc);
  }
  draw () {
    super.draw(...arguments);

    if (this.isHidden || this.isLoading) {
      return;
    }

    this.rows
      .classed('selected', row => {
        return row.data.Timestamp === window.controller.appState.selectedHouseTimestamp;
      })
      .classed('filteredOut', row => !row.data.passesAllFilters)
      .on('click', row => {
        window.controller.appState.selectHouse(row.data.Timestamp);
      });
  }
}

export default HouseTableView;
