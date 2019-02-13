// Dependencies
const assert = require('assert');
const colors = require('colors');
const { spawn } = require('child_process');


// Initialize
let entryFile = __dirname+'/pizza-ordering/cli/entry.js';


// Tests
describe('Pizza ordering', function() {
    describe('Built-in abilities', function() {
        it('Displays version', function(done) {
            runTest('--version', [
                'example: 1.2.3',
            ], undefined, done);
        });
    });
});


// Test runner
function runTest(arguments, stdoutIncludes, stderrIncludes, done) {
    // Initialize
    let stdout = '';
    let stderr = '';
    
    
    // Spawn
    const child = spawn('node', [entryFile, ...arguments.split(' ')]);
    
    
    // Listeners
    child.on('exit', (code) => {
        // Handle an issue
        if (code !== 0) {
            throw new Error('Exit code '+code);
        }
        
        
        // Loop over includes
        if (typeof stdoutIncludes === 'object') {
            for (let text of stdoutIncludes) {
                assert.equal(removeFormatting(stdout).includes(text), true);
            }
        }
        
        if (typeof stderrIncludes === 'object') {
            for (let text of stderrIncludes) {
                assert.equal(removeFormatting(stderr).includes(text), true);
            }
        }
        
        
        // Finish
        done();
    });
    
    child.on('error', (error) => {
        throw new Error(error.toString());
    });
    
    child.stdout.on('data', (data) => {
        stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
        stderr += data.toString();
    });
}


// Remove ANSI formatting
function removeFormatting(text) {
    return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}
