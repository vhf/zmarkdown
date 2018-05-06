'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var visit = require('unist-util-visit');

var mainLineRegex = new RegExp(/((\+)|(\|)).+((\|)|(\+))/);
var totalMainLineRegex = new RegExp(/^((\+)|(\|)).+((\|)|(\+))$/);
var headerLineRegex = new RegExp(/^\+=[=+]+=\+$/);
var partLineRegex = new RegExp(/\+-[-+]+-\+/);
var separationLineRegex = new RegExp(/^\+-[-+]+-\+$/);

module.exports = plugin;

// A small class helping table generation

var Table = function () {
  function Table(linesInfos) {
    _classCallCheck(this, Table);

    this._parts = [];
    this._linesInfos = linesInfos;
    this.addPart();
  }

  _createClass(Table, [{
    key: 'lastPart',
    value: function lastPart() {
      return this._parts[this._parts.length - 1];
    }
  }, {
    key: 'addPart',
    value: function addPart() {
      this._parts.push(new TablePart(this._linesInfos));
    }
  }]);

  return Table;
}();

var TablePart = function () {
  function TablePart(linesInfos) {
    _classCallCheck(this, TablePart);

    this._rows = [];
    this._linesInfos = linesInfos;
    this.addRow();
  }

  _createClass(TablePart, [{
    key: 'addRow',
    value: function addRow() {
      this._rows.push(new TableRow(this._linesInfos));
    }
  }, {
    key: 'removeLastRow',
    value: function removeLastRow() {
      this._rows.pop();
    }
  }, {
    key: 'lastRow',
    value: function lastRow() {
      return this._rows[this._rows.length - 1];
    }
  }, {
    key: 'updateWithMainLine',
    value: function updateWithMainLine(line, isEndLine) {
      // Update last row according to a line.
      var mergeChars = isEndLine ? '+|' : '|';
      var newCells = [this.lastRow()._cells[0]];
      for (var c = 1; c < this.lastRow()._cells.length; ++c) {
        var cell = this.lastRow()._cells[c];

        // Only cells with rowspan equals can be merged
        // Test if the char before the cell is a separation character
        if (cell._rowspan === newCells[newCells.length - 1]._rowspan && !mergeChars.includes(line[cell._startPosition - 1])) {
          newCells[newCells.length - 1].mergeWith(cell);
        } else {
          newCells.push(cell);
        }
      }
      this.lastRow()._cells = newCells;
    }
  }, {
    key: 'updateWithPartLine',
    value: function updateWithPartLine(line) {
      // Get cells not finished
      var remainingCells = [];
      for (var c = 0; c < this.lastRow()._cells.length; ++c) {
        var cell = this.lastRow()._cells[c];
        var partLine = line.substring(cell._startPosition - 1, cell._endPosition + 1);
        if (!isSeparationLine(partLine)) {
          cell._lines.push(line.substring(cell._startPosition, cell._endPosition));
          cell._rowspan += 1;
          remainingCells.push(cell);
        }
      }
      // Generate new row
      this.addRow();
      var newCells = [];
      for (var _c = 0; _c < remainingCells.length; ++_c) {
        var remainingCell = remainingCells[_c];
        for (var cc = 0; cc < this.lastRow()._cells.length; ++cc) {
          var _cell = this.lastRow()._cells[cc];
          if (_cell._endPosition < remainingCell._startPosition && !newCells.includes(_cell)) {
            newCells.push(_cell);
          }
        }
        newCells.push(remainingCell);
        for (var _cc = 0; _cc < this.lastRow()._cells.length; ++_cc) {
          var _cell2 = this.lastRow()._cells[_cc];
          if (_cell2._startPosition > remainingCell._endPosition && !newCells.includes(_cell2)) {
            newCells.push(_cell2);
          }
        }
      }

      // Remove duplicates
      for (var nc = 0; nc < newCells.length; ++nc) {
        var newCell = newCells[nc];
        for (var ncc = 0; ncc < newCells.length; ++ncc) {
          if (nc !== ncc) {
            var other = newCells[ncc];
            if (other._startPosition >= newCell._startPosition && other._endPosition <= newCell._endPosition) {
              if (other._lines.length === 0) {
                newCells.splice(ncc, 1);
                ncc -= 1;
                if (nc > ncc) {
                  nc -= 1;
                  newCell = newCells[nc];
                }
              }
            }
          }
        }
      }
      this.lastRow()._cells = newCells;
    }
  }]);

  return TablePart;
}();

