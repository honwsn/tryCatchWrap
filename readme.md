tryCatchWrap is a tiny javascript  library for add try catch protection for most aync callbacks ,such xhr, timer, event listener callbacks.

 1. require or import tryCatchWrap.js in your project (support es5, es6)
 2. demo code
	
		const  errorHandle = function (err) {
		    //1. console log
		    var errMsg = err.stack ? err.stack : err.message;
		    console.error(errMsg ? errMsg : 'unknown error  happened....');
		    
		    //2. badJs report
		    BJ_REPORT && BJ_REPORT.report(err);
		};
		
		var tryCatchWrap = require(tryCatchWrap);
		tryCatchWrap.initialize(errorHandle);
