(function() {

// Make sure we're in a non-browser environment
if (typeof QUnit === 'undefined' && typeof require === 'function') {
    // Currently requires an old version of QUnit because
    // of a regression that breaks Node.js compatibility.
    // See https://github.com/jquery/qunit/pull/401
    var QUnit = require('qunitjs'),
        colors = require('colors');

    // Get user own config parameters
    var optimist = require('optimist')
        .describe('urlConfig', 'Add a config parameter of your own in JSON')
        .string('urlConfig');
    var argv = optimist.argv;

    // Define normal config parameters
    optimist
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
        .boolean('quiet');

    // Add user own config parameters and if so, override normal ones
    var consts = {};

    var urlConfig = argv.urlConfig;
    if (urlConfig) {
      function addConfig(urlConfig) {
        urlConfig = JSON.parse(urlConfig);

        // Add config parameter to QUnit-cli so it can be checked
        var id    = urlConfig.id;
        var value = urlConfig.value;

        optimist.describe(id, urlConfig.tooltip || urlConfig.label);

        if(value == undefined)
          optimist.boolean(id);
        else if(typeof value == 'string')
        {
          optimist.boolean(id);

          consts[id] = value;
        }
        else if(!(value instanceof Array))
          optimist.string(id);

        // Add config parameter to QUnit so it can be processed
        QUnit.config.urlConfig.push(urlConfig);
      }

      if (urlConfig instanceof Array) {
        urlConfig.forEach(function(config) {
          addConfig(config);
        });
      } else {
        addConfig(urlConfig);
      }
    };

    // Check arguments
    argv = optimist.argv;

    // Deprecation notices
    if(argv.test != undefined)
    {
      console.warn('"test" parameter is deprecated, please use "testNumber" instead');
      argv.testNumber = argv.testNumber || argv.test;
      delete argv.test;
    };

    if(argv.quiet)
      console.warn('"quiet" parameter is deprecated, please use "hidepassed" instead');

    // QUnit configurations
    delete argv.urlConfig;

    QUnit.config.autorun = false;

    for(var key in argv)
      QUnit.config[key] = consts[key] || argv[key];

    module.exports = QUnit;

    var errors = [],
        printedModule = false;

    function printModule(name)
    {
      // Separate each module with an empty line
      console.log('\n');

      // Only print module name if it's defined
      if (name)
          console.log(name.bold.blue);
    }

    // keep track of whether we've printed the module name yet
    QUnit.moduleStart(function(details) {
        if (printedModule = !argv.quiet)
          printModule(details.name);
    });

    // when an individual assertion fails, add it to the list of errors to display
    QUnit.log(function(details) {
        if (!details.result)
            errors.push(details);
    });

    // when a test ends, print success/failure and any errors
    QUnit.testDone(function(details) {
        // print the name of each module
        if (!printedModule && details.failed)
          printModule(details.module);

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
