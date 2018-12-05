'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
var TableModel = /** @class */ (function() {
  function TableModel() {
    this.columns = [];
    this.columnMap = {};
    this.rows = [];
    this.type = 'table';
  }
  TableModel.prototype.sort = function(options) {
    if (options.col === null || this.columns.length <= options.col) {
      return;
    }
    this.rows.sort(function(a, b) {
      a = a[options.col];
      b = b[options.col];
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    this.columns[options.col].sort = true;
    if (options.desc) {
      this.rows.reverse();
      this.columns[options.col].desc = true;
    } else {
      this.columns[options.col].desc = false;
    }
  };
  TableModel.prototype.addColumn = function(col) {
    if (!this.columnMap[col.text]) {
      this.columns.push(col);
      this.columnMap[col.text] = col;
    }
  };
  return TableModel;
})();
exports.default = TableModel;
