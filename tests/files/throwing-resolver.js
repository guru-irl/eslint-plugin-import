exports.interfaceVersion = 2;

exports.resolve = function resolve(modulePath) {
  throw new Error(`Unexpected module resolution: ${modulePath}`);
};
