const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import("eslint").Linter.Config} */
module.exports = {
	extends: [
		'eslint:recommended',
		'next/core-web-vitals',
		'plugin:react/recommended',
		'plugin:import/recommended',
		'plugin:react-hooks/recommended',
		'plugin:tailwindcss/recommended',
		'plugin:@typescript-eslint/recommended'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true
	},
	env: {
		node: true
	},
	globals: {
		JSX: 'writable',
		React: 'writable'
	},
	settings: {
		'import/resolver': {
			typescript: {
				project
			}
		},
		react: {
			version: 'detect'
		},
		tailwindcss: {
			callees: ['cn'],
			config: 'tailwind.config.js'
		}
	},
	rules: {
		'import/named': 'off',
		'react/prop-types': 'off',
		'import/no-named-as-default-member': 'off'
	},
	ignorePatterns: [
		'**/.*.js',
		'**/.*.ts',
		'**/*.config.ts',
		'**/*.config.js',
		'node_modules',
		'.next'
	]
}
