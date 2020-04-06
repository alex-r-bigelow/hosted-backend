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
  }
  get title () {
    return 'People';
  }
  getTableHeaders () {
    return window.controller.people.getHeaders();
  }
  getTableRows () {
    return window.controller.people.getTable();
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
