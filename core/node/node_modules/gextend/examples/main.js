/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'extend': 'extend'
    }
});

define(['extend', 'jquery'], function(extend, $) {
    console.log('Loading');

});