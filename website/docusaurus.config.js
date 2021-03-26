module.exports = {
	title: 'Waterfall CLI',
	tagline: 'Effortlessly create CLIs powered by Node.js',
	url: 'https://waterfallcli.io/',
	baseUrl: '/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	favicon: 'img/favicon.ico',
	organizationName: 'sparksuite',
	projectName: 'waterfall-cli',
	themeConfig: {
		navbar: {
			title: 'Waterfall CLI',
			logo: {
				alt: 'Logo',
				src: 'img/logo.png',
			},
			items: [
				{
					to: 'docs/',
					activeBasePath: 'docs',
					label: 'Docs',
					position: 'left',
				},
				{
					href: 'https://github.com/sparksuite/waterfall-cli',
					label: 'GitHub',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'light',
			links: [
				{
					title: 'GitHub',
					items: [
						{
							label: 'Repository',
							to: 'https://github.com/sparksuite/waterfall-cli',
						},
						{
							label: 'Submit an issue',
							to: 'https://github.com/sparksuite/waterfall-cli/issues/new',
						},
						{
							label: 'How to contribute',
							to: 'https://github.com/sparksuite/waterfall-cli/blob/master/CONTRIBUTING.md',
						},
					],
				},
				{
					title: 'Sparksuite',
					items: [
						{
							label: 'About us',
							href: 'https://www.sparksuite.com',
						},
						{
							label: 'Open source',
							href: 'https://github.com/sparksuite',
						},
						{
							label: 'Careers',
							href: 'https://sparksuite.careers',
						},
					],
				},
			],
		},
	},
	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: require.resolve('./sidebars.js'),
					editUrl: 'https://github.com/sparksuite/waterfall-cli/edit/master/website/',
				},
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],
};
