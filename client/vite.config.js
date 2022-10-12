import adapter from '@sveltejs/adapter-auto';
import autoImport from 'sveltekit-autoimport';
import AutoImport from 'unplugin-auto-import/vite';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
	sveltekit(), 
	autoImport({
		components: [{ name: './src/components' } ]
	}),
	AutoImport({
		imports: [
			'svelte/store',
			{
				'axios': [
					['default', 'axios']
				],
				'dayjs': [
				  ['default', 'dayjs']
				],
				'js-cookie': [
				  ['default', 'cookies']
				],
				'$app/navigation': [
				  'goto'
				]
			}
		]
	})
]
};


// /** @type {import('@sveltejs/kit').Config} */
// const config = {
// 	kit: {
// 		adapter: adapter(),
// 		vite: {
// 			plugins: [
				
// 		}
// 	}
// };

export default config;
