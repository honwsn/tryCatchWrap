/**
 * Created by ianwang on 2016/03/10.
 * tryCatchWrap 能捕获页面异步环境下所有的异常，
 * 覆盖页面99.9%的js执行场景, 剩下的0.1就是页面的入口js
 * 若页面入口，是异常拉取的js资源，那就覆盖100%
 */
define(function (require, exports, module){
    var tryCatchWrap = {

        isFunction:function (what) {
            return typeof what === 'function';
        },

        hasKey:function (object, key) {
            return Object.prototype.hasOwnProperty.call(object, key);
        },

        wrap:function(func){
            var self = this;
            if(func === void 0 || !this.isFunction(func)){
                return func;
            }

            //is a wrapped obj,return it direct.
            if(func._isWrapped_){
                return func;
            }
            //has a wrapped obj ,return it
            if(func._wrappedObj_){
                return func._wrappedObj_;
            }

            function wrapped() {
                try {
                    return func.apply(this, arguments);
                } catch (err) {
                    if(self.errorHandle) {
                        self.errorHandle(err);
                    }
                    else {
                        var errMsg = err.stack ? err.stack : err.message;
                        console.error(errMsg ? errMsg : 'unknown error happened....');
                    }
                }
            }
            // copy over properties of the old function
            for (var property in func) {
                if (this.hasKey(func, property)) {
                    wrapped[property] = func[property];
                }
            }
            wrapped.prototype = func.prototype;
            func._wrappedObj_ = wrapped;
            wrapped._isWrapped_ = true;

            return wrapped;
        },

        //add try catch for build in call backs.. such as
        wrapBuildIns: function() {
            var self = this;

            function fill(obj, name, replacement) {
                var orig = obj[name];
                obj[name] = replacement(orig);
            }

            function wrapTimeFn(orig) {

                return function (fn, t) { // preserve arity
                    // Make a copy of the arguments
                    var args = [].slice.call(arguments);
                    var originalCallback = args[0];
                    if (self.isFunction(originalCallback)) {
                        args[0] = self.wrap(originalCallback);
                    }

                    // IE < 9 doesn't support .call/.apply on setInterval/setTimeout, but it
                    // also supports only two arguments and doesn't care what this is, so we
                    // can just call the original function directly.
                    if (orig.apply) {
                        return orig.apply(this, args);
                    } else {
                        return orig(args[0], args[1]);
                    }
                };
            }

            fill(window, 'setTimeout', wrapTimeFn);
            fill(window, 'setInterval', wrapTimeFn);

            if (window.requestAnimationFrame) {
                fill(window, 'requestAnimationFrame', function (orig) {
                    return function (cb) {
                        return orig(self.wrap(cb));
                    };
                });
            }

            // async event targets in browser
            'EventTarget Window Node ApplicationCache XMLHttpRequest XMLHttpRequestEventTarget XMLHttpRequestUpload'.replace(/\w+/g, function (global) {
                var proto = window[global] && window[global].prototype;
                if (proto && proto.hasOwnProperty && proto.hasOwnProperty('addEventListener')) {
                    fill(proto, 'addEventListener', function(orig) {
                        return function (evt, fn, capture, secure) { // preserve arity
                            try {
                                if (fn && fn.handleEvent) {
                                    fn.handleEvent = self.wrap(fn.handleEvent);
                                }
                            } catch (err) {
                                // can sometimes get 'Permission denied to access property "handle Event'
                            }
                            return orig.call(this, evt, self.wrap(fn), capture, secure);
                        };
                    });
                    fill(proto, 'removeEventListener', function (orig) {
                        return function (evt, fn, capture, secure) {
                            fn = fn && (fn._wrappedObj_ ? fn._wrappedObj_  : fn);
                            return orig.call(this, evt, fn, capture, secure);
                        };
                    });
                }
            });

            if ('XMLHttpRequest' in window) {
                fill(XMLHttpRequest.prototype, 'send', function(origSend) {
                    return function (data) { // preserve arity
                        var xhr = this;
                        'onreadystatechange onload onerror onprogress'.replace(/\w+/g, function (prop) {
                            if (prop in xhr && Object.prototype.toString.call(xhr[prop]) === '[object Function]') {
                                fill(xhr, prop, function (orig) {
                                    return self.wrap(orig);
                                }, true /* noUndo */); // don't track filled methods on XHR instances
                            }
                        });
                        return origSend.apply(this, arguments);
                    };
                });
            }

            var $ = window.jQuery || window.$;
            if ($ && $.fn && $.fn.ready) {
                fill($.fn, 'ready', function (orig) {
                    return function (fn) {
                        return orig.call(this, self.wrap(fn));
                    };
                });

                //$.Deferred add wrap...
            }
        },

        setErrorHandle: function(errorHandle) {
            if(typeof errorHandle !== 'function') {
                return;
            }

            this.errorHandle = errorHandle;
        },

        initialize: function(errorHandle) {
            this.setErrorHandle(errorHandle);
            this.wrapBuildIns();
        }
    };

    return tryCatchWrap;
});
