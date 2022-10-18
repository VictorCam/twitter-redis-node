import { sveltekit } from '@sveltejs/kit/vite';
import AutoImport from 'unplugin-auto-import/vite'
import postcssPresetEnv from 'postcss-preset-env'

const config = {
	plugins: [
		AutoImport({
            imports: [
                {
                    'axios': [
                        ['default', 'axios']
                    ],
                    'dayjs': [
                        ['default', 'dayjs']
                        ],
                    'js-cookie': [
                        ['default', 'jscookie']
                    ]
                }
            ]
        }),
		sveltekit()],
	css: {
		postcss: {
			plugins: [postcssPresetEnv({stage: 2})]
		}
	},
	server: {
		port: 2020,
	}
};

export default config;
