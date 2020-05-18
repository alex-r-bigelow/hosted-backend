const FlexHeaderTableMixin = function (superclass) {
  const FlexHeaderTable = class extends superclass {
    constructor (resources, argObj) {
      super(resources, argObj);

      this.visibleHeaders = ['Timestamp'];
    }
    toggleAttribute (attr) {
      const index = this.visibleHeaders.indexOf(attr);
      if (index === -1) {
        this.visibleHeaders.push(attr);
      } else {
        this.visibleHeaders.splice(index, 1);
      }
      this.trigger('headersUpdated');
    }
    getValues () {
      // Add an extra visibleAttributes list, with ordered [attr,value] pairs
      return super.getValues().map(row => {
        return Object.assign({
          visibleAttributes: this.visibleHeaders.map(attr => {
            return [attr, row[attr]];
          })
        }, row);
      });
    }
  };
  FlexHeaderTable.prototype._instanceOfFlexHeaderTableMixin = true;
  return FlexHeaderTable;
};
Object.defineProperty(FlexHeaderTableMixin, Symbol.hasInstance, {
  value: i => !!i._instanceOfFlexHeaderTableMixin
});
export default FlexHeaderTableMixin;
