// next.config.js
const webpack = require("webpack");

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        // add other modules you encounter issues with here
      };
    }

    // Adds support for Node.js polyfills where needed
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
  // Your other Next.js configuration here...
};
