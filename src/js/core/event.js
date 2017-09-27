(function (UI) {
    'use strict';

    //重载的事件对象单例
    var event4eui = {
        preventDefault: function () {
            var evt = this.originalEvent;
            if (!evt) return;
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        },
        stopPropagation: function () {
            var evt = this.originalEvent;
            if (!evt) return;
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                evt.cancelBubble = true;
            }
        }
    };

    //跨浏览器执行绑定事件的功能
    var addEvent = null, removeEvent = null;
    if (document.addEventListener) {
        addEvent = function (node, type, handler) {
            node.addEventListener(type, handler, false);
        };
        removeEvent = function (node, type, handler) {
            node.removeEventListener(type, handler, false);
        };
    } else {
        addEvent = function (node, type, handler) {
            node.attachEvent('on' + type, handler);
        };
        removeEvent = function (node, type, handler) {
            node.detachEvent('on' + type, handler);
        };
    }

    var r_keyEvent = /^key/,
        r_mouseEvent = /^(?:mouse|contextmenu)|click/,
        r_notwhite = /\S+/g,
        r_typenamespace = /^([^.]*)(?:\.(.+)|)$/,

        fix = {
            keyHooks: {
                props: ['altKey', 'ctrlKey', 'shiftKey', 'metaKey', 'keyCode', 'charCode'],
                filter: function (evt, original) {
                    if (!evt.charCode) evt.charCode = original.keyCode;
                }
            },
            mouseHooks: {
                props: ['pageX', 'pageY', 'which', 'target', 'relatedTarget', 'wheel', 'altKey', 'ctrlKey', 'shiftKey', 'metaKey'],
                filter: function (evt, original) {
                    var target = evt.target;
                    if (!target) target = evt.target = original.srcElement || document;
                    if (target.nodeType === 3) target = target.parentNode;
                    evt.metaKey = !!evt.metaKey;
                    if (evt.pageX == null && original.clientX != null) {
                        var evtDoc = UI.getDocument(target), doc = evtDoc.documentElement, body = evtDoc.body,
                            scrollLeft = false, scrollTop = false, clientLeft = false, clientTop = false;
                        if (doc) {
                            scrollLeft = doc.scrollLeft;
                            scrollTop = doc.scrollTop;
                            clientLeft = doc.clientLeft;
                            clientTop = doc.clientTop;
                        }
                        if (body) {
                            if (!scrollLeft) scrollLeft = doc.scrollLeft;
                            if (!scrollTop) scrollTop = doc.scrollTop;
                            if (!clientLeft) clientLeft = doc.clientLeft;
                            if (!clientTop) clientTop = doc.clientTop;
                        }
                        evt.pageX = original.clientX + (scrollLeft || 0) - (clientLeft || 0);
                        evt.pageY = original.clientY + (scrollTop || 0) - (clientTop || 0);
                    }
                    if (!evt.relatedTarget) {
                        var fromElement = original.fromElement;
                        evt.relatedTarget = fromElement === target ? original.toElement : fromElement;
                    }
                    if (!evt.which) {
                        var button = original.button;
                        evt.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
                    }
                    if (evt.which === 1 && evt.ctrlKey) evt.which = 3;
                }
            }
        },

        //扩展事件
        handler_enter_leave = function (evt, handler) {
            var relatedTarget = evt.relatedTarget;
            if (!relatedTarget || !UI.isAncestor(this, relatedTarget, true)) {
                return handler.call(this, evt);
            }
        },
        special = {
            mouseenter: {
                type: 'mouseover',
                handler: handler_enter_leave
            },
            mouseleave: {
                type: 'mouseout',
                handler: handler_enter_leave
            },
            mousewheel: UI.isFirefox ? {
                type: 'DOMMouseScroll',
                handler: function (evt, handler) {
                    evt.wheel = evt.originalEvent.detail / 3;
                    return handler.call(this, evt);
                }
            } : {
                    type: 'mousewheel',
                    handler: function (evt, handler) {
                        evt.wheel = -evt.originalEvent.wheelDelta / 120;
                        return handler.call(this, evt);
                    }
                },
            resize: {
                type: 'resize',
                handler: function (evt, handler, data) {
                    var width = this.offsetWidth, height = this.offsetHeight;
                    if (width !== data.width || height !== data.height) {
                        handler.call(this, data.width = width, data.height = height, evt);
                    }
                },
                setup: function (handler, data) {
                    UI.timeout(handler, { args: { type: 'resize' }, once: false });
                    data.width = this.offsetWidth;
                    data.height = this.offsetHeight;
                    return false;
                }
            }
        },

        //所有注册的事件列表
        handlers = {},
        dommaps = {},//所有注册过事件的DOM都会以一个随机ID缓存在该对象上，通过查找DOM匹配的ID可以在handlers中确定对应的注册过的事件
        mapnum = 0,//dommaps的自增ID

        /**
         * 获取DOM对应的事件数据对象
         * @param dom
         * 返回值格式如下：
         * {
         *    elem : DOM,
         *    handler : Function,
         *    events : {
         *      click: [
         *       type : String, [click|mousedown]
         *        namespace : String,
         *       data : Object,
         *       handler : Function
         *      ], [...]
         *    },
         *    mousemove : [...]
         * }
         */
        getEvtData = function (dom) {
            for (var i in dommaps) {
                if (dommaps[i] === dom) return handlers[i];
            }
            dommaps[++mapnum] = dom;
            return (handlers[mapnum] = { elem: dom });
        },
        //格式化事件单例对象
        formatEvent = function (evt, wnd) {
            if (evt === event4eui) return evt;
            if (!evt) {
                if (!(evt = (wnd || window.event))) {
                    UI.empty(event4eui, fix.mouseHooks);
                    UI.empty(event4eui, fix.keyHooks);
                    return event4eui;
                }
            }
            var type = event4eui.type = evt.type, hooks = null;
            if (r_mouseEvent.test(type)) {
                UI.empty(event4eui, fix.keyHooks);
                hooks = fix.mouseHooks;
            } else if (r_keyEvent.test(type)) {
                UI.empty(event4eui, fix.mouseHooks);
                hooks = fix.keyHooks;
            } else {
                UI.empty(event4eui, fix.mouseHooks);
                UI.empty(event4eui, fix.keyHooks);
            }
            event4eui.originalEvent = evt;
            if (hooks) {
                var props = hooks.props, filter = hooks.filter, name = null;
                for (var i = 0, len = props.length; i < len; i++) {
                    name = props[i];
                    event4eui[name] = evt[name];
                }
                filter(event4eui, evt);
            }
        },
        /**
         * 绑定的DOM事件的原型，默认的任何类型的DOM事件都会执行该方法，只是每次调用该方法的scope不一样
         * @param evt
         */
        eventHandler = function (evt) {
            var elem = this.elem;
            formatEvent(evt, UI.getWindow(elem));
            var type = event4eui.type, handlers = this.events[type].concat(), len = handlers.length,
                handlerObj = null, specialHandler = null, rt = null;
            for (var i = 0; i < len; i++) {
                handlerObj = handlers[i];
                event4eui.data = handlerObj.data;
                event4eui.namespace = handlerObj.namespace;
                event4eui.type = handlerObj.type;
                if ((specialHandler = handlerObj.specialHandler)) {
                    rt = UI.call(specialHandler, elem, event4eui, handlerObj.handler, this);
                } else {
                    rt = UI.call(handlerObj.handler, elem, event4eui);
                }
                if (handlerObj.once) {
                    handlers.splice(i--, 1);
                    len--;
                }
            }
            if (rt === false) {
                event4eui.preventDefault();
                event4eui.stopPropagation();
            } else if (type === 'contextmenu') {
                event4eui.preventDefault();
            }
            if (!len) {
                removeEvent(elem, type, this.handler);
                delete this.events[type];
            }
        },
        /**
         * 真正执行绑定事件的方法
         * @param dom
         * @param type
         * @param handler
         * @param data
         * @param once
         * @param evtData
         */
        doBindEvent = function (dom, type, handler, data, once, evtData) {
            var types = type.match(r_notwhite), evtHandler = evtData.handler, events = evtData.events, bindType = null,
                tmp = null, namespace = null, eventArray = null, typespecial = null, specialHandler = null;
            if (!events) events = evtData.events = {};
            if (!evtHandler) evtHandler = evtData.handler = eventHandler.bind(evtData);
            for (var i = 0, len = types.length; i < len; i++) {
                tmp = r_typenamespace.exec(types[i]);
                if (!(type = tmp[1])) continue;
                namespace = (tmp[2] || '').split('.').sort().join('.');
                typespecial = special[type];
                if (typespecial) {
                    bindType = typespecial.type;
                    specialHandler = typespecial.handler;
                } else {
                    bindType = type;
                    specialHandler = null;
                }
                eventArray = events[bindType];
                if (!eventArray) {
                    eventArray = events[bindType] = [];
                    if (!typespecial || !typespecial.setup || (typespecial.setup.call(dom, evtHandler, evtData) !== false)) {
                        addEvent(dom, bindType, evtHandler);
                    }
                }
                eventArray.push({
                    type: type,
                    namespace: namespace,
                    specialHandler: specialHandler,
                    handler: handler,
                    data: data,
                    once: once === true
                });
            }
        },
        /**
         * 真正执行解绑事件的方法
         * @param event
         * @param namespace
         * @param type
         * @returns {*}
         */
        doUnbindEvent = function (events, namespace, type) {
            var handlerObj = null;
            for (var i = events.length - 1; i >= 0; i--) {
                handlerObj = events[i];
                if ((!type || type === handlerObj.type) && (!namespace || namespace === handlerObj.namespace)) {
                    events.splice(i, 1);
                }
            }
            return events.length;
        },

        ///### 页面加载完成注册函数
        initReady = function (wnd) {
            var readyList = [];
            var add = function (handler) {
                if (!handler) return;
                if (UI.isArray(handler)) {
                    for (var i = 0, len = handler.length; i < len; i++) {
                        add(handler[i]);
                    }
                } else if (!readyList) {
                    UI.call(handler, wnd);
                } else {
                    readyList.push(handler);
                }
            };

            return {
                add: add,
                fire: function () {
                    if (!readyList) return false;
                    var obj = null;
                    while ((obj = readyList.shift())) {
                        UI.call(obj, wnd);
                    }
                    readyList = false;
                }
            };
        },
        checkReady = function (top, oncomplete) {
            try {
                top.doScroll('left');
            } catch (e) {
                return;
            }
            oncomplete();
            return false;
        },
        complete = function () {
            var data = getEvtData(this), oncomplete = data.oncomplete;
            if (data.ready.fire() !== false) {
                removeEvent(this, 'load', oncomplete);
                removeEvent(this.document, data.onreadyname, oncomplete);
            }
        },
        beforeunload = function () {
            var data = getEvtData(this), list = data.list, onbeforeunload = data.onbeforeunload, rt = '';
            if (UI.isFunction(onbeforeunload)) rt = onbeforeunload() || '';
            for (var i = 0, len = list.length; i < len; i++) {
                try {
                    var obj = list[i];
                    if (obj.dispose) {
                        obj.dispose();
                    } else {
                        rt += (UI.call(obj, this) || '');
                    }
                } catch (e) {
                }
            }
            list.length = 0;
            if (rt) return rt;
        };

    ///###事件管理类
    UI.extend(UI, {
        /**
         * 绑定DOM事件
         * @param dom
         * @param type
         * @param data
         * @param handler
         * @param once
         * @returns {*}
         */
        bind: function (dom, type, data, handler, once) {
            if (dom) {
                var evtData = getEvtData(dom);
                if (UI.isArray(type)) {
                    for (var i = 0, len = type.length; i < len; i++) {
                        var evtObj = type[i];
                        doBindEvent(dom, evtObj.type, evtObj.handler, evtObj.data, evtObj.once, evtData);
                    }
                } else if (UI.isObject(type)) {
                    doBindEvent(dom, type.type, type.handler, type.data || data, type.once, evtData);
                } else if (UI.isString(type)) {
                    if (UI.isFunction(data)) {
                        once = handler;
                        handler = data;
                        data = null;
                    }
                    doBindEvent(dom, type, handler, data, once, evtData);
                }
            }
            return this;
        },
        /**
         * 解绑DOM事件
         * @param dom
         * @param type
         */
        unbind: function (dom, type) {
            if (dom) {
                var evtData = getEvtData(dom), handler = evtData.handler;
                if (!handler) return this;
                var events = evtData.events;
                if (UI.isString(type) && (type = type.trim())) {
                    var types = type.match(r_notwhite), tmp = null, namespace = null, evttype = null, typespecial = null, eventArray = null;
                    for (var i = 0, len = types.length; i < len; i++) {
                        tmp = r_typenamespace.exec(types[i]);
                        type = tmp[1];
                        namespace = (tmp[2] || '').split('.').sort().join('.');
                        if (type) {
                            evttype = (typespecial = special[type]) ? typespecial.type : type;
                            if (!(eventArray = events[evttype])) continue;
                            if (doUnbindEvent(eventArray, namespace, type) === 0) {
                                removeEvent(dom, evttype, handler);
                                delete events[evttype];
                            }
                        } else {
                            for (var name in events) {
                                if (doUnbindEvent(events[name], namespace) === 0) {
                                    removeEvent(dom, name, handler);
                                    delete events[name];
                                }
                            }
                        }
                    }
                } else {
                    for (var evt in events) {
                        if (events.hasOwnProperty(name)) {
                            removeEvent(dom, evt, handler);
                        }
                    }
                }
            }
            return this;
        },
        ready: function (handler, wnd) {
            wnd = wnd || window;
            var doc = wnd.document, evtData = getEvtData(wnd), ready = evtData.ready;
            if (!ready) ready = evtData.ready = initReady(wnd);
            if (doc.readyState === 'complete') {
                ready.fire();
                ready.add(handler);
            } else {
                ready.add(handler);
                var oncomplete = evtData.oncomplete = complete.bind(wnd);
                addEvent(wnd, 'load', oncomplete);
                var evtname = null;
                if (doc.addEventListener) {
                    evtname = 'DOMContentLoaded';
                } else {
                    evtname = 'onreadystatechange';
                    var top = false;
                    try {
                        top = window.frameElement == null && document.documentElement;
                    } catch (e) {
                    }
                    if (top && top.doScroll) {
                        UI.timeout({
                            handler: checkReady,
                            args: [top, oncomplete],
                            once: false
                        });
                    }
                }
                addEvent(doc, evtData.onreadyname = evtname, oncomplete);
            }
        },
        unload: function (obj, wnd) {
            var data = getEvtData(wnd = wnd || window), list = data.list;
            if (!list) {
                data.onbeforeunload = wnd.onbeforeunload;
                list = data.list = [obj];
                wnd.onbeforeunload = beforeunload;
            } else {
                list.push(obj);
            }
        }
    });

})(EUI);