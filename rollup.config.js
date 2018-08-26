// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
  entry: './src/index.ts',

  output: {
    format: 'iife',
    file: 'dist/index.js'
  },

	plugins: [
		typescript(/*{ plugin options }*/)
	]
}
