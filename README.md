Simple Javascript Inheritance
=============================

This is nothing but an adopted version of John Resig's [Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/).
I try to learn and explain the code by re-implementing it.

Original version
----------------
```Javascript
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();
```

Adopted version
----------------
```Javascript  
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
        this.init.apply(this, arguments);
      }
    };
    // 2. link prototype
    ChildClass.prototype = Object.create(ParentClass.prototype); // avoid Class's own props
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
```
