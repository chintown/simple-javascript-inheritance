/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/blog/simple-javascript-inheritance/
 * Adopted By Mike Chen
 * MIT Licensed.
 */
(function() {
  var isSystemSupportFuncDecompilation = /x/.test(function() {x;});
  var ptnSuper = isSystemSupportFuncDecompilation ? /\b_super\b/  : /.*/;
  var hasSuper = ptnSuper.test.bind(ptnSuper);
  var isFunc = function(v) {return typeof v === 'function';};
  var bindSuper = function(fn, fnSuper) {
    return function() {
      var conflictedSuper = this._super;

      this._super = fnSuper;
      var ret = fn.apply(this, arguments);

      this._super = conflictedSuper;
      return ret;
    };
  };

  this.BaseClass = function() {}; // not only in browser
  // the parent-child relationship of "prototype"
  BaseClass.extend = function(extendedPrototype) {
    var ParentClass = this;

    // 1. move constructor to init
    var ChildClass = function() {
      if (this.init) {
        this.init.apply(this, arguments); // TODO call super by default?
      }
    };
    // 2. link prototype
    // avoid triggering constructor of ParentClass
    ChildClass.prototype = Object.create(ParentClass.prototype);

    var parentPrototype = ParentClass.prototype;
    var childPrototype = ChildClass.prototype;
    childPrototype.constructor = ChildClass;
    ChildClass.extend = arguments.callee;

    // 3. extend prototype
    for (var k in extendedPrototype) {
      // 3.1. extend child prototype by user logic.
      childPrototype[k] = extendedPrototype[k];

      // 3.2 inject this._super
      if (isFunc(childPrototype[k]) &&
          hasSuper(childPrototype[k]) &&
          isFunc(parentPrototype[k])
        ) {
        childPrototype[k] = bindSuper(childPrototype[k], parentPrototype[k]);
      }
    }

    return ChildClass;
  };
})();

// -----------------------------------------------------------------------------

var Person = BaseClass.extend({
  init: function(isDancing) {
    this.dancing = isDancing;
  },
  dance: function() {
    return this.dancing;
  }
});

var Ninja = Person.extend({
  init: function() {
    this._super(false);
  },
  dance: function() {
    // Call the inherited version of dance()
    return this._super();
  },
  swingSword: function() {
    return true;
  }
});

function assert(condition, message) {
  if (!condition) {
    console.error(message || "Assertion failed");
  }
}

var p = new Person(true);
assert(p.dance() === true);

var n = new Ninja();
assert(n.dance() === false);
assert(n.swingSword() === true);

// Should all be true
var actual = p instanceof Person && p instanceof BaseClass &&
          n instanceof Ninja && n instanceof Person && n instanceof BaseClass;
assert(actual === true);
