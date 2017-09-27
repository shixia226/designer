(function (namespace, name, undefined) {
    "use strict";

    var UI,
        r_namespace = /^\w+(\.\w+)*$/,
        r_func_prefix = /^function\s*\(/,
        r_func_comment = /^\/\/.*(\r|\n|$)/mg,
        r_func_params = /^function[^(]*\(([^)]+)\)/i,
        r_params_comma = / *, */,

        RANDOM_MATH_SEED = new Date().getTime(),

        global_timeout = (function (delay) {
            delay = delay || 226;
            var list = [], firing = false, fireIdx = null, fireLen = null, k = 0, timeid = null, start;
            function fire() {
                if (firing) return;
                firing = true;
                fireIdx = 0;
                fireLen = list.length;
                var time = (new Date()).getTime();
                while (fireIdx < fireLen) {
                    var t = list[fireIdx];
                    if (time - t.time >= t.delay) {
                        if ((UI.call(t) === false) || t.once) {
                            UI.call(t.onfinish, t.context);
                            var idx = list.indexOf(t);
                            if (idx !== -1) {//这里需要重新indexOf查找位置，否则在callback里调用了remove后将造成删除错误
                                list.splice(idx, 1);
                                fireLen--;
                                fireIdx--;
                            }
                        }
                        t.time = time;
                        if (t.single) break;
                    }
                    fireIdx++;
                }
                firing = false;
                timeid = false;
                start();
            }
            start = function () {
                if (!timeid && list.length) timeid = setTimeout(fire, delay);
            };
            function _checkIndex(func, context) {
                for (var i = 0, len = list.length; i < len; i++) {
                    var opt = list[i];
                    if (opt.id === func || opt.handler === func && opt.context === context) {
                        return i;
                    }
                }
                return -1;
            }
            return {
                add: function (func) {
                    if (!func) return;
                    var options = null;
                    if (!UI.isFunction(func)) {
                        if (!UI.isFunction(func = (options = func).handler)) return;
                    } else {
                        options = {};
                    }
                    var context = options.context || null, args = options.args;
                    if (!UI.isArray(args)) args = args ? [args] : [];
                    if (options.unique) {
                        var idx = _checkIndex(func, context);
                        if (idx !== -1) list.splice(idx, 1);
                    }
                    var handler = {
                        handler: func,
                        context: context,
                        args: args,
                        once: options.once !== false,
                        onfinish: options.onfinish,
                        single: options.single === true,
                        delay: parseInt(options.delay, 10) || 0,
                        time: (new Date()).getTime(),
                        id: ++k
                    };
                    if (options.trigger) {
                        UI.call(handler);
                    }
                    list.push(handler);
                    start();
                    return k;
                },
                remove: function (func) {
                    if (!func) return;
                    var idx = _checkIndex(func.handler || func, func.context || null);
                    if (idx === -1) return false;
                    list.splice(idx, 1);
                    if (firing) {
                        fireLen--;
                        if (idx <= fireIdx) fireIdx--;
                    } else if (list.length === 0) {
                        clearTimeout(timeid);
                        timeid = false;
                    }
                    return true;
                }
            };
        })(),

        doEval = window.execScript || function (data) {
            return window.eval.call(window, data);
        },
        newSubClazz = function () {
            return function _() {
                _.Super.apply(this, arguments);
            };
        },
        argNameValue = function (value, name) {
            return [name, value];
        },
        argValueName = function (value, name) {
            return [value, name];
        };

    //全局命名空间对象
    UI = namespace[name] = {
		/**
		 * 扩展对象
		 *  UI.extend({}, {name: 'shixia'});
		 *  UI.extend(true, {stu: {name: 'shixia', age: 20}});
		 *  UI.extend(true, false, {name: ''}, {name: 'shixia'});
		 *
		 * @param deep
		 * @param replace
		 * @param target
		 * @param ...source
		 * @returns {*}
		 */
        extend: function () {
            var deep = false, replace = true, i = 1, target = arguments[0], len = arguments.length;
            if (UI.isBoolean(target)) {
                deep = target;
                target = arguments[i++];
                if (UI.isBoolean(target)) {
                    replace = target;
                    target = arguments[i++];
                }
            }
            if (i === len) {
                target = UI.isArray(target) ? [] : {};
                i--;
            } else if (!target || (typeof target !== 'object' && !UI.isFunction(target))) {
                target = {};
            }
            var options = null, name = null, src = null, copy = null;
            for (; i < len; i++) {
                if (UI.isUndefined(options = arguments[i]) || UI.isNull(options)) continue;
                for (name in options) {
                    if (options.hasOwnProperty(name)) {
                        src = target.hasOwnProperty(name) ? target[name] : undefined;
                        copy = options[name];
                        if (src === copy || copy === undefined) continue;
                        if (deep && copy &&
                            (UI.isPlainObject(copy) || UI.isArray(copy))) {
                            if (UI.isPlainObject(copy) && !UI.isPlainObject(src)) {
                                if (src !== undefined && !replace) continue;
                                src = {};
                            } else if (UI.isArray(copy) && !UI.isArray(src)) {
                                if (src !== undefined && !replace) continue;
                                src = [];
                            }
                            target[name] = UI.extend(deep, replace, src, copy);
                        } else if (replace || src === undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        },
		/**
		 * 继承
		 *  UI.inherit(Coder, People, {getWork: function(){ return 'coder'; }}, {...});
		 *
		 * @param sub 子类
		 * @param sup 父类
		 * @param methods 子类的方法集合
		 */
        inherit: function (sub, sup, methods) {
            if (!sup) return;
            methods = [].slice.call(arguments, 2);
            if (!sub) {
                sub = newSubClazz();
            } else {
                methods.unshift(sub.prototype);
            }
            var F = function () {
            };
            F.prototype = sup.prototype;
            var subp = sub.prototype = new F();
            if (methods.length) {
                methods.unshift(subp);
                UI.extend.apply(UI, methods);
            }
            subp.constructor = sub;
            sub.Super = sup;
            return sub;
        },
		/**
		 * 命名空间
		 *  UI.namespace('com.shixia.portal', window); => window.com.shixia.portal === {}
		 *  UI.namespace('com.shixia.portal', window, 'A', 'B'); => window.com.shixia.portal === ['A', 'B']
		 *
		 * @param names
		 * @returns {*}
		 */
        namespace: function (names) {
            var ck = 2;
            if (names === true) {
                names = arguments[1];
                ck++;
            }
            if (!UI.isString(names)) return;
            names = names.split('.');
            var obj = arguments[ck - 1] || window, name = null, dest = null, len = names.length - 1;
            for (var i = 0; i < len; i++ , obj = dest) {
                name = names[i];
                dest = obj[name];
                if (!dest || !UI.isObject(dest)) {
                    dest = obj[name] = {};
                }
            }
            name = names[len];
            dest = obj[name];
            var argLen = arguments.length;
            if (ck !== 2 || argLen > ck) {
                if (ck !== 2 || !UI.isArray(dest)) {
                    dest = obj[name] = dest === undefined || dest === null ? [] : [dest];
                }
                if (argLen > ck) {
                    dest.push.apply(dest, dest.slice.call(arguments, ck));
                }
            } else if (!dest || !UI.isObject(dest)) {
                dest = obj[name] = {};
            }
            return dest;
        },
		/**
		 * 获取随机数
		 * @param prefix
		 * @param suffix
		 * @returns {string}
		 */
        random: function (prefix, suffix) {
            RANDOM_MATH_SEED = (RANDOM_MATH_SEED * 69069) % 0x80000000;
            var rt = (RANDOM_MATH_SEED / 0x80000000).toString().replace(/\w\./, "");
            if (prefix) rt = prefix + rt;
            if (suffix) rt = rt + suffix;
            return rt;
        },
		/**
		 * 判断对象是否简单的JSON对象
		 * @param obj
		 * @returns {boolean}
		 */
        isPlainObject: function (obj) {
            if (!obj || typeof (obj) !== "object" || obj.nodeType || obj.window === obj) {
                return false;
            }
            try {
                if (obj.constructor && !obj.hasOwnProperty("constructor") && !obj.constructor.prototype.hasOwnProperty("isPrototypeOf")) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            for (var key in obj) {
                if (obj[key] !== undefined && !obj.hasOwnProperty(key)) return false;
            }
            return true;
        },
		/**
		 * 判断是否是一个空的JSON对象
		 * @param obj
		 * @returns {boolean}
		 */
        isEmptyObject: function (obj) {
            if (!this.isPlainObject(obj)) return false;
            for (var key in obj) {
                if (obj[key] != null) return false;
            }
            return true;
        },
		/**
		 * 清空一个对象
		 * @param obj
		 * @param names
		 */
        empty: function (obj, names) {
            if (!obj) return;
            if (!names) {
                for (var key in obj) {
                    if (obj[key] !== undefined && obj.hasOwnProperty(key)) {
                        delete obj[key];
                    }
                }
            } else {
                if (!UI.isArray(names)) {
                    if (!UI.isString(names)) return;
                    names = [names];
                }
                for (var i = 0, len = names.length; i < len; i++) {
                    delete obj[names[i]];
                }
            }
        },
		/**
		 * 执行字符串脚本
		 * @param data
		 * @returns {*|Function}
		 */
        execScript: function (data) {
            if (UI.isString(data) && (data = data.trim())) {
                return doEval(data);
            }
        },
		/**
		 * 字符串开头处理方法
		 * @param str 要处理的字符串
		 * @param prefix 被处理的开头字符串
		 * @param ensure
		 *   true: 确保str以prefix开头并返回
		 *   false: 确保str不以prefix开头并返回
		 *   (OTHER): 返回str是否以prefix开头(Boolean)
		 * @returns {*}
		 */
        startWith: function (str, prefix, ensure) {
            if (!prefix) return;
            if (UI.isNumber(str)) {
                str = '' + str;
            } else {
                if (!UI.isString(str)) return;
            }
            var len = prefix.length, sw = str.substr(0, len) === prefix;
            if (ensure === true) {
                return sw ? str : (prefix + str);
            } else if (ensure === false) {
                if (sw) {
                    do {
                        str = str.substr(len);
                    } while (str.substr(0, len) === prefix);
                }
                return str;
            }
            return sw;
        },
		/**
		 * 字符串结尾处理方法
		 * @param str 要处理的字符串
		 * @param suffix 被处理的结尾字符串
		 * @param ensure
		 *   true: 确保str以suffix结尾并返回
		 *   false: 确保str不以suffix结尾并返回
		 *   (OTHER): 返回str是否以suffix结尾(Boolean)
		 * @returns {*}
		 */
        endWith: function (str, suffix, ensure) {
            if (!suffix) return;
            if (UI.isNumber(str)) {
                str = '' + str;
            } else {
                if (!UI.isString(str)) return;
            }
            var len = suffix.length, idx = str.length - len, ew = str.substr(idx) === suffix;
            if (ensure === true) {
                return ew ? str : (str + suffix);
            } else if (ensure === false) {
                if (ew) {
                    do {
                        str = str.substr(0, idx);
                    } while (str.substr(idx -= len) === suffix);
                }
                return str;
            }
            return ew;
        },
		/**
		 * 对数据保留小数后几位
		 * @param num
		 * @param unit
		 * @returns {number}
		 */
        round: function (num, unit) {
            if (isNaN(num = parseFloat(num, 10))) return 0;
            if (isNaN(parseInt(unit, 10)) || unit <= 0) return Math.round(num);
            var rate = Math.pow(10, unit);
            return Math.round(num * rate) / rate;
        },
        asString: function (str) {
            if (UI.isString(str)) return str;
            if (str === null || str === undefined) return "";
            return UI.isPlainObject(str) ? JSON.stringify(str) : str.toString ? str.toString() : '' + str;
        },
		/**
		 * 将字符串转换成函数返回
		 * @param str String
		 *  命名空间类型 "xxx.xx.x" 此时会直接从args|window中查找出对应的方法， 此时args可以为null|Object|Array<Object>
		 *  函数定义字符串 "function(..." 此时会直接将字符串转换成JS函数
		 *  函数体字符串 "var a = xxx; ..." 此时会生成以该字符串为内容，args为参数列表的函数, 此时args可以为null|String|Array<String>
		 * @param args
		 * @returns {*}
		 */
        parseFunc: function (str, args) {
            if (UI.isFunction(str)) return str;
            if (!UI.isString(str)) return null;
            var func = null, i = null, len = null;
            if (r_namespace.test(str)) {
                if (!UI.isArray(args)) args = [args || window];
                var names = str.split("."), namelen = names.length, obj = null;
                for (i = 0, len = args.length; i < len; i++) {
                    obj = args[i];
                    if (!obj) continue;
                    for (var j = 0; j < namelen; j++) {
                        if (!(obj = obj[names[j]])) break;
                    }
                    if (UI.isFunction(obj)) {
                        func = obj;
                        break;
                    }
                }
            } else {
                str = str.replace(r_func_comment, '');//移除最前面的注释信息
                if (r_func_prefix.test(str)) {
                    func = UI.parseData(str);
                } else {
                    if (UI.isArray(args)) {
                        for (i = args.length - 1; i >= 0; i--) {
                            if (!UI.isString(args[i])) args.splice(i, 1);
                        }
                    } else {
                        args = UI.isString(args) ? [args] : [];
                    }
                    args.push(str);
                    func = Function.apply(null, args);
                }
            }
            return func;
        },
		/**
		 * 将字符串转换成正则对象
		 * @param str String/Array 字符串表示的都是要匹配的字符，如果要匹配多种组合，需使用数组
		 * @param pattern String "igm"
		 * @returns {*}
		 */
        parseReg: function (str, pattern) {
            if (!str) return null;
            if (UI.isRegExp(str)) return str;
            var regstr = null;
            if (!UI.isArray(str)) {
                if (!UI.isString(str)) return null;
                regstr = str;
            } else {
                var texts = [], str_ = null;
                for (var i = 0, len = str.length; i < len; i++) {
                    if ((str_ = str[i]) && UI.isString(str_)) {
                        texts.push(str_);
                    }
                }
                if (!texts.length) return null;
                regstr = '(?:' + texts.join(')|(?:') + ')';
            }
            return new RegExp(arguments[2] === true ? (regstr.indexOf("|") === -1 ? ("^" + regstr + "$") : ("^(?:" + regstr + ")$")) : regstr, pattern || '');
        },
		/**
		 * 将字符串转换成XML对象
		 * @param data
		 * @returns {*}
		 */
        parseXml: function (data) {
            var xml, tmp;
            if (!data || !UI.isString(data)) {
                return null;
            }
            try {
                if (window.DOMParser) { // Standard
                    tmp = new DOMParser();
                    xml = tmp.parseFromString(data, "text/xml");
                } else { // IE
                    xml = new ActiveXObject("Microsoft.XMLDOM");
                    xml.async = "false";
                    xml.loadXML(data);
                    xml = xml.documentElement;
                }
            } catch (e) {
                xml = undefined;
            }
            if (!xml || xml.getElementsByTagName("parsererror").length) {
                xml = null;
            }
            return xml;
        },
        parseJson: function (data) {
            if (!data) return;
            try {
                return JSON.parse(data);
            } catch (e) {
                data = UI.parseData(data);
                if (UI.isPlainObject(data)) return data;
            }
        },
        parseData: function (data) {
            try {
                return (new Function("return " + data))();
            } catch (e) {
                UI.error(e);
            }
        },
		/**
		 * 执行回调
		 *  UI.call(window.alert, null, 'Success');
		 *  UI.call('alert', window, 'Success');
		 *  UI.call({ handler: window.alert, args: ['Success'] });
		 *  UI.call({ handler: 'alert', context: window }, null, 'Success');
         *  UI.call(true, UI.call, UI, 'handler', 'context', 'msg', { handler: window.alert, msg: '' })
		 *
		 * @param handler
		 *  function或{handler: function, context: Object, args: ...arguments, params: Object}
		 * @param context
		 * @param ...arguments
		 * @returns {*}
		 */
        call: function (handler, context) {
            var idx = 2;
            if (handler === true) {
                handler = context;
                context = arguments[idx++];
            }
            if (!handler) return;
            var args = null, before = false, params;
            if (UI.isString(handler)) {
                if (!context || !UI.isFunction(handler = context[handler])) return;
            } else if (!UI.isFunction(handler)) {
                context = handler.context || context;
                args = handler.args;
                params = handler.params;
                before = handler.before === true;
                if (!UI.isFunction(handler = handler.handler) &&
                    (!context || !UI.isFunction(handler = context[handler]))) return;
            }
            var realArgs = [].slice.call(arguments, idx);
            if (idx !== 2 && realArgs.length > 0) {
                var lastParam = realArgs.pop();
                if (!params) {
                    params = lastParam;
                } else {
                    realArgs = lastParam.concat(realArgs);
                }
            }
            if (params) {
                if (idx !== 2 && UI.isArray(params)) {
                    realArgs = realArgs.concat(params);
                } else {
                    var match = handler.toString().match(r_func_params);
                    if (match) {
                        match = match[1].trim().split(r_params_comma);
                        var paramArgs = [], argLen = 0, argValue;
                        for (var i = 0, len = match.length; i < len; i++) {
                            argLen = paramArgs.push((argValue = params[match[i]]) === undefined &&
                                (argValue = params[argLen]) === undefined &&
                                (argValue = realArgs.shift()) === undefined ? null : argValue);
                        }
                        realArgs = paramArgs.concat(realArgs);
                    }
                }
            }
            if (args != null) {
                var method = before ? 'unshift' : 'push';
                if (UI.isArray(args)) {
                    realArgs[method].apply(realArgs, args);
                } else {
                    realArgs[method](args);
                }
            }
            return handler.apply(context, realArgs);
        },
        timeout: function (func) {
            if (arguments[1] === true) {
                return global_timeout.remove(func);
            } else {
                return global_timeout.add(func);
            }
        },
        indexOf: function (array, value, name) {
            var i, len = array.length;
            if (UI.isString(name)) {
                for (i = arguments[3] >>> 0 || 0; i < len; i++) {
                    if (array[i][name] === value) return i;
                }
            } else if (UI.isFunction(value) || UI.isObject(value)) {
                for (i = arguments[2] >>> 0 || 0; i < len; i++) {
                    if (UI.call(value, null, array[i], i)) return i;
                }
            } else {
                for (i = arguments[2] >>> 0 || 0; i < len; i++) {
                    if (array[i] === value) return i;
                }
            }
            return -1;
        },
        each: function (items, handler) {
            var context = arguments[2] || UI, argMethod = arguments[3];
            if (argMethod === true) {
                argMethod = argNameValue;
            } else if (!argMethod) {
                argMethod = argValueName;
            }
            if (UI.isArray(items)) {
                for (var i = 0, len = items.length; i < len; i++) {
                    if (UI.call(true, handler, context, UI.call(argMethod, context, items[i], i)) === false) return i;
                }
            } else if (UI.isObject(items)) {
                for (var name in items) {
                    if (items.hasOwnProperty(name)) {
                        if (UI.call(true, handler, context, UI.call(argMethod, context, items[name], name)) === false) return name;
                    }
                }
            }
        },
        next: function (arr, idx) {
            if (arr) {
                var obj = null;
                if (!UI.isArray(arr)) {
                    obj = arr;
                    idx = arr.idx;
                    arr = arr.arr;
                } else {
                    obj = {};
                }
                if (UI.isArray(arr) && arr.length > 0) {
                    return arr[obj.idx = isNaN(idx) ? 0 : (idx + 1) % arr.length];
                }
            }
        },
        error: function (msg) {
            if (window.console) window.console.error(msg);
        },
        warn: function (msg) {
            if (window.console) window.console.warn(msg);
        },
		/**
		 * 返回true的空方法
		 * @returns {boolean}
		 */
        returntrue: function () {
            return true;
        },
		/**
		 * 返回false的空方法
		 * @returns {boolean}
		 */
        returnfalse: function () {
            return false;
        },
		/**
		 * 空函数
		 */
        noop: function () {
        },
        value: function (value, def) {
            return value === null || value === undefined ? def : value;
        }
    };

    (function (names, UI, toString) {
        for (var i = 0, len = names.length; i < len; i++) {
            (function (name, UI, toString) {
                var type = '[object ' + name + ']';
                UI['is' + name] = function (obj) {
                    return toString.call(obj) === type;
                };
            })(names[i], UI, toString);
        }
    })(['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Null', 'Undefined'], UI, Object.prototype.toString);

})(window, 'EUI');