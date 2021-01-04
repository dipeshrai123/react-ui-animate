const replace = require("replace-in-file");
console.log("Building patch react-ui-animate...");
const removeAllSideEffectsFalseFromReactSpringPackages = async () => {
  try {
    const results = await replace({
      files: "node_modules/@react-spring/*/package.json",
      from: `"sideEffects": false`,
      to: `"sideEffects": true`,
    });
  } catch (e) {
    console.log(
      'error while trying to remove string "sideEffects:false" from react-spring packages',
      e
    );
  }
};

removeAllSideEffectsFalseFromReactSpringPackages();