var TableRow = function () {
  function TableRow(linesInfos) {
    _classCallCheck(this, TableRow);

    this._linesInfos = linesInfos;
    this._cells = [];
    for (var i = 0; i < linesInfos.length - 1; ++i) {
      this._cells.push(new TableCell(linesInfos[i] + 1, linesInfos[i + 1]));
    }
  }

  _createClass(TableRow, [{
    key: 'updateContent',
    value: function updateContent(line) {
      for (var c = 0; c < this._cells.length; ++c) {
        var cell = this._cells[c];
        cell._lines.push(line.substring(cell._startPosition, cell._endPosition));
      }
    }
  }]);

  return TableRow;
}();

var TableCell = function () {
  function TableCell(startPosition, endPosition) {
    _classCallCheck(this, TableCell);

    this._startPosition = startPosition;
    this._endPosition = endPosition;
    this._colspan = 1;
    this._rowspan = 1;
    this._lines = [];
  }

  _createClass(TableCell, [{
    key: 'mergeWith',
    value: function mergeWith(other) {
      this._endPosition = other._endPosition;
      this._colspan += other._colspan;
      var newLines = [];
      for (var l = 0; l < this._lines.length; ++l) {
        newLines.push(this._lines[l] + '|' + other._lines[l]);
      }
      this._lines = newLines;
    }
  }]);

  return TableCell;
}();

function merge(beforeTable, gridTable, afterTable) {
  // get the eaten text
  var total = beforeTable.join('\n');
  if (total.length) {
    total += '\n';
  }
  total += gridTable.join('\n');
  if (afterTable.join('\n').length) {
    total += '\n';
  }
  total += afterTable.join('\n');
  return total;
}

function isSeparationLine(line) {
  return separationLineRegex.exec(line);
}

function isHeaderLine(line) {
  return headerLineRegex.exec(line);
}

function isPartLine(line) {
  return partLineRegex.exec(line);
}

function findAll(content, characters) {
  var pos = [];
  for (var i = 0; i < content.length; ++i) {
    var char = content[i];
    if (characters.includes(char)) {
      pos.push(i);
    }
  }
  return pos;
}

function computePlainLineColumnsStartingPositions(line) {
  return findAll(line, '+|');
}

function mergeColumnsStartingPositions(allPos) {
  // Get all starting positions, allPos is an array of array of positions
  var positions = [];

  allPos.forEach(function (posRow) {
    return posRow.forEach(function (pos) {
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    });
  });

  return positions.sort(function (a, b) {
    return a - b;
  });
}

function computeColumnStartingPositions(lines) {
  var linesInfo = [];

  lines.forEach(function (line) {
    if (isHeaderLine(line) || isPartLine(line)) {
      linesInfo.push(computePlainLineColumnsStartingPositions(line));
    }
  });

  return mergeColumnsStartingPositions(linesInfo);
}

function extractTable(value, eat, tokenizer) {
  // Extract lines before the grid table
  var possibleGridTable = value.split('\n');
  var i = 0;
  var before = [];
  for (; i < possibleGridTable.length; ++i) {
    var line = possibleGridTable[i];
    if (isSeparationLine(line)) break;
    if (line.length === 0) break;
    before.push(line);
  }

  // Extract table
  if (!possibleGridTable[i + 1]) return [null, null, null, null];
  var lineLength = possibleGridTable[i + 1].length;
  var gridTable = [];
  var hasHeader = false;
  for (; i < possibleGridTable.length; ++i) {
    var _line = possibleGridTable[i];
    var isMainLine = totalMainLineRegex.exec(_line);
    // line is in table
    if (isMainLine && _line.length === lineLength) {
      var _isHeaderLine = headerLineRegex.exec(_line);
      if (_isHeaderLine && !hasHeader) hasHeader = true;
      // A table can't have 2 headers
      else if (_isHeaderLine && hasHeader) {
          break;
        }
      gridTable.push(_line);
    } else {
      // this line is not in the grid table.
      break;
    }
  }

  // if the last line is not a plain line
  if (!separationLineRegex.exec(gridTable[gridTable.length - 1])) {
    // Remove lines not in the table
    for (var j = gridTable.length - 1; j >= 0; --j) {
      var isSeparation = separationLineRegex.exec(gridTable[j]);
      if (isSeparation) break;
      gridTable.pop();
      i -= 1;
    }
  }

  // Extract lines after table
  var after = [];
  for (; i < possibleGridTable.length; ++i) {
    var _line2 = possibleGridTable[i];
    if (_line2.length === 0) break;
    after.push(_line2);
  }

  return [before, gridTable, after, hasHeader];
}

