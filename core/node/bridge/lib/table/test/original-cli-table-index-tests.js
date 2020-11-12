describe('@api original-cli-table index tests', function() {
  var Table = require('../src/table');
  var chai = require('chai');
  var expect = chai.expect;

  it('test complete table', function() {
    var table = new Table({
      head: ['Rel', 'Change', 'By', 'When'],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: [],
        border: []
      },
      colWidths: [6, 21, 25, 17]
    });

    table.push(
      ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '7 minutes ago'],
      ['v0.1', 'Testing something cool', 'rauchg@gmail.com', '8 minutes ago']
    );

    var expected = [
      '┌──────┬─────────────────────┬─────────────────────────┬─────────────────┐',
      '│ Rel  │ Change              │ By                      │ When            │',
      '├──────┼─────────────────────┼─────────────────────────┼─────────────────┤',
      '│ v0.1 │ Testing something … │ rauchg@gmail.com        │ 7 minutes ago   │',
      '├──────┼─────────────────────┼─────────────────────────┼─────────────────┤',
      '│ v0.1 │ Testing something … │ rauchg@gmail.com        │ 8 minutes ago   │',
      '└──────┴─────────────────────┴─────────────────────────┴─────────────────┘'
    ];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test width property', function() {
    var table = new Table({
      head: ['Cool'],
      style: {
        head: [],
        border: []
      }
    });

    expect(table.width).to.equal(8);
  });

  it('test vertical table output', function() {
    var table = new Table({ style: { 'padding-left': 0, 'padding-right': 0, head: [], border: [] } });

    table.push({ 'v0.1': 'Testing something cool' }, { 'v0.1': 'Testing something cool' });

    var expected = [
      '┌────┬──────────────────────┐',
      '│v0.1│Testing something cool│',
      '├────┼──────────────────────┤',
      '│v0.1│Testing something cool│',
      '└────┴──────────────────────┘'
    ];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test cross table output', function() {
    var table = new Table({ head: ['', 'Header 1', 'Header 2'], style: { 'padding-left': 0, 'padding-right': 0, head: [], border: [] } });

    table.push({ 'Header 3': ['v0.1', 'Testing something cool'] }, { 'Header 4': ['v0.1', 'Testing something cool'] });

    var expected = [
      '┌────────┬────────┬──────────────────────┐',
      '│        │Header 1│Header 2              │',
      '├────────┼────────┼──────────────────────┤',
      '│Header 3│v0.1    │Testing something cool│',
      '├────────┼────────┼──────────────────────┤',
      '│Header 4│v0.1    │Testing something cool│',
      '└────────┴────────┴──────────────────────┘'
    ];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test table colors', function() {
    var table = new Table({
      head: ['Rel', 'By'],
      style: { head: ['red'], border: ['grey'] }
    });

    var off = '\u001b[39m',
      red = '\u001b[31m',
      orange = '\u001b[38;5;221m',
      grey = '\u001b[90m',
      c256s = orange + 'v0.1' + off;

    table.push([c256s, 'rauchg@gmail.com']);

    var expected = [
      grey + '┌──────' + off + grey + '┬──────────────────┐' + off,
      grey + '│' + off + red + ' Rel  ' + off + grey + '│' + off + red + ' By               ' + off + grey + '│' + off,
      grey + '├──────' + off + grey + '┼──────────────────┤' + off,
      grey + '│' + off + ' ' + c256s + ' ' + grey + '│' + off + ' rauchg@gmail.com ' + grey + '│' + off,
      grey + '└──────' + off + grey + '┴──────────────────┘' + off
    ];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test custom chars', function() {
    var table = new Table({
      chars: {
        top: '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        bottom: '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        left: '║',
        'left-mid': '╟',
        right: '║',
        'right-mid': '╢'
      },
      style: {
        head: [],
        border: []
      }
    });

    table.push(['foo', 'bar', 'baz'], ['frob', 'bar', 'quuz']);

    var expected = ['╔══════╤═════╤══════╗', '║ foo  │ bar │ baz  ║', '╟──────┼─────┼──────╢', '║ frob │ bar │ quuz ║', '╚══════╧═════╧══════╝'];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test compact shortand', function() {
    var table = new Table({
      style: {
        head: [],
        border: [],
        compact: true
      }
    });

    table.push(['foo', 'bar', 'baz'], ['frob', 'bar', 'quuz']);

    var expected = ['┌──────┬─────┬──────┐', '│ foo  │ bar │ baz  │', '│ frob │ bar │ quuz │', '└──────┴─────┴──────┘'];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test compact empty mid line', function() {
    var table = new Table({
      chars: {
        mid: '',
        'left-mid': '',
        'mid-mid': '',
        'right-mid': ''
      },
      style: {
        head: [],
        border: []
      }
    });

    table.push(['foo', 'bar', 'baz'], ['frob', 'bar', 'quuz']);

    var expected = ['┌──────┬─────┬──────┐', '│ foo  │ bar │ baz  │', '│ frob │ bar │ quuz │', '└──────┴─────┴──────┘'];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test decoration lines disabled', function() {
    var table = new Table({
      chars: {
        top: '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        bottom: '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        left: '',
        'left-mid': '',
        mid: '',
        'mid-mid': '',
        right: '',
        'right-mid': '',
        middle: ' '
      },
      style: {
        head: [],
        border: [],
        'padding-left': 0,
        'padding-right': 0
      }
    });

    table.push(['foo', 'bar', 'baz'], ['frobnicate', 'bar', 'quuz']);

    var expected = ['foo        bar baz ', 'frobnicate bar quuz'];

    expect(table.toString()).to.equal(expected.join('\n'));
  });

  it('test with null/undefined as values or column names', function() {
    var table = new Table({
      style: {
        head: [],
        border: []
      }
    });

    table.push([null, undefined, 0]);

    var expected = ['┌──┬──┬───┐', '│  │  │ 0 │', '└──┴──┴───┘'];

    expect(table.toString()).to.equal(expected.join('\n'));
  });
});
