 **tryCatchWrap** 能捕获页面异步环境下所有的异常，
 覆盖页面99.9%的js执行场景, 剩下的0.1就是页面的入口js
 若页面入口，是异常拉取的js资源，那就覆盖100%

 1. require or import tryCatchWrap.js in your project (support es5, es6)
 2. demo code
	
		var errorCallBack = function(e){
		    
		//dispose javascript errors ,sunch report it to server for analysis
		    
		};
		
		var tryCatchWrap = require(tryCatchWrap);
		tryCatchWrap.initialize(errorCallBack);
