/**
 * A placeholder Cell for a Cell that spans multiple rows.
 * It delegates rendering to the original cell, but adds the appropriate offset.
 * @param originalCell
 * @constructor
 */

function findDimension(dimensionTable, startingIndex, span) {
  let ret = dimensionTable[startingIndex];
  for (let i = 1; i < span; i++) {
    ret += 1 + dimensionTable[startingIndex + i];
  }
  return ret;
}

class RowSpanCell {
  constructor(originalCell) {
    this.originalCell = originalCell;
  }

  init(tableOptions) {
    const { y } = this;
    const originalY = this.originalCell.y;
    this.cellOffset = y - originalY;
    this.offset = findDimension(tableOptions.rowHeights, originalY, this.cellOffset);
  }

  draw(lineNum) {
    if (lineNum == 'top') {
      return this.originalCell.draw(this.offset, this.cellOffset);
    }
    if (lineNum == 'bottom') {
      return this.originalCell.draw('bottom');
    }
    return this.originalCell.draw(this.offset + 1 + lineNum);
  }

  mergeTableOptions() {}
}

export default RowSpanCell;
