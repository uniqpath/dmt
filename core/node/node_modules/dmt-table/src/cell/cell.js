import colors from 'colors/safe';
import kindOf from 'kind-of';
import * as utils from '../utils';

import ColSpanCell from './colSpanCell';
import RowSpanCell from './rowSpanCell';

import Divider from '../divider';

/**
 * A representation of a cell within the table.
 * Implementations must have `init` and `draw` methods,
 * as well as `colSpan`, `rowSpan`, `desiredHeight` and `desiredWidth` properties.
 * @param options
 * @constructor
 */
class Cell {
  constructor(options) {
    this.setOptions(options);
  }

  setOptions(options) {
    if (options instanceof Divider) {
      this.dividerCell = true;
      options = { content: '' };
    }

    if (['boolean', 'number', 'string'].indexOf(kindOf(options)) !== -1) {
      options = { content: '' + options };
    }
    options = options || {};
    this.options = options;
    const { content } = options;
    if (['boolean', 'number', 'string'].indexOf(kindOf(content)) !== -1) {
      this.content = String(content);
    } else if (!content) {
      this.content = '';
    } else {
      throw new Error(`Content needs to be a primitive, got: ${typeof content}`);
    }
    this.colSpan = options.colSpan || 1;
    this.rowSpan = options.rowSpan || 1;
  }

  mergeTableOptions(tableOptions, cells) {
    this.cells = cells;

    const optionsChars = this.options.chars || {};
    const tableChars = tableOptions.chars;
    const chars = (this.chars = {});
    CHAR_NAMES.forEach(name => {
      setOption(optionsChars, tableChars, name, chars);
    });

    this.truncate = this.options.truncate || tableOptions.truncate;

    const style = (this.options.style = this.options.style || {});
    const tableStyle = tableOptions.style;
    setOption(style, tableStyle, 'padding-left', this);
    setOption(style, tableStyle, 'padding-right', this);
    this.head = style.head || tableStyle.head;
    this.border = style.border || tableStyle.border;

    let fixedWidth = tableOptions.colWidths[this.x];
    if (tableOptions.wordWrap && fixedWidth) {
      fixedWidth -= this.paddingLeft + this.paddingRight;
      if (this.colSpan) {
        let i = 1;
        while (i < this.colSpan) {
          fixedWidth += tableOptions.colWidths[this.x + i];
          i++;
        }
      }
      this.lines = utils.wordWrap(fixedWidth, this.content);
    } else {
      this.lines = this.content.split('\n');
    }

    this.desiredWidth = utils.strlen(this.content) + this.paddingLeft + this.paddingRight;
    this.desiredHeight = this.lines.length;
  }

  /**
   * Each cell will have it's `x` and `y` values set by the `layout-manager` prior to
   * `init` being called;
   * @type {Number}
   */

  // Cell.prototype.x = null;
  // Cell.prototype.y = null;

  /**
   * Initializes the Cells data structure.
   *
   * @param tableOptions - A fully populated set of tableOptions.
   * In addition to the standard default values, tableOptions must have fully populated the
   * `colWidths` and `rowWidths` arrays. Those arrays must have lengths equal to the number
   * of columns or rows (respectively) in this table, and each array item must be a Number.
   *
   */
  init(tableOptions) {
    const { x, y } = this;
    this.widths = tableOptions.colWidths.slice(x, x + this.colSpan);
    this.heights = tableOptions.rowHeights.slice(y, y + this.rowSpan);
    this.width = this.widths.reduce(sumPlusOne, -1);
    this.height = this.heights.reduce(sumPlusOne, -1);

    this.hAlign = this.options.hAlign || tableOptions.colAligns[x];
    this.vAlign = this.options.vAlign || tableOptions.rowAligns[y];

    this.drawRight = x + this.colSpan == tableOptions.colWidths.length;
  }

