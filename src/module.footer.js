
// Extend glQuery if it is defined
if (typeof glQuery !== 'undefined' && glQuery != null)
  for(var key in glQueryMath)
    if (glQuery[key] == null)
      glQuery[key] = glQueryMath[key];
return glQueryMath;

})();