function extractTableContent(lines, linesInfos, hasHeader) {
  var table = new Table(linesInfos);

  for (var l = 0; l < lines.length; ++l) {
    var line = lines[l];
    // Get if the line separate the head of the table from the body
    var matchHeader = hasHeader & isHeaderLine(line) !== null;
    // Get if the line close some cells
    var isEndLine = matchHeader | isPartLine(line) !== null;

    if (isEndLine) {
      // It is a header, a plain line or a line with plain line part.
      // First, update the last row
      table.lastPart().updateWithMainLine(line, isEndLine);

      // Create the new row
      if (l !== 0) {
        if (matchHeader) {
          table.addPart();
        } else if (isSeparationLine(line)) {
          table.lastPart().addRow();
        } else {
          table.lastPart().updateWithPartLine(line);
        }
      }
      // update the last row
      table.lastPart().updateWithMainLine(line, isEndLine);
    } else {
      // it's a plain line
      table.lastPart().updateWithMainLine(line, isEndLine);
      table.lastPart().lastRow().updateContent(line);
    }
  }
  // Because the last line is a separation, the last row is always empty
  table.lastPart().removeLastRow();
  return table;
}

function generateTable(tableContent, now, tokenizer) {
  // Generate the gridTable node to insert in the AST
  var tableElt = {
    type: 'gridTable',
    children: [],
    data: {
      hName: 'table'
    }
  };

  var hasHeader = tableContent._parts.length > 1;

  for (var p = 0; p < tableContent._parts.length; ++p) {
    var part = tableContent._parts[p];
    var partElt = {
      type: 'tableHeader',
      children: [],
      data: {
        hName: hasHeader && p === 0 ? 'thead' : 'tbody'
      }
    };
    for (var r = 0; r < part._rows.length; ++r) {
      var row = part._rows[r];
      var rowElt = {
        type: 'tableRow',
        children: [],
        data: {
          hName: 'tr'
        }
      };
      for (var c = 0; c < row._cells.length; ++c) {
        var cell = row._cells[c];
        var cellElt = {
          type: 'tableCell',
          children: tokenizer.tokenizeBlock(cell._lines.map(function (e) {
            return e.trim();
          }).join('\n'), now),
          data: {
            hName: hasHeader && p === 0 ? 'th' : 'td',
            hProperties: {
              colspan: cell._colspan,
              rowspan: cell._rowspan
            }
          }
        };

        var endLine = r + cell._rowspan;
        if (cell._rowspan > 1 && endLine - 1 < part._rows.length) {
          for (var rs = 1; rs < cell._rowspan; ++rs) {
            for (var cc = 0; cc < part._rows[r + rs]._cells.length; ++cc) {
              var other = part._rows[r + rs]._cells[cc];
              if (cell._startPosition === other._startPosition && cell._endPosition === other._endPosition && cell._colspan === other._colspan && cell._rowspan === other._rowspan && cell._lines === other._lines) {
                part._rows[r + rs]._cells.splice(cc, 1);
              }
            }
          }
        }

        rowElt.children.push(cellElt);
      }
      partElt.children.push(rowElt);
    }
    tableElt.children.push(partElt);
  }

  return tableElt;
}

