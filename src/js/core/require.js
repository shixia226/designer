(function (UI) {
    'use strict';

    var g_modules = {}, //所有已经加载完毕的模块
        g_modules_loading = {}, //正在加载的模块
        g_modules_defing = {}, //正在定义的模块
        g_config = {
            base: '', //基准路径
            path: {}, //模块与路径的键值对，不配置则取base与模块名组成的路径
            shim: {}, //非标准模块的引入方式
            mergejs: false //服务端是否支持自动合并多个JS为一个请求，此时路径为多个JS路径以','分割，否则只能拆开单独请求
        },
        require_idx = 0,
        require_list = [],
        suffix_js = '.js',
        r_func_cmp = /^function[^)]+\) *\{[\r\n\t ]*'use strict';/;

    /**
     * 配置模块信息
     * @param options
     *  {
     *    base: 基准路径
     *    path: Object 需要特殊标记的路径
     *    shim: Object
     *  }
     * 
     * eg:
     *  EUI.config({
     *      path: {
     *          jQuery: 'http://code.jquery.com/jquery-1.7.js'
     *      },
     *      shim: {
     *          jQuery: 'jQuery'
     *      }
     *  });
     */
    function config(options) {
        if (UI.isObject(options)) {
            UI.extend(true, g_config, options);
        }
    }

    //### 执行模块对象定义，该方法用于需要其它基础模块作参数的模块的定义
    function _define() {
        var len = arguments.length - 2, name = arguments[len];
        var module = arguments[len + 1].apply(null, [].slice.call(arguments, 0, len).concat(UI));
        if (!module) {
            UI.error(UI.i18n('core.require.error.module.define', '定义模块【{0}】错误', name));
            return false;
        }
        delete g_modules_defing[name];
        g_modules[name] = module;
    }

    //### 模块准备完毕后执行回调
    function _do_require_callback_(names, callback) {
        var modules = [], name = null, module = null, shim = null;
        for (var i = 0, len = names.length; i < len; i++) {
            if (!(module = g_modules[name = names[i]])) {
                if (!((shim = g_config.shim[name]) &&
                    (module = UI.isString(shim) ? window[shim] : UI.call(shim, UI, name)))) {
                    if (!g_modules_loading[name]) {
                        UI.error('core.require.error.module.unknow', '模块【{0}】未定义.', name);
                        return false;
                    }
                    return false;
                }
                g_modules[name] = module;
            }
            delete g_modules_loading[name];
            modules.push(module);
        }
        UI.call(true, callback, null, modules);
    }

    //### 修复循环引用的模块
    function _repare_require_rec_() {
        var requireInfo = null, listLen = require_list.length, redefineList = [];
        while ((requireInfo = require_list.pop())) {
            if (requireInfo[1] && requireInfo[1].handler === _define) {//必须是模块定义函数
                var modules = [], names = requireInfo[0], ready2define = true, redefine = false, module = null, name = null;
                for (var i = 0, len = names.length; i < len; i++) {
                    if (!(module = g_modules[name = names[i]]) && !g_modules_defing[name]) {//基础模块未加载且不处于定义状态下，先缓存
                        redefineList.unshift(requireInfo);
                        ready2define = false;
                        break;
                    } else {
                        modules.push(module);
                        if (!module) redefine = true;
                    }
                }
                if (ready2define) {
                    if (redefine) redefineList.unshift(requireInfo);
                    _define.apply(null, modules.concat(requireInfo[2]));//执行模块定义，该模块定义参数中的基础模块可能为null
                    break;
                }
            } else {
                redefineList.unshift(requireInfo);
            }
        }
        var redefineCount = redefineList.length;
        if (redefineCount === 0) return;
        if (listLen === redefineCount) {
            UI.error(UI.i18n('core.require.module.define.error.unknow', '模块定义中有未知错误.'));
            return false;
        }
        require_list = redefineList;
        return _repare_require_rec_();
    }

    //### 模块文件加载完毕回调
    function _after_require_js_(names, callback) {
        if ((require_idx -= 1) === 0) {//这里判断所有的网络请求都已完毕，再执行，否则可能需要的基础模块还未准备好
            var list = [], requireInfo = null, listLen = require_list.length + 1;
            if (_do_require_callback_(names, callback) === false) list.unshift([names, callback]);
            while (true) {//从后往前循环执行回调列表，防止列表中先后顺序不对时可以先执行前面的，再反过来执行剩下的
                while ((requireInfo = require_list.pop())) {
                    if (_do_require_callback_.apply(null, requireInfo) === false) list.unshift(requireInfo);
                }
                var len = list.length;
                if (!len) break;
                if (len === listLen) {//当列表中事件没有减少时，说明很有可能模块之间有循环引用
                    require_list = list;
                    if (require_idx !== 0) break;//这里需要再次判断是否又有需要加载的组件，可能在刚才的回调之中又要创建某个组件对象造成新的组件加载，需要等加载完成之后再一次性检测
                    return _repare_require_rec_();//修复循环引用，此时需要循环引用的模块中不能在定义体内调用基础模块的方法
                }
                listLen = len;
                require_list = list;
                list = [];
            }
        } else { // 不是最后一个在加载的模块文件，先缓存，待后面的加载完毕再执行，因为可能用到后面在加载的模块对象
            require_list.push(arguments);
        }
    }

    //### 加载模块文件
    function _require_js_(js, names, callback) {
        if (arguments[3] !== true) require_idx++;
        if (g_config.mergejs) { //后台支持合并JS的下载，即js路径可以为'a.js,b.js'这样的格式
            UI.script(js, { handler: _after_require_js_, args: [names, callback] });
        } else { //如果不支持，则按顺序拆分加载
            var idx = js.indexOf(',');
            if (idx === -1) {
                UI.script(js, { handler: _after_require_js_, args: [names, callback] });
            } else {
                UI.script(js.substr(0, idx), { handler: _require_js_, args: [js.substr(idx + 1), names, callback, true] });
            }
        }
    }

    /**
     * 加载模块并执行回调的公共方法
     * @param name 要加载的模块名称
     * @param callback 回调函数
     * @returns {*}
     */
    function require(name, callback) {
        var names = UI.isArray(name) ? name : name.split(','),
            modules = [], names2load = [], module = null, wait4loaded = false, path = null;
        for (var i = 0, len = names.length; i < len; i++) {
            if ((module = g_modules[name = names[i]])) {
                modules.push(module);
            } else if (g_modules_loading[name]) {
                wait4loaded = true;
            } else {
                g_modules_loading[name] = true;
                if (!((path = g_config.path[name]) && UI.endWith(path, suffix_js))) {
                    path = g_config.base + (path || name) + suffix_js;
                }
                names2load.push(path);
            }
        }
        if (names2load.length) {//如果有需要加载的JS则优先加载这些还未加载的JS
            _require_js_(names2load.join(','), names, callback);
        } else if (wait4loaded) {//如果需要的模块都处在加载状态时，则直接将回答放到执行列表最前面，带加载完成自动执行即可
            require_list.unshift([names, callback]);
        } else {//所需模块都已准备好，直接执行回调
            return UI.call(true, callback, UI, modules);
        }
    }

    /**
     * 定义模块的公共方法
     * @param name 模块名
     *  注：requirejs 是支持并建议忽略该name配置，其原理是每次加载一个模块且在下载该模块JS的script标签上绑定模块名称，
     *  待其下载完毕读出该模块名称即可。但EUI要求必须指定name，原因是EUI要支持后台合并下载，当合并下载多个模块时无法获取各个模块的名称
     * @param base 基础模块名，可以为数组，也可以是模块名以','分隔的字符串
     * @param module 模块创建函数
     * @returns {boolean}
     */
    function define(name, base, module) {
        if (!UI.isString(name)) {
            UI.error(UI.i18n('core.require.error.module.name', '未指定模块名称'));
            return false;
        }
        if (g_modules[name] || g_modules_defing[name]) {
            UI.error(UI.i18n('core.require.error.module.repeat', '重复定义模块【{0}】', name));
            return false;
        }
        if (UI.isArray(base) || UI.isString(base)) {
            g_modules_defing[name] = true;
            require(base, { handler: _define, args: [name, module] });
        } else {
            if (UI.isFunction(base) && r_func_cmp.test(base.toString())) {
                if (!(module = base(UI))) {
                    UI.error(UI.i18n('core.require.error.module.define', '定义模块【{0}】错误', name));
                    return false;
                }
            } else {
                module = base;
            }
            g_modules[name] = module;
        }
    }

    UI.extend(UI, {
        require: require,
        define: define,
        config: config
    });
})(EUI);