const TableViewMixin = function (superclass) {
  const TableView = class extends superclass {
    constructor (argObj) {
      argObj.resources = argObj.resources || [];
      argObj.resources.push(...[
        { type: 'less', url: './views/common/TableViewMixin.less' },
        { type: 'text', url: './views/common/TableViewMixinTemplate.html', name: 'TableViewMixinTemplate' }
      ]);
      super(argObj);
    }
    setup () {
      super.setup();

      this.content.html(this.getNamedResource('TableViewMixinTemplate'))
        .classed('TableView', true);
    }
    draw () {
      super.draw();

      if (this.isHidden || this.isLoading) {
        return;
      }

      const headerList = this.getTableHeaders();

      this.headers = this.content.select('thead tr')
        .selectAll('th').data(headerList);
      this.headers.exit().remove();
      const headersEnter = this.headers.enter().append('th');
      this.headers = this.headers.merge(headersEnter);

      this.headers.text(d => d);

      this.rows = this.content.select('tbody')
        .selectAll('tr').data(this.getTableRows());
      this.rows.exit().remove();
      const rowsEnter = this.rows.enter().append('tr');
      this.rows = this.rows.merge(rowsEnter);

      this.cells = this.rows.selectAll('td')
        .data(row => headerList.map(header => row[header]));
      this.cells.exit().remove();
      const cellsEnter = this.cells.enter().append('td');
      this.cells = this.cells.merge(cellsEnter);

      this.cells.text(d => d === undefined ? '' : d === null ? 'null' : d);
    }
  };
  TableView.prototype._instanceOfTableViewMixin = true;
  return TableView;
};
Object.defineProperty(TableViewMixin, Symbol.hasInstance, {
  value: i => !!i._instanceOfTableViewMixin
});
export default TableViewMixin;