function gridTableTokenizer(eat, value, silent) {
  var keep = mainLineRegex.exec(value);
  if (!keep) return;

  var _extractTable = extractTable(value, eat, this),
      _extractTable2 = _slicedToArray(_extractTable, 4),
      before = _extractTable2[0],
      gridTable = _extractTable2[1],
      after = _extractTable2[2],
      hasHeader = _extractTable2[3];

  if (!gridTable || gridTable.length < 3) return;

  var now = eat.now();
  var linesInfos = computeColumnStartingPositions(gridTable);
  var tableContent = extractTableContent(gridTable, linesInfos, hasHeader);
  var tableElt = generateTable(tableContent, now, this);
  var merged = merge(before, gridTable, after);

  // Because we can't add multiples blocs in one eat, I use a temp block
  var wrapperBlock = {
    type: 'element',
    tagName: 'WrapperBlock',
    children: []
  };
  if (before.length) {
    wrapperBlock.children.push(this.tokenizeBlock(before.join('\n'), now)[0]);
  }
  wrapperBlock.children.push(tableElt);
  if (after.length) {
    wrapperBlock.children.push(this.tokenizeBlock(after.join('\n'), now)[0]);
  }
  return eat(merged)(wrapperBlock);
}

function deleteWrapperBlock() {
  function one(node, index, parent) {
    if (!node.children) return;

    var newChildren = [];
    var replace = false;
    for (var c = 0; c < node.children.length; ++c) {
      var child = node.children[c];
      if (child.tagName === 'WrapperBlock' && child.type === 'element') {
        replace = true;
        for (var cc = 0; cc < child.children.length; ++cc) {
          newChildren.push(child.children[cc]);
        }
      } else {
        newChildren.push(child);
      }
    }
    if (replace) {
      node.children = newChildren;
    }
  }
  return one;
}

function transformer(tree) {
  // Remove the temporary block in which we previously wrapped the table parts
  visit(tree, deleteWrapperBlock());
}

function createGrid(nbRows, nbCols) {
  var grid = [];

  for (var i = 0; i < nbRows; i++) {
    grid.push([]);
    for (var j = 0; j < nbCols; j++) {
      grid[i].push({ h: -1, w: -1, b: true, r: true });
    }
  }

  return grid;
}

function setWeight(grid, i, j, cols) {
  /* To do it, we put enougth space to write the text.
   * For multi-cell, we divid it among the cells. */
  var W = Math.max.apply(Math, _toConsumableArray(Array.from(grid[i][j].value).map(function (x) {
    return x.length;
  }))) + 2;

  grid[i].forEach(function (_, c) {
    if (c < cols) {
      // To divid
      var w = Math.ceil(W / (cols - c)); // cols - c will be 1 for the last cell
      W -= w;
      grid[i][j + c].w = w;
    }
  });
}

function setHeigth(grid, i, j, values) {
  // To do it, we count the line. Extra length to cell with a pipe
  // in the value of the last line, to not be confuse with a border.
  grid[i][j].h = values.length;
  // Extra line
  if (values[values.length - 1].indexOf('|') > 0) {
    grid[i][j].h += 1;
  }
}

function extractAST(gridNode, grid, nbRows, nbCols, getMD) {
  var _this = this;

  var i = 0;
  /* Fill the grid with value, heigth and weight from the ast */
  gridNode.children.forEach(function (th) {
    th.children.forEach(function (row) {
      row.children.forEach(function (cell, j) {
        var X = 0;

        while (grid[i][j + X].v) {
          X++;
        }grid[i][j + X].value = _this.all(cell).join('\n\n').split('\n');

        setHeigth(grid, i, j + X, grid[i][j + X].value);
        setWeight(grid, i, j + X, cell.data.hProperties.colspan);

        // If we have an empty 1x1 grid, we fill it up with a useless space
        // Otherwise, it will not be parsed.
        if (nbCols === nbRows && nbCols === 1 && !grid[0][0].value.join('\n')) {
          grid[0][0].value = ' ';
          grid[0][0].w = 3;
        }

        // Define the border of each cell
        for (var x = 0; x < cell.data.hProperties.rowspan; x++) {
          for (var y = 0; y < cell.data.hProperties.colspan; y++) {
            // b attribute is for bottom
            grid[i + x][j + X + y].b = x + 1 === cell.data.hProperties.rowspan;
            // r attribute is for right
            grid[i + x][j + X + y].r = y + 1 === cell.data.hProperties.colspan;

            // set v if a cell has ever been define
            grid[i + x][j + X + y].v = true;
          }
        }
      });
      i++;
    });
  });

  // If they is 2 differents tableHeader, so the first one is a header and
  // should be underlined
  if (gridNode.children.length > 1) {
    grid[gridNode.children[0].children.length - 1][0].H = true;
  }
}