  /**
   * Draws the given line of the cell.
   * This default implementation defers to methods `drawTop`, `drawBottom`, `drawLine` and `drawEmpty`.
   * @param lineNum - can be `top`, `bottom` or a numerical line number.
   * @param spanningCell - will be a number if being called from a RowSpanCell, and will represent how
   * many rows below it's being called from. Otherwise it's undefined.
   * @returns {String} The representation of this line.
   */
  draw(lineNum, spanningCell) {
    if (this.dividerCell) {
      return this.drawDivider(this.drawRight);
    }
    if (lineNum == 'top') return this.drawTop(this.drawRight);
    if (lineNum == 'bottom') return this.drawBottom(this.drawRight);
    const padLen = Math.max(this.height - this.lines.length, 0);
    let padTop;
    switch (this.vAlign) {
      case 'center':
        padTop = Math.ceil(padLen / 2);
        break;
      case 'bottom':
        padTop = padLen;
        break;
      default:
        padTop = 0;
    }
    if (lineNum < padTop || lineNum >= padTop + this.lines.length) {
      return this.drawEmpty(this.drawRight, spanningCell);
    }
    let forceTruncation = this.lines.length > this.height && lineNum + 1 >= this.height;
    return this.drawLine(lineNum - padTop, this.drawRight, forceTruncation, spanningCell);
  }

