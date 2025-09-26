// forge.config.js  (ou forge.config.cjs)
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: { asar: true },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],          // <── ESSENCIAL
      config: { name: 'rpro' }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
    },
    {
      name: '@electron-forge/maker-rpm',
    },
  ],
  plugins: [
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: true,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
