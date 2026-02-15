import { colors } from 'dmt/common';

import { Table } from 'dmt/cli';

function colorizeDevice(device) {
  return text => (device.name ? colors.white(text) : colors.gray(text));
}

function makeTable(devices) {
  const table = new Table();

  const header = ['last', 'ip', 'name', 'mac'].map(column => colors.yellow(column));

  table.push(header);

  table.push(Table.divider);

  devices
    .filter(device => !device.missing)
    .concat(devices.filter(device => device.missing))
    .forEach(device => {
      const row = [];

      const ident = device.name ? device.name : device.vendor;

      const selectColor = device.missing ? text => colors.gray(text) : colorizeDevice(device);

      const label = device.missing ? colors.red('gone') : device.new ? colors.green('new ') : '    ';
      row.push(label);

      row.push(selectColor(device.ip));
      row.push(selectColor(ident));
      row.push(selectColor(device.mac));

      table.push(row);
    });

  return table.toString();
}

export default function output(devices) {
  console.log('Devices:'.cyan);

  const output = makeTable(devices);
  console.log(output);
}
