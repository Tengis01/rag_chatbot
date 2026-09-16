/**
 * Expo SDK 53 uses expo.modules.ExpoModulesPackage. In this pnpm monorepo,
 * EAS's generated Android PackageList can otherwise resolve Expo's obsolete
 * expo.core import during release autolinking.
 */
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: "import expo.modules.ExpoModulesPackage;",
          packageInstance: "new ExpoModulesPackage()",
        },
      },
    },
  },
};
