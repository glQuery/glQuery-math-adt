(function() {
  var 
    constructorNames = [
      // Binary expressions
      'Mul', 'Plus', 'Sub',
      // Unary expressions
      'Neg', 'Floor', 'Ceil', 'Abs'
    ],
    evalADT = function(adt, f) {
      var 
        adtConstructors = {},
        result,
        i,
        ff;
      // Return unboxed primitive values
      //if (!Array.isArray(adt) || typeof adt[0] !== 'string' || !(adt[0] in f))
      if (!Array.isArray(adt) || typeof adt[0] !== 'string')
        return adt;
      // Evaluate all sub-expression in the data type
      result = adt.slice(1);
      for (i = 0; i < result.length - 1; ++i)
        result[i] = evalADT(result[i], f);
      //* Add type annotations to the current constructor (allows for polymorphic interfaces)
      typedConstructor = adt[0];
      for (i = 0; i < result.length - 1; ++i) {
        if (Array.isArray(result[i]) && result.length > 0 && typeof result[0] == 'string')
          typedConstructor += "_" + result[0]
        else
          typedConstructor += "_" + typeof result;
      }
      //*/ 
      // Evaluate boxed data type using the given dispatch table
      //return f[adt[0]].apply(null, result);
      ff = f[typedConstructor];
      if (typeof ff !== "undefined")
        return ff.apply(null, result); // Apply typed deconstructor
      ff = f[adt[0]];
      if (typeof ff !== "undefined")
        return ff.apply(null, result); // Apply untyped deconstructor
      return adt; // No deconstructor found
    },
    makeConstructor = function(key) { return function() { [key].concat(arguments); }; },
    adtConstructors = {},
    i;
  // Create ADT constructors
  for (i = 0; i < constructorNames.length; ++i) {    
    var name = constructorNames[i];
    adtConstructors[name] = makeConstructor(name);
  };
})();

