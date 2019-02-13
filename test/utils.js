/* eslint-env mocha */


// Dependencies
const assert = require('assert');
const cliFramer = require('../index.js');


// Enable test mode
// cliFramer.utils.enableTestMode();


// Tests
describe('Utils', () => {
	describe('#retrieveAppInformation()', () => {
		it('should retrieve app info', () => {
			assert.deepEqual(cliFramer.utils.retrieveAppInformation(`${__dirname}/pizza-ordering/cli/entry.js`), {
				name: 'example',
				version: '1.2.3',
			});
		});
	});
});
