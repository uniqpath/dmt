import dmt from 'dmt/common';
const { def } = dmt;

import { staticIP, firstPriority, atLeastOneSpecialNode, hasNetworkId } from './checks';

function allSpecialNodes() {
  return dmt
    .devices()
    .filter(device => device.try('network.specialNode'))
    .map(device => {
      return {
        deviceName: device.id,
        networkId: def.id(device.network),
        ip: device.try('network.ip'),
        firstPriority: device.try('network.specialNode.firstPriority')
      };
    });
}

function assignPriorities(nodes) {
  const sortedNodes = sortByIP(nodes);

  const firstPriorityNode = sortedNodes.find(node => node.firstPriority);

  let prioritizedNodes;

  if (firstPriorityNode) {
    sortedNodes.splice(nodes.indexOf(firstPriorityNode), 1);
    prioritizedNodes = [firstPriorityNode].concat(sortedNodes);
  } else {
    prioritizedNodes = sortedNodes;
  }

  let priority = 0;

  for (const node of prioritizedNodes) {
    delete node.firstPriority;
    node.priority = priority;
    priority += 1;
  }

  return prioritizedNodes;
}

function sortByIP(nodes) {
  return nodes.sort((a, b) => {
    if (a.ip < b.ip) {
      return -1;
    }
    if (a.ip > b.ip) {
      return 1;
    }
    return 0;
  });
}

function specialNodes() {
  let nodes = allSpecialNodes();

  nodes = staticIP(nodes);
  nodes = firstPriority(nodes);
  nodes = atLeastOneSpecialNode(nodes);
  nodes = hasNetworkId(nodes);

  return assignPriorities(nodes);
}

export default specialNodes;
