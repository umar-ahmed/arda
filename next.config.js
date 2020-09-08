const withTM = require("next-transpile-modules")([
  "drei",
  "three",
  "react-postprocessing",
]);

module.exports = withTM();
