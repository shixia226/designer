(function (UI) {
    'use strict';

    var g_name_events = '$events',//元素未绑定的事件
        g_prefix_prop = '$PROP_',//属性前缀
        g_name_handler_system = 'system',//系统注册函数，该函数无法禁用和销毁

        /* 绑定DOM事件 */
        _bindEvent = function (elemName, events, prop, types) {
            var handler, elem = prop[elemName];
            for (var name in events) {
                if (UI.isFunction(handler = events[name])) {
                    UI.bind(elem, types[name] || name, this, handler);
                } else {
                    _bindEvent.call(this, name, handler, prop, types);
                }
            }
        },
        /* 将不绑定的DOM事件转换成Map形式，用于后续脚本调用触发(trigger) */
        _mapEvent = function (elemName, events, prop, types, map) {
            map = map || {};
            var handler, elem = prop[elemName];
            for (var name in events) {
                if (events.hasOwnProperty(name)) {
                    if (UI.isFunction(handler = events[name])) {
                        var type = types[name] || name, idx = type.indexOf('.');
                        if (idx !== -1) type = type.substr(0, idx);
                        (map[type] = map[type] || []).push({
                            elem: elem,
                            handler: handler
                        });
                    } else {
                        _mapEvent.call(this, name, handler, prop, types, map);
                    }
                }
            }
            return map;
        },
        triggerHandler = function (item, i, evt) {
            var elem = item.elem;
            if (UI.isAncestor(elem, evt.target, true)) {
                item.handler.call(elem, evt);
            }
        },
        /* 脚本触发DOM事件 */
        trigger = function (name, evt) {
            if (!name || !evt) return;
            evt.data = this;
            UI.each(this._property[g_name_events][name], {
                handler: triggerHandler,
                args: evt
            });
        },
        _attachEvent = function (name, evt, filter) {
            if (filter && filter.test && filter.test(name)) return;
            if (UI.isArray(evt)) {
                for (var i = 0, len = evt.length; i < len; i++) {
                    _attachEvent.call(this, name, evt[i], filter);
                }
            } else {
                var idx = name.indexOf('.'), nameKey = null, suffix = '';
                if (idx === -1) {
                    nameKey = this[name];
                } else {
                    suffix = name.substr(idx);
                    nameKey = this[name.substr(0, idx)];
                }
                this.on((UI.isString(nameKey) ? nameKey : name) + suffix, evt, filter);
            }
        },
        _detachEvent = function (typeEvents, type, filter) {
            for (var i = typeEvents.length - 1; i >= 0; i--) {
                var event = typeEvents[i];
                if (event.system) continue;
                if (!filter) {
                    typeEvents.splice(i, 1);
                } else if (UI.isString(filter)) {
                    if (filter === event.id) {
                        typeEvents.splice(i, 1);
                        break;
                    }
                } else {
                    var rt = UI.call(filter, this, event.id, type);
                    if (rt === true) {
                        typeEvents.splice(i, 1);
                        break;
                    } else if (rt === false) {
                        typeEvents.splice(i, 1);
                        return false;
                    }
                }
            }
        },
        disableEvent = function (types, disabledTypes, rt) {
            var i = 0, len;
            if (UI.isString(types)) {
                types = types.split(',');
                for (len = types.length; i < len; i++) {
                    var type = types[i];
                    if (disabledTypes.indexOf(type) === -1) {
                        disabledTypes.push(type);
                        rt.push(type);
                    }
                }
            } else if (UI.isArray(types)) {
                for (len = types.length; i < len; i++) {
                    disableEvent(types[i], disabledTypes, rt);
                }
            }
            return rt;
        },
        enableEvent = function (types, disabledTypes, rt) {
            var i = 0, len;
            if (UI.isString(types)) {
                types = types.split(',');
                for (len = types.length; i < len; i++) {
                    var type = types[i], idx = disabledTypes.indexOf(type);
                    if (idx !== -1) {
                        disabledTypes.splice(idx, 1);
                        rt.push(type);
                    }
                }
            } else if (UI.isArray(types)) {
                for (len = types.length; i < len; i++) {
                    enableEvent(types[i], disabledTypes, rt);
                }
            }
            return rt;
        };

    /**
     * 组件基类
     * @param options
     *  {
     *      wnd: window
     *      elem: Element, 组件容器节点，该属性不为空时会触发onContainerInit
     *      onContainerInit: Function(elem, options), 组件容器初始化方法，配合elem使用，返回property对象，context为this，也可是满足UI.call的回调对象
     *      pelem: Element/String/(wnd.document.body), elem为空时才会生效
     *      onComponentInit: Function(elem, doc, options), 组件初始化方法，配合pelem使用，返回property对象，context为this
     *      ctcss: String/Object, 容器初始样式，格式见UI.css()
     * 		events: Object, 要注册的鼠标键盘事件，事件名作为key，事件函数作为value，可以内嵌组件内部DOM的事件，该DOM属性名作为key，事件名及事件函数的键值对作为value
     * 	    {
     * 	      click: function() {},
     * 	      container: {
     * 	        mousedown: function() {}
     * 	      }
     * 	    }
     *      evtelem: String/('container'), events注册事件作用对象，缺省是直接注册到container上
     *      evtmaps: Object, 默认是按照events里的事件名进行注册的，但有时需要更改事件名，如click换成mouseup,则需要配置evtmaps为{ click: 'mouseup' }
     * 	    evtbind: Boolean, 是否绑定，如果为false，则events中的事件实际上将不会被绑定，而是通过trigger执行
     *      handlers: 对象内置注册事件
     *  }
     * @constructor
    */
    function Component(options) {
        if (this._property) return;//防止多继承的类实例化多次调用该构造方法
        options = options || {};
        var elem = options.elem, prop = null, wnd = null, doc = null;
        if (elem) {
            wnd = UI.getWindow(elem);
            doc = wnd.document;
            if (!(prop = UI.call(options.onContainerInit, this, elem, doc, options))) {
                prop = { container: elem };
            }
        } else {
            var pelem = options.pelem;
            if (pelem) {
                if (UI.isString(pelem)) {
                    wnd = options.wnd || window;
                    doc = wnd.document;
                    pelem = UI.query(pelem, doc, true);
                } else {
                    doc = UI.getDocument(pelem);
                    wnd = UI.getWindow(doc);
                }
            } else {
                wnd = options.wnd || window;
                doc = wnd.document;
                pelem = doc.body;
            }
            if (!(prop = UI.call(options.onComponentInit, this, pelem, doc, options)) || !prop.container) {
                prop = prop || {};
                prop.container = pelem.appendChild(doc.createElement('div'));
            }
        }
        this.wnd = wnd;
        this.doc = doc;
        UI.extend(this._property = prop, {
            cmpid: options.id || UI.random('cmp-'),
            handlers: {},
            handlers_disabled: false,
            handlers_types_disabled: [],
            handlers_types_emitting: []
        });
        UI.css(prop.container, options.ctcss);
        var events = options.events;
        if (events) {
            if (options.bindevent === false) {
                prop[g_name_events] = _mapEvent(options.evtelem || 'container', events, prop, options.evtmaps || {});
                this.trigger = trigger;
            } else {
                _bindEvent.call(this, options.evtelem || 'container', events, prop, options.evtmaps || {});
            }
        }
        var handlers = options.handlers;
        if (handlers) {
            UI.each(handlers, { handler: _attachEvent, args: options.handlers_filter }, this, true);
        }
        var props = options.props;
        if (props) {
            UI.each(props, this.property, this, true);
        }
    }

    UI.extend(Component.prototype, {
        EVT_ON_DISPOSE: 'EVT_ON_DISPOSE',
        KEY_ROLLBACK: '$ROLLBACK$',

        dispose: function () {
            this.emit(this.EVT_ON_DISPOSE);
            var elem = this.elem();
            UI.unbind(elem);
            UI.removeNode(elem);
            this._property = null;
        },
        elem: function () {
            return this._property.container;
        },
        on: function (type, handler) {
            var property = this._property;
            if (type === true) {
                if (!handler) {
                    property.handlers_disabled = false;
                    return;
                } else {
                    return enableEvent(handler, property.handlers_types_disabled, []);
                }
            }
            if (!type || !UI.isString(type) || !handler) return false;
            var splitType = type.split('.'), evtid = splitType[1] || arguments[2] ? g_name_handler_system : UI.random();
            var handlers = property.handlers, typeEvents = handlers[type = splitType[0]], idx = -1;
            if (!typeEvents) typeEvents = handlers[type] = [];
            if (evtid === g_name_handler_system) {
                idx = UI.indexOf(typeEvents, false, 'system');
                typeEvents.splice(idx === -1 ? typeEvents.length : idx, 0, {
                    handler: handler,
                    system: true
                });
            } else {
                idx = UI.indexOf(typeEvents, evtid, 'id');
                typeEvents[idx === -1 ? typeEvents.length : idx] = {
                    handler: handler,
                    id: evtid,
                    system: false
                };
            }
            return evtid;
        },
        /**
         * 注销组件注册事件
         * @param type 指定类型类型，为true是表示暂时禁用注册类型,否则是注销
         * @param filter 过滤，如果type为true时，该参数为空，则表示禁用所有注册事件，不为空时则只禁用filter(可以是字符串或数组)类型的注册事件
         *      当type不为true时，则filter为函数配置项，返回true或false均可以注销事件，区别在于返回false会break后续的事件过滤
         */
        off: function (type, filter) {
            var property = this._property;
            if (type === true) {
                if (!filter) {
                    if (property.handlers_disabled) return false;
                    property.handlers_disabled = true;
                    return;
                } else {
                    return disableEvent(filter, property.handlers_types_disabled, []);
                }
            }
            var handlers = property.handlers;
            if (!type || !UI.isString(type)) {
                UI.each(handlers, { handler: _detachEvent, args: [filter] });
            } else {
                var typeEvents = handlers[type];
                if (typeEvents) {
                    _detachEvent(typeEvents, type, filter);
                }
            }
        },
        emit: function (type) {
            if (!type) return;
            var property;
            if (!UI.isString(type)) {
                if (!(property = type.property) || !UI.isString(type = type.type)) return;
            } else {
                property = this._property;
            }
            var emitingTypes = property.handlers_types_emitting;
            if (emitingTypes.indexOf(type) !== -1) return;//防止循环调用
            var typeEvents = property.handlers[type];
            if (!typeEvents) return;
            emitingTypes.push(type);
            var disabled = property.handlers_disabled,
                disabledTypes = property.handlers_types_disabled,
                args = [].slice.call(arguments, 1),
                arr = [];
            for (var i = 0, len = typeEvents.length; i < len; i++) {
                var event = typeEvents[i];
                if (!event.system) {
                    if (disabled ||
                        UI.indexOf(disabledTypes, type) !== -1 ||
                        UI.indexOf(disabledTypes, event.id) !== -1) {
                        continue;
                    }
                }
                if (UI.call(true, event.handler, this, args) === false) {
                    args.push(this.KEY_ROLLBACK);
                    for (i = i - 1; i >= 0; i--) {
                        UI.call(true, arr[i].handler, this, args);
                    }
                    return false;
                }
                arr.push(event);
            }
            emitingTypes.pop();
        },
        property: function (name, value) {
            name = UI.startWith(name, g_prefix_prop, true);
            if (arguments.length === 1) {
                return this._property[name];
            } else if (value === null) {
                delete this._property[name];
            } else {
                this._property[name] = value;
            }
        }
    });

    UI.define('cmp', Component);

    var g_components = {}, g_component_id = 'cmp-id', g_reg_url = /^http[s]?:\/\/[^.]+\./;

    function _createCmp(Clazz, options, callback, id) {
        var cmp = null;
        if (!(id = id || options.id) || id.indexOf(':') === -1) id = UI.random((id || 'cmp') + ':');
        if (!(cmp = g_components[id])) {
            cmp = UI.call(options, UI, Clazz, id);
            if (!(cmp && cmp instanceof Clazz)) {
                (options = cmp || options).id = id;
                cmp = new Clazz(options);
            }
            g_components[id] = cmp;
            if (cmp.elem) {
                cmp.elem().setAttribute(g_component_id, id);
            }
        }
        UI.call(callback, cmp);
        return cmp;
    }

    /**
     * 创建组件对象的公共方法，该方法与disCmp配套使用
     * @param module 模块名 如果指定组件对象的ID，可以在module后面加'.'及ID，如'cmp.mycmp'表示创建一个ID为mycmp的cmp对象
     * @param options 模块对象初始参数，也可以是返回模块对象初始参数的方法
     * @param callback 创建模块对象后的回调函数
     */
    function getCmp(module, options, callback) {
        if (UI.isString(module)) {
            var idx = module.indexOf('.');
            return UI.require(idx === -1 ? module : module.substr(0, idx), { handler: _createCmp, args: [options, callback, module] });
        } else if (module instanceof Comment) {
            return _createCmp(module, options, callback, arguments[3]);
        }
    }

    function _filter_disCmp(filter) {
        for (var i in g_components) {
            if (g_components.hasOwnProperty(i)) {
                var cmp = g_components[i], rt = UI.call(filter, UI, cmp);
                if (rt === true) continue;
                if (cmp.dispose) cmp.dispose();
                delete g_components[i];
                if (rt === false) break;
            }
        }
    }

    /**
     * 销毁模块对象，该方法用于销毁getCmp方法创建的模块对象
     * @param cmp 模块对象，模块对象ID，过滤函数或空
     */
    function disCmp(cmp) {
        var id;
        if (!cmp) {
            for (id in g_components) {
                if (g_components.hasOwnProperty(id)) {
                    if (g_components[id].dispose) g_components[id].dispose();
                }
            }
            g_components = {};
        } else if (UI.isFunction(cmp)) {
            _filter_disCmp(cmp);
        } else if (UI.isString(cmp)) {
            cmp = g_components[id = cmp];
            if (cmp) {
                if (cmp.dispose) cmp.dispose();
                delete g_components[id];
            }
        } else if (cmp instanceof Component) {
            id = cmp.elem().getAttribute(g_component_id);
            if (cmp.dispose) cmp.dispose();
            delete g_components[id];
        } else {
            for (id in g_components) {
                if (g_components.hasOwnProperty(id)) {
                    var _cmp = g_components[id];
                    if (_cmp === cmp) {
                        if (_cmp.dispose) _cmp.dispose();
                        delete g_components[id];
                        break;
                    }
                }
            }
        }
    }

    /**
     * 查询组件对象
     * @param cmp 组件ID或组件下层DOM
     * @param clazz 指定组件类名，如果cmp为DOM，未指定该参数时则找该DOM上面的第一个组件，否则找该DOM上面第一个clazz类型的组件对象
     * @returns {*}
     */
    function queryCmp(cmp) {
        if (!cmp) return;
        if (UI.isString(cmp)) {//根据ID查找对应的组件对象
            return g_components[cmp];
        }
        if (cmp.nodeType === 1) {//根据DOM查找指定类型的组件
            var level = parseInt(arguments[2]);
            if (isNaN(level)) level = -1;
            do {
                var uid = cmp.getAttribute(g_component_id);
                if (uid && (uid = g_components[uid]) && (!arguments[1] || uid instanceof arguments[1])) {
                    return uid;
                }
                if (level === 0) break;
                level--;
            } while ((cmp = cmp.parentNode) && cmp.nodeType === 1);
        }
    }

    /**
     * 定义组件
     * @param {String} name 
     * @param {String/Array} base 
     * @param {Function} cmp 
     */
    function defineCmp(name, base, cmp) {
        if (arguments.length === 2) {
            cmp = base;
            base = 'cmp';
        }
        UI.define(name, base, cmp);
    }

    var _create_cmp_content_ = function (prop, callback) {
        delete prop.__setting_content__;
        prop.content = this;
        UI.call(callback, null, this);
    };

	/**
	 * 设置节点内容
	 * @param elem 要设置内容的DOM或DOM在property中的属性名称
	 * @param content 内容，可以是html字符串，DOM节点，组件对象，组件构造参数，url，函数
     *  Component,
     *  {
     *      cmp: String,
     *      options: Object,
     *      callback: Handler
     *  },
     *  String, url/html 带http(s)://开头的认为是url,否则当作html解析
     *  Element
	 * @param property 要保存内容的对象
	 * @param context content为Function时的context
	 */
    function content(elem, content, property, context) {
        if (!content) return false;
        if ((property = property || {}).__setting_content__) return;
        if (UI.isString(elem)) {
            if (!(elem = property[elem]) || elem.nodeType !== 1) return;
        }
        if (content instanceof Comment) {
            elem.appendChild((property.content = content).elem());
        } else if (UI.isString(content)) {
            if (g_reg_url.test(content)) {
                var ifm = property.content;
                if (!(ifm && ifm.nodeType === 1 && ifm.nodeName.toLowerCase() === 'iframe')) {
                    UI.clearNode(elem);
                    ifm = UI.getDocument(elem).createElement('iframe');
                    ifm.style.cssText += '; width: 100%; height: 100%; border: none;';
                    ifm.setAttribute('frameborder', '0', 0);
                    ifm.setAttribute('marginheight', '0', 0);
                    ifm.setAttribute('marginwidth', '0', 0);
                    elem.appendChild(property.content = ifm);
                }
                ifm.setAttribute('src', content);
            } else {
                UI.html(elem, property.content = content, true);
            }
        } else if (content.nodeType === 1) {
            UI.clearNode(elem);
            elem.appendChild(property.content = content);
        } else {
            var cmp = content.cmp;
            if (UI.isString(cmp)) {
                UI.clearNode(elem);
                property.__setting_content__ = true;
                getCmp(cmp, UI.extend({}, content.options, { pelem: elem }), {
                    handler: _create_cmp_content_,
                    args: [property, content.callback]
                });
            } else {
                property.content = UI.call(content, context, elem, property);
            }
        }
    }

    UI.extend(UI, {
        content: content,

        defineCmp: defineCmp,
        getCmp: getCmp,
        disCmp: disCmp,
        queryCmp: queryCmp
    });
})(EUI);