tryCatchWrap is a tiny javascript  library for add try catch protection for most aync callbacks ,such xhr, timer, event listener callbacks.

 1. require or import tryCatchWrap.js in your project (support es5, es6)
 2. demo code
	
		var errorCallBack = function(e){
		    
		//dispose javascript errors ,sunch report it to server for analysis
		    
		};
		
		var tryCatchWrap = require(tryCatchWrap);
		tryCatchWrap.initialize(errorCallBack);
