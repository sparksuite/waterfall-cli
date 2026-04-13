module.exports = {
	description: 'Order a pizza, to-go',
	data: {
		description: 'What type of pizza to order',
		type: 'fake',
	},
	options: {
		test: {
			description: 'Just used for testing',
			type: 'fake',
		},
		hold: {
			description: 'What ingredients to hold',
			acceptsMultiple: true,
			accepts: ['olives', 'onions', 'peppers', 'sauce'],
		},
		size: {
			description: 'What size pizza to order',
			acceptsMultiple: true,
			type: 'integer',
			accepts: [6, 10, 12],
		}
	},
	acceptsPassThroughArgs: true,
};
