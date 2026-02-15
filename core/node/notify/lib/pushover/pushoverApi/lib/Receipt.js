const DEFAULT_PROPERTIES = {
  id: null,
  acknowledged: false,
  acknowledgedAt: null,
  acknowledgedBy: null,
  lastDeliveredAt: null,
  expired: true,
  expiresAt: null,
  calledBack: false,
  calledBackAt: null
};

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '';
    return index === 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

class Receipt {
  constructor(id, results) {
    this.properties = Object.assign({}, DEFAULT_PROPERTIES);
    this.properties.id = id;

    for (let i in results) {
      this.properties[camelCase(i)] = results[i];
    }
  }

  get id() {
    return this.properties.id;
  }

  get isAcknowledged() {
    return this.properties.acknowledged;
  }

  set acknowledged(value) {
    this.properties.acknowledged = !!value;
  }

  get acknowledgedAt() {
    return this.properties.acknowledgedAt;
  }

  set acknowledgedAt(value) {
    this.properties.acknowledgedAt = value ? value : null;
  }

  get acknowledgedBy() {
    return this.properties.acknowledgedBy;
  }

  set acknowledgedBy(value) {
    this.properties.acknowledgedBy = value ? value : null;
  }

  get lastDeliveredAt() {
    return this.properties.lastDeliveredAt;
  }

  set lastDeliveredAt(value) {
    this.properties.lastDeliveredAt = value ? value : null;
  }

  get isExpired() {
    return this.properties.expired;
  }

  set expired(value) {
    this.properties.expired = value ? true : false;
  }

  get expiresAt() {
    return this.properties.expiresAt;
  }

  set expiresAt(value) {
    this.properties.expiresAt = value ? value : null;
  }

  get hasCalledBack() {
    return this.properties.calledBack;
  }

  set calledBack(value) {
    this.properties.calledBack = value ? true : false;
  }

  get calledBackAt() {
    return this.properties.calledBackAt;
  }

  set calledBackAt(value) {
    this.properties.calledBackAt = value ? value : null;
  }
}

export default Receipt;
