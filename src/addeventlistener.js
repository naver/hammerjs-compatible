// http://qiita.com/sounisi5011/items/a8fc80e075e4f767b79
/**
 * @license addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
 * https://gist.github.com/2864711/946225eb3822c203e8d6218095d888aac5e1748e
 * modified by egjs
 */
(function (window, document, listeners_prop_name) {
    if ((!window.addEventListener || !window.removeEventListener) && window.attachEvent && window.detachEvent) {
        /**
         * @param {*} value
         * @return {boolean}
         */
        var is_callable = function (value) {
            return typeof value === "function";
        };
        /**
         * @param {!Window|HTMLDocument|Node} self
         * @param {EventListener|function(!Event):(boolean|undefined)} listener
         * @return {!function(Event)|undefined}
         */
        var listener_get = function (self, listener) {
            var listeners = listener[listeners_prop_name];
            if (listeners) {
                var lis;
                var i = listeners.length;
                while (i--) {
                    lis = listeners[i];
                    if (lis[0] === self) {
                        return lis[1];
                    }
                }
            }
        };
        /**
         * @param {!Window|HTMLDocument|Node} self
         * @param {EventListener|function(!Event):(boolean|undefined)} listener
         * @param {!function(Event)} callback
         * @return {!function(Event)}
         */
        var listener_set = function (self, listener, callback) {
            var listeners = listener[listeners_prop_name] || (listener[listeners_prop_name] = []);
            return listener_get(self, listener) || (listeners[listeners.length] = [self, callback], callback);
        };
        /**
         * @param {string} methodName
         */
        var docHijack = function (methodName) {
            var old = document[methodName];
            document[methodName] = function (v) {
                return addListen(old(v));
            };
        };
        /**
         * @this {!Window|HTMLDocument|Node}
         * @param {string} type
         * @param {EventListener|function(!Event):(boolean|undefined)} listener
         * @param {boolean=} useCapture
         */
        var addEvent = function (type, listener, useCapture) {
            useCapture;
            if (is_callable(listener)) {
                var self = typeof this === "object" && "setInterval" in this ? this.document.body : this;
                self.attachEvent(
                    "on" + type,
                    listener_set(self, listener, function (e) {
                        e = e || window.event;
                        var fakeEvent = {};
                        for(var i in e){
                          fakeEvent[i] = e[i];
                        }
                        fakeEvent.preventDefault = function () { e.returnValue = false; };
                        fakeEvent.stopPropagation = function () { e.cancelBubble = true; };
                        fakeEvent.target = e.target || e.srcElement || document.documentElement;
                        fakeEvent.currentTarget = e.currentTarget || self;
                        fakeEvent.timeStamp = e.timeStamp || (new Date()).getTime();
                        fakeEvent.which = e.button === 0 ? 1 : e.button;
                        fakeEvent.button = e.button === 1 ? 0 : e.button;
                        listener.call(self, fakeEvent);
                    })
                );
            }
        };
        /**
         * @this {!Window|HTMLDocument|Node}
         * @param {string} type
         * @param {EventListener|function(!Event):(boolean|undefined)} listener
         * @param {boolean=} useCapture
         */
        var removeEvent = function (type, listener, useCapture) {
            useCapture;
            if (is_callable(listener)) {
                var self = typeof this === "object" && "setInterval" in this ? this.document : this;
                var lis = listener_get(self, listener);
                if (lis) {
                    self.detachEvent("on" + type, lis);
                }
            }
        };
        /**
         * @param {!Node|NodeList|Array} obj
         * @return {!Node|NodeList|Array}
         */
        var addListen = function (obj) {
            var i = obj.length;
            if (i) {
                while (i--) {
                    obj[i].addEventListener = addEvent;
                    obj[i].removeEventListener = removeEvent;
                }
            } else {
                obj.addEventListener = addEvent;
                obj.removeEventListener = removeEvent;
            }
            return obj;
        };

        addListen([document, window]);
        if ("Element" in window) {
            /**
             * IE8
             */
            var element = window.Element;
            element.prototype.addEventListener = addEvent;
            element.prototype.removeEventListener = removeEvent;
        } else {
            /**
             * IE < 8
             */
            //Make sure we also init at domReady
            document.attachEvent("onreadystatechange", function () { addListen(document.all); });
            docHijack("getElementsByTagName");
            docHijack("getElementById");
            docHijack("createElement");
            addListen(document.all);
        }
    }
})(window, document, "x-ms-event-listeners");