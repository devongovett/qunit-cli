(function() {

// Make sure we're in a non-browser environment
if (typeof QUnit === 'undefined' && typeof require === 'function') {
    // Currently requires an old version of QUnit because 
    // of a regression that breaks Node.js compatibility.
    // See https://github.com/jquery/qunit/pull/401
    var QUnit = require('qunitjs'),
        colors = require('colors');

    var argv = require('optimist')
        .describe('hidepassed', 'Show only the failing tests, hiding all that pass')
        .default('hidepassed', false)
        .alias('module', 'm')
        .describe('module', 'Run an individual module')
        .describe('requireExpects', 'Require each test to specify the number of expected assertions')
        .default('requireExpects', false)
        .alias('testNumber', 't')
        .describe('testNumber', 'Run an individual test by number')
        .describe('test', 'Run an individual test by number (deprecated)')
        .describe('testTimeout', 'Global timeout in milliseconds after which all tests will fail')
        .alias('quiet', 'q')
        .describe('quiet', 'Hide passed tests (deprecated)')
        .boolean('quiet')
        .argv;

    // Deprecation notices

    if(argv.test != undefined)
    {
      console.warn('"test" parameter is deprecated, please use "testNumber" instead');
      argv.testNumber = argv.testNumber || argv.test;
    };

    if(argv.quiet != undefined)
      console.warn('"quiet" parameter is deprecated, please use "hidepassed" instead');

    // QUnit configurations

    QUnit.config.autorun = false;

    QUnit.config.hidepassed = argv.hidepassed;
    QUnit.config.module = argv.module;
    QUnit.config.requireExpects = argv.requireExpects;
    QUnit.config.testNumber = argv.testNumber;
    QUnit.config.testTimeout = argv.testTimeout;

    module.exports = QUnit;

    var errors = [],
        printedModule = false;

    // keep track of whether we've printed the module name yet
    QUnit.moduleStart(function(details) {
        printedModule = false;
    });

    // when an individual assertion fails, add it to the list of errors to display
    QUnit.log(function(details) {
        if (!details.result)
            errors.push(details);
    });

    // when a test ends, print success/failure and any errors
    QUnit.testDone(function(details) {
        // print the name of each module
        if (!printedModule && (printedModule = !argv.quiet || details.failed))
            console.log('\n' + details.module.bold.blue);

        if (details.failed) {
            console.log(('  ✖ ' + details.name).red);

            errors.forEach(function(error) {
                if (error.message)
                    console.log('    ' + error.message.red);

                if (typeof error.actual !== 'undefined')
                    console.log(('    ' + error.actual + ' != ' + error.expected).red);
            });

            errors.length = 0;
        } else if (!argv.quiet) {
            console.log(('  ✔ ' + details.name).green);
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

        process.once('exit', function() {    
            process.exit(details.failed);
        });
    });
}

})();
