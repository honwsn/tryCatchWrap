tryCatchWrap is a javascript module for add try catch for most aync callbacks ,such xhr, timer, event listener callbacks.

1.require tryCatchWrap.js in your project

2.demo code

  var errorCallBack = function(e){
    
    //dispose javascript errors ,sunch report it to server for analysis
    
  };
  
  
  var tryCatchWrap = require(tryCatchWrap);
  tryCatchWrap.initialize(errorCallBack);
