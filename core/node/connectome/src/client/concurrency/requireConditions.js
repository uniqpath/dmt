class ConditionsChecker {
  constructor(num, callback) {
    this.num = num;
    this.callback = callback;

    this.counter = 0;
  }

  oneConditionFulfilled() {
    this.counter += 1;

    if (this.counter == this.num) {
      this.callback();
    }
  }
}

function requireConditions(num, callback) {
  return new ConditionsChecker(num, callback);
}

export default requireConditions;
