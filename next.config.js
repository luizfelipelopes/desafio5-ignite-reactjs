module.exports = {
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.(m?j|t)s$/,
        include: /node_modules/,
        type: "javascript/auto",
      })

      return config
    },
  }