module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "12",
        },
        modules: "commonjs",
      },
    ],
  ],
  comments: false,
  compact: true,
};
