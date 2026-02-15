class Command {
  invoke(client) {
    throw new Error('Command must define its own send method');
  }
}

export default Command;
