beforeEach(function() {
    
    this.addMatchers({
        toBeArray: function() {
            return _isArray(this.actual);
        },
        toBeInstanceOf: function(Constructor) {

            return this.actual instanceof Constructor;
        },
        toBeNan: function() { // needs to be spelled 'Nan' due to jasmine conventions
            var actual = this.actual;
            // NaN is the only value that is not strictly equal to itself
            return actual !== actual;
        },
        toBeOfType: function(type) {

            return typeof this.actual === type;
        },
        toBeCloneOf:function(source){
            return this.actual.constructor === source.constructor &&
                   this.actual.prototype   === source.prototype;
        },
        toNotBeCloneOf:function(source){
            return this.actual.constructor !== source.constructor ||
                   this.actual.prototype   !== source.prototype;
        },
        toHaveLength: function(length) {

            return this.actual.length === length;
        },
        toHaveLengthGreaterThan:function(length){
            return this.actual.length > length;
        },
        toHaveLengthSmallerThan:function(length){
            return this.actual.length < length;
        },
        toHaveProperties: function(name0, name1, name2) {
            var args = _fixArguments(arguments);
            var actual = this.actual;
            for (var i = 0, len = args.length; i < len; i += 1) {
                if (!(args[i] in actual)) {
                    return false;
                }
            }
            return true;
        },
        toHaveMethods:function(){
            var actual = this.actual;
            var hasOwn = {}.hasOwnProperty;
            var prop, output = 0;
            var args = _fixArguments(arguments);
            for (var i = 0, len = args.length; i < len; i += 1) {
                prop = args[i];

                if(prop in actual){
                    if(typeof actual[prop] !== 'function') return false;
                    else ++output;
                }
            }
            return args.length === output;
        },
        toHaveOwnMethods:function(){
            var actual = this.actual;
            var hasOwn = {}.hasOwnProperty;
            var prop, output = 0;
            var args = _fixArguments(arguments);
            for (var i = 0, len = args.length; i < len; i += 1) {
                prop = args[i];
                if(hasOwn.call(actual, prop)){
                    if(typeof actual[prop] !== 'function') return false;
                    else ++output;
                }
            }
            return args.length === output;
        },
        toHaveOwnProperties: function(name0, name1, name2) {
            var actual = this.actual;
            var hasOwn = {}.hasOwnProperty;
            var args = _fixArguments(arguments);
            for (var i = 0, len = args.length; i < len; i += 1) {
                if (!hasOwn.call(actual, args[i])) {
                    return false;
                }
            }
            return true;
        },
        toEachHave:function(attr, val){
            var r = this.actual;
            for( var i in r){
                if(r[i][attr] !== val) return false;
            }

            return true;
        },
        toHavePropertieValue:function(attr, val){
            return this.actual[attr] === val;
        },
        toIncludeObject:function(obj){
            var a = this.actual, p;
            for( p in obj){
                if(!a.hasOwnProperty(p)) return false;
                if(! _deepEqual(a[p],obj[p])) return false;
            }
            return true;
        },
        toMatchObject:function(x){
            return _deepEqual(this.actual, x);
        },
        toNotMatchObject:function(object){
            return this.toMatchObject(object) === false;
        },
        toNotMatch:function(object){
            return this.actual !== object;
        },
        toThrowInstanceOf: function(klass) {
            try {
                this.actual();
            } catch (e) {
                return e instanceof klass;
            }
            return false;
        },
        toHaveBeenCalledXTimes: function(count) {
            var callCount = this.actual.callCount;
            var not = this.isNot ? "NOT " : "";
            this.message = function() {
                return 'Expected spy "' + this.actual.identity + '" ' + not + ' to have been called ' + count + ' times, but was ' + callCount + '.';
            };
            return callCount == count;
        },
        toContainOnce: function(value) {
            var actual = this.actual;
            var containsOnce = false;
            if (actual) {
                var firstFoundAt = actual.indexOf(value);
                containsOnce = firstFoundAt!=-1 && firstFoundAt == actual.lastIndexOf(value);
            }
            return containsOnce;
        },
        toEndWith: function(value) {
            return _endsWith(this.actual, value);
        },
        toEachEndWith: function(searchString) {
            var arrayOfStrings = this.actual;
            return arrayOfStrings.every(function(oneValue) {
                return _endsWith(oneValue, searchString);
            });
        },
        toSomeEndWith: function(searchString) {
            var arrayOfStrings = this.actual;
            return arrayOfStrings.some(function(oneValue) {
                return _endsWith(oneValue, searchString);
            });
        }

    });
});

function _fixArguments(args, keepBoxed){
    var a = Array.prototype.splice.call(args,0);

    if(!keepBoxed &&
       _isArray(a[0]) &&
       a.length === 1) return a[0];

    return a;
}

function _isArray(item){
    return {}.toString.call(item) === '[object Array]';
}
function _endsWith(haystack, needle){
  return haystack.substr(-needle.length) == needle;
}

function _deepEqual(a,b){
    if (typeof a != "object" ||
     typeof b != "object") return a === b;

    if (a === b) return true;

    var aString = {}.toString.call(a);
    if (aString !={}.toString.call(b)) return false;

    if (aString == "[object Array]") {
        if (a.length !== b.length) return false;

        for (var i = 0, l = a.length; i < l; i += 1) {
            if (!_deepEqual(a[i], b[i])) return false;
        }

        return true;
    }

    var prop, aLength = 0, bLength = 0;

    for (prop in a) {
        ++aLength;

        if (!_deepEqual(a[prop], b[prop])) return false;
    }

    for (prop in b) ++bLength;

    if (aLength != bLength) return false;

    return true;
}