function setSize(grid) {
  // The idea is the max win

  // Set the height of each column
  grid.forEach(function (row) {
    // Find the max
    var mH = Math.max.apply(Math, _toConsumableArray(row.map(function (cell) {
      return cell.h;
    })));

    // Set it to each cell
    row.forEach(function (cell) {
      cell.h = mH;
    });
  });

  // Set the weight of each row
  grid[0].forEach(function (_, j) {
    // Find the max
    var mW = Math.max.apply(Math, _toConsumableArray(grid.map(function (row) {
      return row[j].w;
    })));

    // Set it to each cell
    grid.forEach(function (row) {
      row[j].w = mW;
    });
  });
}
function generateBorders(grid, nbRows, nbCols, gridString) {
  /** **** Create the borders *******/

  // Create the first line
  /*
   * We have to create the first line manually because
   * we process the borders from the attributes bottom
   * and right of each cell. For the first line, their
   * is no bottom nor right cell.
   *
   * We only need the right attribute of the first row's
   * cells
   */
  var first = '+';
  grid[0].forEach(function (cell, i) {
    first += '-'.repeat(cell.w);
    first += cell.r || i === nbCols - 1 ? '+' : '-';
  });

  gridString.push(first);

  grid.forEach(function (row, i) {
    var line = '';

    // Cells lines
    // The inner of the cell
    line = '|';
    row.forEach(function (cell) {
      cell.y = gridString.length;
      cell.x = line.length + 1;
      line += ' '.repeat(cell.w);
      line += cell.r ? '|' : ' ';
    });

    // Add it until the text can fit
    for (var t = 0; t < row[0].h; t++) {
      gridString.push(line);
    }

    // "End" line
    // It's the last line of the cell. Actually the border.
    line = row[0].b ? '+' : '|';

    row.forEach(function (cell, j) {
      var c = ' ';

      if (cell.b) {
        if (row[0].H) {
          c = '=';
        } else {
          c = '-';
        }
      }

      line += c.repeat(cell.w);

      if (cell.b || j + 1 < nbCols && grid[i][j + 1].b) {
        if (cell.r || i + 1 < nbRows && grid[i + 1][j].r) {
          line += '+';
        } else {
          line += row[0].H ? '=' : '-';
        }
      } else if (cell.r || i + 1 < nbRows && grid[i + 1][j].r) {
        line += '|';
      } else {
        line += ' ';
      }
    });

    gridString.push(line);
  });
}

function writeText(grid, gridString) {
  grid.forEach(function (row) {
    row.forEach(function (cell) {
      if (cell.value && cell.value[0]) {
        for (var t = 0; t < cell.value.length; t++) {
          var h = cell.y + t;
          var line = cell.value[t];
          var lineEdit = gridString[h];

          gridString[h] = lineEdit.substr(0, cell.x);
          gridString[h] += line;
          gridString[h] += lineEdit.substr(cell.x + line.length);
        }
      }
    });
  });
}

function stringifyGridTables(gridNode) {
  var gridString = [];

  var nbRows = gridNode.children.map(function (th) {
    return th.children.length;
  }).reduce(function (a, b) {
    return a + b;
  });
  var nbCols = gridNode.children[0].children[0].children.map(function (c) {
    return c.data.hProperties.colspan;
  }).reduce(function (a, b) {
    return a + b;
  });

  var grid = createGrid(nbRows, nbCols);

  /* First, we extract the information
   * then, we set the size(2) of the border
   * and create it(3).
   * Finaly we fill it up.
   */

  extractAST.bind(this)(gridNode, grid, nbRows, nbCols);

  setSize(grid);

  generateBorders(grid, nbRows, nbCols, gridString);

  writeText(grid, gridString);

  return gridString.join('\n');
}

function plugin() {
  var Parser = this.Parser;

  // Inject blockTokenizer
  var blockTokenizers = Parser.prototype.blockTokenizers;
  var blockMethods = Parser.prototype.blockMethods;
  blockTokenizers.grid_table = gridTableTokenizer;
  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'grid_table');

  var Compiler = this.Compiler;

  // Stringify
  if (Compiler) {
    var visitors = Compiler.prototype.visitors;
    if (!visitors) return;

    visitors.gridTable = stringifyGridTables;
  }

  return transformer;
}