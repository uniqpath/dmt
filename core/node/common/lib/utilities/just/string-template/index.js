export default template;

function template(string, data) {
  var proxyRegEx = /\{\{([^\}]+)?\}\}/g;
  return string.replace(proxyRegEx, function(_, key) {
    var keyParts = key.split('.');
    var value = data;
    for (var i = 0; i < keyParts.length; i++) {
      value = value[keyParts[i]];
    }
    return value || '';
  });
}
