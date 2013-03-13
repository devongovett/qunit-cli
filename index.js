(function() {

// Make sure we're in a non-browser environment
if (typeof QUnit === 'undefined' && typeof require !== 'undefined') {
    // Currently requires an old version of QUnit because 
    // of a regression that breaks Node.js compatibility.
    // See https://github.com/jquery/qunit/pull/401
    var QUnit = require('qunitjs'),
        colors = require('colors');
        
    var argv = require('optimist')
        .alias('module', 'm')
        .describe('module', 'Run an individual module')
        .alias('test', 't')
        .describe('test', 'Run an individual test by number')
        .alias('quiet', 'q')
        .describe('quiet', 'Hide passed tests')
        .boolean('quiet')
        .argv;
    
    QUnit.config.autorun = false;
    QUnit.config.module = argv.module;
    QUnit.config.testNumber = argv.test;
    module.exports = QUnit;
    
    var errors = [];

    // print the name of each module
    QUnit.moduleStart(function(details) {
        if (!argv.quiet)
            console.log('\n' + details.name.bold.blue);
    });

    // when an individual assertion fails, add it to the list of errors to display
    QUnit.log(function(details) {
        if (!details.result)
            errors.push(details);
    });

    // when a test ends, print success/failure and any errors
    QUnit.testDone(function(details) {
        if (details.failed === 0) {
            if (!argv.quiet)
                console.log(('  ✔ ' + details.name).green);
        } else {
            console.log(('  ✖ ' + details.name).red);
        
            errors.forEach(function(error) {
                if (error.message)
                    console.log('    ' + error.message.red);
                
                if (typeof error.actual !== 'undefined')
                    console.log(('    ' + error.actual + ' != ' + error.expected).red);
            });
        
            errors.length = 0;
        }
    });

    // when all of the tests are done, print summary
    QUnit.done(function(details) {
        console.log(('\nTests completed in ' + details.runtime + ' milliseconds.').grey);
        var msg = details.passed + ' tests of ' + details.total + ' passed';
    
        if (details.failed > 0)
            console.log((msg + ', ' + details.failed + ' failed.').red.bold);
        else
            console.log((msg + '.').green.bold);
    });
}

})();