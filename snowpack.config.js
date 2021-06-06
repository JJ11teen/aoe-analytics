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
    '**/public/data/**',
    // Build fails unless files without an extension are excluded
    // https://github.com/snowpackjs/snowpack/issues/2966
    'LICENSE',
  ],
  plugins: [
    [ "@snowpack/plugin-sass", {
      "native": true,
    } ],
  ],
  packageOptions: { },
  devOptions: { },
  buildOptions: { },
};
