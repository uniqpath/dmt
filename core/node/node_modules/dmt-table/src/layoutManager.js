import kindOf from 'kind-of';
import { Cell, RowSpanCell, ColSpanCell } from './cell/cell';
import Divider from './divider';

function layoutTable(table) {
  table.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      cell.y = rowIndex;
      cell.x = columnIndex;
      for (let y = rowIndex; y >= 0; y--) {
        const row2 = table[y];
        const xMax = y === rowIndex ? columnIndex : row2.length;
        for (let x = 0; x < xMax; x++) {
          const cell2 = row2[x];
          while (cellsConflict(cell, cell2)) {
            cell.x++;
          }
        }
      }
    });
  });
}

function maxWidth(table) {
  let mw = 0;
  table.forEach(row => {
    row.forEach(cell => {
      mw = Math.max(mw, cell.x + (cell.colSpan || 1));
    });
  });
  return mw;
}

function maxHeight(table) {
  return table.length;
}

function cellsConflict(cell1, cell2) {
  const yMin1 = cell1.y;
  const yMax1 = cell1.y - 1 + (cell1.rowSpan || 1);
  const yMin2 = cell2.y;
  const yMax2 = cell2.y - 1 + (cell2.rowSpan || 1);
  const yConflict = !(yMin1 > yMax2 || yMin2 > yMax1);

  const xMin1 = cell1.x;
  const xMax1 = cell1.x - 1 + (cell1.colSpan || 1);
  const xMin2 = cell2.x;
  const xMax2 = cell2.x - 1 + (cell2.colSpan || 1);
  const xConflict = !(xMin1 > xMax2 || xMin2 > xMax1);

  return yConflict && xConflict;
}

function conflictExists(rows, x, y) {
  const i_max = Math.min(rows.length - 1, y);
  const cell = { x, y };
  for (let i = 0; i <= i_max; i++) {
    const row = rows[i];
    for (let j = 0; j < row.length; j++) {
      if (cellsConflict(cell, row[j])) {
        return true;
      }
    }
  }
  return false;
}

function allBlank(rows, y, xMin, xMax) {
  for (let x = xMin; x < xMax; x++) {
    if (conflictExists(rows, x, y)) {
      return false;
    }
  }
  return true;
}

function addRowSpanCells(table) {
  table.forEach((row, rowIndex) => {
    row.forEach(cell => {
      for (let i = 1; i < cell.rowSpan; i++) {
        const rowSpanCell = new RowSpanCell(cell);
        rowSpanCell.x = cell.x;
        rowSpanCell.y = cell.y + i;
        rowSpanCell.colSpan = cell.colSpan;
        insertCell(rowSpanCell, table[rowIndex + i]);
      }
    });
  });
}

function addColSpanCells(cellRows) {
  for (let rowIndex = cellRows.length - 1; rowIndex >= 0; rowIndex--) {
    const cellColumns = cellRows[rowIndex];
    for (let columnIndex = 0; columnIndex < cellColumns.length; columnIndex++) {
      const cell = cellColumns[columnIndex];
      for (let k = 1; k < cell.colSpan; k++) {
        let colSpanCell = new ColSpanCell();
        colSpanCell.x = cell.x + k;
        colSpanCell.y = cell.y;
        cellColumns.splice(columnIndex + 1, 0, colSpanCell);
      }
    }
  }
}

function insertCell(cell, row) {
  let x = 0;
  while (x < row.length && row[x].x < cell.x) {
    x++;
  }
  row.splice(x, 0, cell);
}

function fillInTable(table) {
  const h_max = maxHeight(table);
  const w_max = maxWidth(table);
  for (let y = 0; y < h_max; y++) {
    for (let x = 0; x < w_max; x++) {
      if (!conflictExists(table, x, y)) {
        let opts = { x, y, colSpan: 1, rowSpan: 1 };
        x++;
        while (x < w_max && !conflictExists(table, x, y)) {
          opts.colSpan++;
          x++;
        }
        let y2 = y + 1;
        while (y2 < h_max && allBlank(table, y2, opts.x, opts.x + opts.colSpan)) {
          opts.rowSpan++;
          y2++;
        }

        const cell = new Cell(opts);
        cell.x = opts.x;
        cell.y = opts.y;
        insertCell(cell, table[y]);
      }
    }
  }
}

function generateCells(rows) {
  return rows.map(row => {
    if (row instanceof Divider) {
      const numCells = rows[0].length;

      // https://stackoverflow.com/a/34104348/458177
      return Array(numCells)
        .fill(new Divider())
        .map(cell => {
          return new Cell(cell); // 'special divider cells! Divider row is multiplied into multiple Divider cells
        });
    }

    if (kindOf(row) !== 'array') {
      const key = Object.keys(row)[0];
      row = row[key];
      if (kindOf(row) === 'array') {
        row = row.slice();
        row.unshift(key);
      } else {
        row = [key, row];
      }
    }
    return row.map(cell => {
      return new Cell(cell);
    });
  });
}

function makeTableLayout(rows) {
  const cellRows = generateCells(rows);

  layoutTable(cellRows);
  fillInTable(cellRows);
  addRowSpanCells(cellRows);
  addColSpanCells(cellRows);
  return cellRows;
}

function makeComputeWidths(colSpan, desiredWidth, x, forcedMin) {
  return (vals, table) => {
    const result = [];
    const spanners = [];
    table.forEach(row => {
      row.forEach(cell => {
        if ((cell[colSpan] || 1) > 1) {
          spanners.push(cell);
        } else {
          result[cell[x]] = Math.max(result[cell[x]] || 0, cell[desiredWidth] || 0, forcedMin);
        }
      });
    });

    vals.forEach((val, index) => {
      if (kindOf(val) === 'number') {
        result[index] = val;
      }
    });

    for (let k = spanners.length - 1; k >= 0; k--) {
      const cell = spanners[k];
      const span = cell[colSpan];
      const col = cell[x];
      let existingWidth = result[col];
      let editableCols = kindOf(vals[col]) === 'number' ? 0 : 1;
      for (let i = 1; i < span; i++) {
        existingWidth += 1 + result[col + i];
        if (kindOf(vals[col + i]) !== 'number') {
          editableCols++;
        }
      }
      if (cell[desiredWidth] > existingWidth) {
        let i = 0;
        while (editableCols > 0 && cell[desiredWidth] > existingWidth) {
          if (kindOf(vals[col + i]) !== 'number') {
            const dif = Math.round((cell[desiredWidth] - existingWidth) / editableCols);
            existingWidth += dif;
            result[col + i] += dif;
            editableCols--;
          }
          i++;
        }
      }
    }

    Object.assign(vals, result);
    for (let j = 0; j < vals.length; j++) {
      vals[j] = Math.max(forcedMin, vals[j] || 0);
    }
  };
}

const computeWidths = makeComputeWidths('colSpan', 'desiredWidth', 'x', 1);
const computeHeights = makeComputeWidths('rowSpan', 'desiredHeight', 'y', 1);

export { makeTableLayout, layoutTable, addRowSpanCells, maxWidth, fillInTable, computeWidths, computeHeights };
