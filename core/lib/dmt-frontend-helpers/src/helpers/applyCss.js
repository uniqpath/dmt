export function applyCss(node, properties) {
  function setProperties() {
    for (const prop of Object.keys(properties)) {
      if (properties[prop]) {
        node.style.setProperty(prop, properties[prop]);
      } else {
        node.style.removeProperty(prop);
      }
    }
  }

  setProperties();

  return {
    update(newProperties) {
      properties = newProperties;
      setProperties();
    }
  };
}
