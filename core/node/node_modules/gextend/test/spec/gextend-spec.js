/*global define:true, describe:true , it:true , expect:true,
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['extend'], function(extend) {

    describe('just checking', function() {

        it('extend should be loaded', function() {
            expect(extend).toBeTruthy();
        });

        it('extend should extend objects', function() {
            var src = {},
                obj1 = {
                    a: 1,
                    b: 2,
                    c: 3
                },
                obj2 = {
                    d: 4
                },
                exp = {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: 4
                };

            var out = extend(src, obj1, obj2);

            expect(out).toMatchObject(exp);
        });


        it('extend should handle null arguments', function() {
            var src = {},
                obj1 = {
                    a: 1,
                    b: 2,
                    c: 3
                },
                obj2 = null,
                exp = {
                    a: 1,
                    b: 2,
                    c: 3
                };

            var out = extend(src, obj1, obj2);

            expect(out).toMatchObject(exp);
        });

        it('extend should handle nested objects', function() {
            var usr = {
                name: 'Pepe',
                last: 'Rone',
                pets: [{
                    type: 'dog',
                    name: 'bob'
                }]
            };

            var exp = {
                name: 'Pepe',
                last: 'Rone',
                pets: [{
                    type: 'cat',
                    name: 'lisa'
                }]
            };

            var out = extend(usr, {
                pets: [{
                    type: 'cat',
                    name: 'lisa'
                }]
            });
            expect(out).toMatchObject(exp);
        });

        it('extend ')
    });
});