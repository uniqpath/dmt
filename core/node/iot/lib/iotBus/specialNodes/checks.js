import colors from 'colors';
import dmt from 'dmt/bridge';
const { log } = dmt;

function staticIP(specialNodes) {
  for (const node of specialNodes) {
    if (!node.ip) {
      log.red(
        `⚠️  Device ${colors.magenta(`${node.deviceId}`)} is designated as a ${colors.cyan('specialNode')} but it doesn't have a static ip ${colors.yellow(
          '→ Ignoring specialNode designation.'
        )}`
      );
    }
  }

  return specialNodes.filter(node => node.ip);
}

function firstPriority(specialNodes) {
  const firstPriorityNodes = specialNodes.filter(node => node.firstPriority);

  if (firstPriorityNodes.length != 1) {
    log.yellow(
      `⚠️  There should be exactly one ${colors.cyan('specialNode')} with ${colors.yellow('firstPriority')} designation, you have ${colors.yellow(
        firstPriorityNodes.length
      )}`
    );
  }

  return specialNodes;
}

function atLeastOneSpecialNode(specialNodes) {
  if (specialNodes.length == 0) {
    log.yellow(`There has to be at least one ${colors.cyan('specialNode')} which acts as a mqtt broker and handles iot tasks`);
  }

  return specialNodes;
}

function hasNetworkId(specialNodes) {
  for (const node of specialNodes) {
    if (!node.networkId) {
      log.red(
        `⚠️  Device ${colors.magenta(`${node.deviceId}`)} is a ${colors.cyan('specialNode')} but it is not a part of network - ${colors.yellow(
          'network: [idMissing]'
        )}`
      );
    }
  }

  return specialNodes.filter(node => node.ip);
}

export { staticIP, firstPriority, atLeastOneSpecialNode, hasNetworkId };
