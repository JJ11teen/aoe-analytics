// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mount: { 
    public: "/",
    ts: "/js",
    styles: "/styles"
  },
  exclude: [
    '**/node_modules/**/*',
    '**/.git/**',
    // Build fails unless files without an extension are excluded
    // https://github.com/snowpackjs/snowpack/issues/2966
    '**/LICENSE',
    '**/*.json',
    '**/*.config.js',
    // '**/data/**'
  ],
  plugins: [
    [ "@snowpack/plugin-sass", {
      "native": true,
    } ],
  ],
  packageOptions: { 
    source: 'remote',
  },
  devOptions: { },
  buildOptions: { },
};
