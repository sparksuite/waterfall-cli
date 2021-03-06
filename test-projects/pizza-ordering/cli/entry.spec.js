module.exports = {
	flags: {
		quiet: {
			cascades: true,
			shorthand: 'q',
			description: 'Disable interactivity, rely on default values instead',
		},
		'non-cascading': {
			description: 'Just used for testing',
		},
	},
	options: {
		'delivery-zip-code': {
			cascades: true,
			shorthand: 'z',
			description: 'The delivery ZIP code, for context',
		},
	},
};
