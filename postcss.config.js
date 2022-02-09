const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

module.exports = {
  plugins: [
    postcssPresetEnv({
      autoprefixer: { grid: 'autoplace' },
    }),
    cssnano({
      preset: [
        'default',
        {
          discardComments: {
            removeAll: true,
          },
        },
      ],
    }),
  ],
}
