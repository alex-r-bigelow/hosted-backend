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
  }
  get title () {
    return 'Properties';
  }
  getTableHeaders () {
    return Object.keys(window.controller.houses.table[0]);
  }
  getTableRows () {
    return window.controller.houses.table;
  }
  draw () {
    super.draw();

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
