(function() {

    // Make sure we're in a non-browser environment
    if (typeof QUnit !== 'undefined' || typeof require !== 'function') {
        return;
    }

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


    // Based on qunit's test set up for node
    // https://github.com/jquery/qunit/blob/c0d9ad6cfc73157b03bc9bec5b0aee875150b5aa/Gruntfile.js#L176-222
    QUnit.config.autorun = false;
    QUnit.config.module = argv.module;
    module.exports = QUnit;

    var errors = [],
        printedModule = false;

    // keep track of whether we've printed the module name yet
    QUnit.moduleStart(function() {
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

})();