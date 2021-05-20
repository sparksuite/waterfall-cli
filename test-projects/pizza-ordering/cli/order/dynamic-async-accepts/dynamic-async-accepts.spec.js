async function dataAllows() {
	return ['a', 'b', 'c', 'd'];
}

async function testAllows() {
	return ['a1', 'b2', 'c3', 'd4'];
}

module.exports = {
	description: 'Just used for testing',
	data: {
		description: 'What type of pizza to order',
		accepts: dataAllows,
	},
	options: {
		test: {
			description: 'Just used for testing',
			accepts: testAllows,
		},
	},
	acceptsPassThroughArgs: false,
};