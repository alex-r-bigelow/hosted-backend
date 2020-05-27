/* globals d3 */

const TableViewMixin = function (superclass) {
  const TableView = class extends superclass {
    constructor (argObj) {
      argObj.resources = argObj.resources || [];
      argObj.resources.push(...[
        { type: 'less', url: './views/common/TableViewMixin.less' },
        { type: 'text', url: './views/common/TableViewMixinTemplate.html', name: 'TableViewMixinTemplate' }
      ]);
      super(argObj);

      this.tableModel = argObj.tableModel;
      this.tableModel.on('headersUpdated', () => { this.render(); });
    }
    setup () {
      super.setup();

      this.content.html(this.getNamedResource('TableViewMixinTemplate'))
        .classed('TableView', true);

      const attributeSelector = this.content.select('.attributeSelector');
      attributeSelector.on('click', () => {
        window.controller.tooltip.show({
          content: tooltipEl => { this.drawAttributeTooltip(tooltipEl); },
          targetBounds: attributeSelector.node().getBoundingClientRect(),
          interactive: true,
          hideAfterMs: 0
        });
      });
    }
    draw () {
      super.draw();

      if (this.isHidden || this.isLoading) {
        return;
      }

      this.headers = this.content.select('thead tr')
        .selectAll('th').data(this.tableModel.visibleHeaders);
      this.headers.exit().remove();
      const headersEnter = this.headers.enter().append('th');
      this.headers = this.headers.merge(headersEnter);

      headersEnter.append('div');
      this.headers.select('div')
        .text(d => d)
        .attr('title', d => d);

      this.rows = this.content.select('tbody')
        .selectAll('tr').data(this.getTableRows())
        .order();
      this.rows.exit().remove();
      const rowsEnter = this.rows.enter().append('tr');
      this.rows = this.rows.merge(rowsEnter);

      this.cells = this.rows.selectAll('td')
        .data(row => this.tableModel.visibleHeaders.map(header => row[header]));
      this.cells.exit().remove();
      const cellsEnter = this.cells.enter().append('td');
      this.cells = this.cells.merge(cellsEnter);

      cellsEnter.append('div'); // wrapper needed to limit height
      this.cells.select('div')
        .attr('title', d => d === undefined || d === null ? null : d)
        .text(d => d === undefined ? '' : d === null ? 'null' : d);
    }
    drawAttributeTooltip (tooltipEl) {
      const fullHeaderList = this.getTableHeaders();

      tooltipEl.html(`<h3>Show columns:</h3><ul style="padding:0"></ul>`);

      let listItems = tooltipEl.select('ul')
        .selectAll('li').data(fullHeaderList);
      listItems.exit().remove();
      const listItemsEnter = listItems.enter().append('li');
      listItems = listItems.merge(listItemsEnter);

      listItems
        .style('max-width', '15em')
        .style('list-style', 'none')
        .on('click', () => {
          d3.event.stopPropagation();
        });

      listItemsEnter.append('input')
        .attr('type', 'checkbox')
        .attr('id', (d, i) => `attrCheckbox${i}`)
        .property('checked', d => this.tableModel.visibleHeaders.indexOf(d) !== -1)
        .on('change', d => {
          this.tableModel.toggleAttribute(d);
        });
      listItemsEnter.append('label')
        .attr('for', (d, i) => `attrCheckbox${i}`)
        .text(d => d);
    }
  };
  TableView.prototype._instanceOfTableViewMixin = true;
  return TableView;
};
Object.defineProperty(TableViewMixin, Symbol.hasInstance, {
  value: i => !!i._instanceOfTableViewMixin
});
export default TableViewMixin;
