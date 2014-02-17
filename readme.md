qunit-cli
=========

A Node module that adds colorful CLI support for the [QUnit](http://qunitjs.com)
testing framework.

![screenshot](screenshot.png)

## Usage

To use this module, first install it using npm

    npm install qunit-cli

Now, you can use it in two ways:

a) include it at the top of your test files.

    if (typeof QUnit == 'undefined') // if your tests also run in the browser...
        QUnit = require('qunit-cli');
    
    // use QUnit as you normally would.

Note that this module does not introduce QUnit into the global scope like QUnit
does in the browser, so you'll have to do that yourself if needed.

To run, use the `node` program.

    node mytests.js

b) use the command-line testrunner located at `bin/qunit-cli`, passing it the
test files as arguments.

    bin/qunit-cli mytests.js

This will introduce QUnit into the global scope like QUnit does in the browser,
so you'll don't need to modify the tests themselves. You can use both methods in
the same test files without problems.

## Command line options

There are several command line options available when running your tests using
qunit-cli that mimic some of the options in the standard browser-based QUnit
testing interface.  They are:

    --module, -m    Limits testing to an individual module
    --test,   -t    Limits testing to a single test (by number)
    --quiet,  -q    Flag to hide passed tests from the output

The command-line testrunner has some more options available:

    --code,   -c    Path to code loaded globally. You can prefix a namespace
                    using a colon (:)

## License

`qunit-cli` is released under the MIT license.