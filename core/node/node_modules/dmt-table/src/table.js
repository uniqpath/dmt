import * as utils from './utils';
import * as tableLayout from './layoutManager';

import Divider from './divider';

class Table extends Array {
  constructor(options) {
    super();

    this.options = utils.mergeOptions(options);
  }

  toString() {
    let array = this;
    const headersPresent = this.options.head && this.options.head.length;
    if (headersPresent) {
      array = [this.options.head];
      if (this.length) {
        array.push(...this);
      }
    } else {
      this.options.style.head = [];
    }

    const cells = tableLayout.makeTableLayout(array);

    //console.log(cells.length);

    cells.forEach(row => {
      row.forEach(cell => {
        cell.mergeTableOptions(this.options, cells);
      }, this);
    }, this);

    tableLayout.computeWidths(this.options.colWidths, cells);
    tableLayout.computeHeights(this.options.rowHeights, cells);

    cells.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        cell.init(this.options);
      }, this);
    }, this);

    const result = [];

    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      const row = cells[rowIndex];
      const heightOfRow = this.options.rowHeights[rowIndex];

      if (rowIndex === 0 || !this.options.style.compact || (rowIndex == 1 && headersPresent)) {
        //console.log(rowIndex);
        this.doDraw(row, 'top', result);
      }

      for (let lineNum = 0; lineNum < heightOfRow; lineNum++) {
        this.doDraw(row, lineNum, result);
      }

      if (rowIndex + 1 == cells.length) {
        this.doDraw(row, 'bottom', result);
      }
    }

    return result.join('\n');
  }

  doDraw(row, lineNum, result) {
    const line = [];

    row.forEach(cell => {
      line.push(cell.draw(lineNum));
    });
    const str = line.join('');
    if (str.length) result.push(str);
  }

  get width() {
    const str = this.toString().split('\n');
    return str[0].length;
  }
}

Object.defineProperty(Table, 'divider', { value: new Divider() });

export default Table;