  /**
   * Renders the top line of the cell.
   * @param drawRight - true if this method should render the right edge of the cell.
   * @returns {String}
   */
  drawTop(drawRight) {
    const content = [];
    if (this.cells) {
      //TODO: cells should always exist - some tests don't fill it in though
      this.widths.forEach((width, index) => {
        content.push(this._topLeftChar(index));
        content.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], width));
      });
    } else {
      content.push(this._topLeftChar(0));
      content.push(utils.repeat(this.chars[this.y == 0 ? 'top' : 'mid'], this.width));
    }
    if (drawRight) {
      content.push(this.chars[this.y == 0 ? 'topRight' : 'rightMid']);
    }
    return this.wrapWithStyleColors('border', content.join(''));
  }

  drawDivider(drawRight) {
    const content = [];
    if (this.cells) {
      //TODO: cells should always exist - some tests don't fill it in though
      this.widths.forEach((width, index) => {
        content.push(this._topLeftChar(index));
        content.push(utils.repeat(this.chars['mid'], width));
      }, this);
    } else {
      content.push(this._topLeftChar(0));
      content.push(utils.repeat(this.chars['mid'], this.width));
    }
    if (drawRight) {
      content.push(this.chars['rightMid']);
    }
    return this.wrapWithStyleColors('border', content.join(''));
  }

  _topLeftChar(offset) {
    const x = this.x + offset;
    let leftChar;
    if (this.y == 0) {
      leftChar = x == 0 ? 'topLeft' : offset == 0 ? 'topMid' : 'top';
    } else if (x == 0) {
      leftChar = 'leftMid';
    } else {
      leftChar = offset == 0 ? 'midMid' : 'bottomMid';
      if (this.cells) {
        //TODO: cells should always exist - some tests don't fill it in though
        const spanAbove = this.cells[this.y - 1][x] instanceof ColSpanCell;
        if (spanAbove) {
          leftChar = offset == 0 ? 'topMid' : 'mid';
        }
        if (offset == 0) {
          let i = 1;
          while (this.cells[this.y][x - i] instanceof ColSpanCell) {
            i++;
          }
          if (this.cells[this.y][x - i] instanceof RowSpanCell) {
            leftChar = 'leftMid';
          }
        }
      }
    }

    return this.chars[leftChar];
  }

  wrapWithStyleColors(styleProperty, content) {
    if (this[styleProperty] && this[styleProperty].length) {
      try {
        for (let i = this[styleProperty].length - 1; i >= 0; i--) {
          colors = colors[this[styleProperty][i]];
        }
        return colors(content);
      } catch (e) {
        return content;
      }
    } else {
      return content;
    }
  }

  /**
   * Renders a line of text.
   * @param lineNum - Which line of text to render. This is not necessarily the line within the cell.
   * There may be top-padding above the first line of text.
   * @param drawRight - true if this method should render the right edge of the cell.
   * @param forceTruncationSymbol - `true` if the rendered text should end with the truncation symbol even
   * if the text fits. This is used when the cell is vertically truncated. If `false` the text should
   * only include the truncation symbol if the text will not fit horizontally within the cell width.
   * @param spanningCell - a number of if being called from a RowSpanCell. (how many rows below). otherwise undefined.
   * @returns {String}
   */
  drawLine(lineNum, drawRight, forceTruncationSymbol, spanningCell) {
    let left = this.chars[this.x == 0 ? 'left' : 'middle'];
    if (this.x && spanningCell && this.cells) {
      let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
      while (cellLeft instanceof ColSpanCell) {
        cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
      }
      if (!(cellLeft instanceof RowSpanCell)) {
        left = this.chars.rightMid;
      }
    }
    const leftPadding = utils.repeat(' ', this.paddingLeft);
    const right = drawRight ? this.chars.right : '';
    const rightPadding = utils.repeat(' ', this.paddingRight);
    let line = this.lines[lineNum];
    const len = this.width - (this.paddingLeft + this.paddingRight);
    if (forceTruncationSymbol) line += this.truncate || '…';
    let content = utils.truncate(line, len, this.truncate);
    content = utils.pad(content, len, ' ', this.hAlign);
    content = leftPadding + content + rightPadding;
    return this.stylizeLine(left, content, right);
  }

  stylizeLine(left, content, right) {
    left = this.wrapWithStyleColors('border', left);
    right = this.wrapWithStyleColors('border', right);
    if (this.y === 0) {
      content = this.wrapWithStyleColors('head', content);
    }
    return left + content + right;
  }

  /**
   * Renders the bottom line of the cell.
   * @param drawRight - true if this method should render the right edge of the cell.
   * @returns {String}
   */
  drawBottom(drawRight) {
    const left = this.chars[this.x == 0 ? 'bottomLeft' : 'bottomMid'];
    const content = utils.repeat(this.chars.bottom, this.width);
    const right = drawRight ? this.chars.bottomRight : '';
    return this.wrapWithStyleColors('border', left + content + right);
  }

  /**
   * Renders a blank line of text within the cell. Used for top and/or bottom padding.
   * @param drawRight - true if this method should render the right edge of the cell.
   * @param spanningCell - a number of if being called from a RowSpanCell. (how many rows below). otherwise undefined.
   * @returns {String}
   */
  drawEmpty(drawRight, spanningCell) {
    let left = this.chars[this.x == 0 ? 'left' : 'middle'];
    if (this.x && spanningCell && this.cells) {
      let cellLeft = this.cells[this.y + spanningCell][this.x - 1];
      while (cellLeft instanceof ColSpanCell) {
        cellLeft = this.cells[cellLeft.y][cellLeft.x - 1];
      }
      if (!(cellLeft instanceof RowSpanCell)) {
        left = this.chars.rightMid;
      }
    }
    const right = drawRight ? this.chars.right : '';
    const content = utils.repeat(' ', this.width);
    return this.stylizeLine(left, content, right);
  }
}

// HELPER FUNCTIONS
function setOption(objA, objB, nameB, targetObj) {
  let nameA = nameB.split('-');
  if (nameA.length > 1) {
    nameA[1] = nameA[1].charAt(0).toUpperCase() + nameA[1].substr(1);
    nameA = nameA.join('');
    targetObj[nameA] = objA[nameA] || objA[nameB] || objB[nameA] || objB[nameB];
  } else {
    targetObj[nameB] = objA[nameB] || objB[nameB];
  }
}

function sumPlusOne(a, b) {
  return a + b + 1;
}

let CHAR_NAMES = [
  'top',
  'top-mid',
  'top-left',
  'top-right',
  'bottom',
  'bottom-mid',
  'bottom-left',
  'bottom-right',
  'left',
  'left-mid',
  'mid',
  'mid-mid',
  'right',
  'right-mid',
  'middle'
];

export { Cell, ColSpanCell, RowSpanCell };
