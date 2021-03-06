import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify-es'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const mergeAll = objs => Object.assign({}, ...objs)

const commonPlugins = [
  typescript({
    typescript: require('typescript'),
  }),
]

const configBase = {
  input: 'src/index.tsx',
  output: {
    exports: 'named',
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: commonPlugins,
}

const umdConfig = mergeAll([
  configBase,
  {
    output: mergeAll([
      configBase.output,
      {
        file: `dist/${pkg.name}.js`,
        format: 'umd',
        name: 'Snuggle',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    ]),
    external: Object.keys(pkg.peerDependencies || {}),
  },
])

const devUmdConfig = mergeAll([
  umdConfig,
  {
    plugins: umdConfig.plugins.concat(
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      })
    ),
  },
])

const prodUmdConfig = mergeAll([
  umdConfig,
  {
    output: mergeAll([
      umdConfig.output,
      { file: umdConfig.output.file.replace(/\.js$/, '.min.js') },
    ]),
  },
  {
    plugins: umdConfig.plugins.concat(
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      uglify({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
        },
      })
    ),
  },
])

const webConfig = mergeAll([
  configBase,
  {
    output: [
      mergeAll([configBase.output, { file: pkg.module, format: 'es' }]),
      mergeAll([configBase.output, { file: pkg.main, format: 'cjs' }]),
    ],
  },
])

export default [devUmdConfig, prodUmdConfig, webConfig]
