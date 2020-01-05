'use strict';
if (!Function.prototype.bind) {
    // PhantomJS doesn't support bind yet
    Function.prototype.bind = Function.prototype.bind || function(thisp) {
        var fn = this;
        return function() {
            return fn.apply(thisp, arguments);
        };
    };
}

var tests = Object.keys(window.__karma__.files).filter(function(file) {
    return /-spec\.js$/.test(file);
});

requirejs.config({
    // Karma serves files from '/base'
    baseUrl: '/base/src',

    paths: {

    },

    // ask Require.js to load these files (all our tests)
    deps: tests,

    // start test run, once Require.js is done
    callback: window.__karma__.start
});