import colors from 'colors';
import dmt from 'dmt/common';

const { log } = dmt;

function compareTopicAndMsg({ topicAndMsg, topic, msg, context }) {
  if (topicAndMsg.indexOf('/') == -1) {
    log.red(
      `Wrong setup for ${colors.magenta(context)} in ${colors.cyan('iot.def')} file: ${colors.yellow(topicAndMsg)}, should be in form: ${colors.green(
        'topic/msg'
      )}`
    );
  }

  const [_topic, _msg] = topicAndMsg.split('/');
  return _topic == topic && _msg == msg;
}

function iotMsg({ program, topicAndMsg, context }) {
  if (topicAndMsg.indexOf('/') != -1) {
    const [topic, msg] = topicAndMsg.split('/');
    program.iotMsg(topic, msg);
  } else {
    log.red(
      `Wrong setup for ${colors.magenta(context)} in ${colors.cyan('iot.def')} file: ${colors.yellow(topicAndMsg)}, should be in form: ${colors.green(
        'topic/msg'
      )}`
    );
  }
}

export { iotMsg, compareTopicAndMsg };
