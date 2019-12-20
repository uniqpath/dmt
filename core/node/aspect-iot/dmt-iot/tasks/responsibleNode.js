const { push } = require('dmt-notify');

const pushNotifications = true;

function getThisSpecialNode(program) {
  const nodes = program.specialNodes;
  return nodes.find(node => node.deviceId == program.device.id);
}

function setup(program) {
  const thisSpecialNode = getThisSpecialNode(program);

  if (thisSpecialNode) {
    program.specialNode = thisSpecialNode;
    program.responsibleNode = thisSpecialNode.priority == 0;
  }
}

let firstTick = true;

function tick(program) {
  if (firstTick) {
    firstTick = false;
    return;
  }

  const thisSpecialNode = getThisSpecialNode(program);

  if (thisSpecialNode && thisSpecialNode.priority > 0) {
    const now = Date.now();
    const { nearbyDevices } = program.state;

    let otherResponsibleNodeActive = false;

    if (nearbyDevices) {
      const deviceIds = Object.keys(nearbyDevices);
      for (const id of deviceIds) {
        const device = nearbyDevices[id];
        if (device.specialNode && device.specialNodePriority < thisSpecialNode.priority && now - device.lastSeenAt < 30000) {
          otherResponsibleNodeActive = true;
        }
      }

      if (pushNotifications && !program.responsibleNode && !otherResponsibleNodeActive) {
        push.notify(`${program.device.id} took over as a responsible node`);
      }

      if (pushNotifications && program.responsibleNode && otherResponsibleNodeActive) {
        push.notify(`${program.device.id} is not a responsible node anymore because a node with higher priority took over`);
      }

      program.responsibleNode = !otherResponsibleNodeActive;
    } else {
      program.responsibleNode = false;
    }
  }
}

module.exports = { setup, tick };
