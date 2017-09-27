(function (UI) {
    'use strict';

    var SIZE = 5,
        fixifmidxs = [],
        _fixIframe = function (dom) {
            var doc = UI.getDocument(dom), ifms = doc.getElementsByTagName('iframe');
            if (ifms) {
                for (var i = 0, len = ifms.length; i < len; i++) {
                    fixifmidxs.push(UI.shadow(true, { doc: doc, elem: ifms[i], pelem: dom }));
                }
            }
        },
        _recoverIframe = function () {
            for (var i = 0, len = fixifmidxs.length; i < len; i++) {
                UI.shadow(false, fixifmidxs[i]);
            }
            fixifmidxs.length = 0;
        },
        _evt_on_mousemove_drag_ = function (evt) {
            var data = evt.data, ui = data.ui, appendTo = data.appendTo, boundary = data.boundary, x = -1, y = -1, cssText = '';
            if (data.horizon) {
                x = appendTo.scrollLeft + evt.pageX + data.x;
                cssText += '; left: ' + (ui.x = x < boundary ? boundary : Math.min(data.maxX, x)) + 'px;';
            }
            if (data.vertical) {
                y = appendTo.scrollTop + evt.pageY + data.y;
                cssText += '; top: ' + (ui.y = y < boundary ? boundary : Math.min(data.maxY, y)) + 'px;';
            }
            UI.call(data.ondrag, this, x, y, evt);
            data.helper.style.cssText += cssText;
        },
        _evt_on_mouseup_drag_ = function (evt) {
            var data = evt.data, ui = data.ui, helper = ui.helper;
            if (null != data.css_cursor) helper.style.cursor = data.css_cursor;
            var orihp = data.orihp;
            if (orihp) {
                if (orihp === true) {
                    helper.parentNode.removeChild(helper);
                } else {
                    var rect = UI.getRect(helper), prect = UI.getRect(orihp);
                    helper.style.cssText += (data.horizon ? '; left: ' + (rect.left - prect.left + orihp.scrollLeft) + 'px;' : '') +
                        (data.vertical ? ' top: ' + (rect.top - prect.top + orihp.scrollTop) + 'px;' : '');
                    orihp.appendChild(helper);
                }
                data.orihp = false;
            }
            if (data.iframeFix) _recoverIframe();
            UI.call(data.ondragend, this, evt, ui);
            data.drag_mousedown = false;
            data.drag_mousemove = false;
            UI.unbind(this, '.draggable');
        },
        _evt_on_mouseleave_drag_ = function (evt) {
            if (UI.call(evt.data.ondragcancel, this, evt) === false) {
                _evt_on_mouseup_drag_.call(this, evt);
            }
        },
        _evt_on_mousemove_ = function (evt) {
            var data = evt.data;
            if (!data.drag_mousedown) {
                UI.call(data.onmousemove, this, evt);
                return;
            }
            if (data.drag_mousemove) return;//正在拖拽
            var distance = data.distance, horizon = data.horizon, vertical = data.vertical,
                pageX = evt.pageX, pageY = evt.pageY, px = data.pageX, py = data.pageY;
            if ((horizon && Math.abs(pageX - px) >= distance) || (vertical && Math.abs(pageY - py) >= distance)) {
                data.drag_mousemove = true;
                var helper = data.helper, posdom = null, cursorAt = data.cursorAt, appendTo = data.appendTo;
                if (UI.isString(helper)) {
                    if (helper === 'clone') {
                        posdom = this;
                        helper = this.cloneNode(true);
                    } else if (helper === 'parent') {
                        posdom = helper = this.parentNode;
                    }
                } else {
                    helper = UI.call(helper, this, evt);
                    if (UI.isArray(helper)) {
                        posdom = helper[1];
                        helper = helper[0];
                    } else if (helper.parentNode) {
                        posdom = helper;
                    } else {
                        data.orihp = true;
                        appendTo.appendChild(posdom = helper);
                    }
                }
                if (!helper) posdom = helper = this;
                var x = null, y = null, prect = UI.getRect(appendTo), rect = UI.getRect(posdom), cssText = '';
                if (horizon) {
                    var left = null;
                    if (cursorAt) {
                        var _left = parseFloat(cursorAt.left, 10);
                        if (isNaN(_left)) {
                            var _right = parseFloat(cursorAt.right, 10);
                            if (!isNaN(_right)) {
                                left = pageX + _right - (rect.width || (rect.right - rect.left));
                            } else {
                                left = rect.left;
                            }
                        } else {
                            left = pageX - _left;
                        }
                    } else {
                        left = rect.left;
                    }
                    x = (left = left - prect.left - UI.borderSize(appendTo, 3)) - pageX;
                    cssText += '; left: ' + (left = left + appendTo.scrollLeft) + 'px;';
                }
                if (vertical) {
                    var top = null;
                    if (cursorAt) {
                        var _top = parseFloat(cursorAt.top, 10);
                        if (isNaN(_top)) {
                            var _bottom = parseFloat(cursorAt.bottom, 10);
                            if (!isNaN(_bottom)) {
                                top = pageY + _bottom - (rect.height || (rect.bottom - rect.top));
                            } else {
                                top = rect.top;
                            }
                        } else {
                            top = top - _top;
                        }
                    } else {
                        top = rect.top;
                    }
                    y = (top = top - prect.top - UI.borderSize(appendTo, 0)) - pageY;
                    cssText += '; top: ' + (top = top + appendTo.scrollTop) + 'px;';
                }
                var orihp = helper.parentNode;
                if (orihp !== appendTo) {
                    data.orihp = orihp || true;
                    appendTo.appendChild(helper);
                }
                if (UI.css(helper, 'position') !== 'absolute') helper.style.position = 'absolute';
                helper.style.cssText += cssText;
                var cursor = data.cursor;
                if (cursor) {
                    data.css_cursor = helper.style.cursor;
                    helper.style.cursor = cursor;
                }
                var ui = data.ui = {
                    dom: this,
                    helper: helper,
                    pageX: px,
                    pageY: py,
                    ox: left,
                    oy: top,
                    x: left,
                    y: top
                };
                if (data.iframeFix) _fixIframe(appendTo);
                UI.call(data.ondragstart, this, evt);
                var boundary = data.boundary;
                UI.bind(appendTo, [{
                    type: 'mousemove.draggable',
                    data: {
                        ui: ui,
                        helper: helper,
                        ondrag: data.ondrag,
                        appendTo: appendTo,
                        horizon: horizon,
                        vertical: vertical,
                        boundary: boundary,
                        maxX: Math.max(boundary, (appendTo.scrollWidth || appendTo.clientWidth) - helper.offsetWidth - boundary),
                        maxY: Math.max(boundary, (appendTo.scrollHeight || appendTo.clientHeight) - helper.offsetHeight - boundary),
                        x: x,
                        y: y
                    },
                    handler: _evt_on_mousemove_drag_
                }, {
                    type: 'mouseup.draggable',
                    data: data,
                    handler: _evt_on_mouseup_drag_
                }, {
                    type: 'mouseleave.draggable',
                    data: data,
                    handler: _evt_on_mouseleave_drag_
                }]);
            }
        },
        _evt_on_mousedown_ = function (evt) {
            var data = evt.data;
            var handle = data.handle;
            if (handle && !UI.isAncestor(handle, evt.target, true)) return;
            if (UI.call(data.ondragbefore, this, evt) === false) return;
            data.drag_mousedown = true;
            data.pageX = evt.pageX;
            data.pageY = evt.pageY;
            if (data.distance === 0) _evt_on_mousemove_.call(this, evt);
            evt.preventDefault(); //阻止鼠标默认行为，阻止浏览器的选中功能
        },
        _evt_on_mouseup_ = function (evt) {
            var data = evt.data;
            if (data.drag_mousemove) {
                data.drag_mousemove = false;
            } else {
                UI.call(data.onmouseup, this, evt);
            }
            data.drag_mousedown = false;
        };

    UI.extend(UI, {
        /**
         * 注册/注销 拖拽事件
         * @param dom 要注册或注销拖拽事件的DOM元素
         * @param options 可选配置参数
         *  {
         *    appendTo : DOM 拖拽区域DOM，缺省为body
         *    handle : DOM 可拖拽的DOM，该节点为dom中的一个子节点，表示鼠标点击该节点位置才允许拖拽，缺省为dom
         *    cursor : String 拖拽时鼠标样式cursor
         *    cursorAt : [Number, Number] 拖拽时鼠标在节点中的位置，缺省为鼠标点击位置
         *    distance : Number 触发鼠标拖拽必要的最小拖动距离
         *    boundary : Number 鼠标拖动过程中距离边界最小距离
         *    direction : Boolean 拖拽方向，默认水平竖直均可以
         *    helper : String/Function 指定拖拽辅助DOM节点， Stirng有'parent/clone/self'三种取值，缺省为self
         *    iframeFix : Boolean 是否遮住iframe节点
         *    ondragbefore : Function(evt) 拖拽前回调函数，返回false将阻止该次拖拽行为
         *    onmousemove : Function(evt) 不满足拖拽条件时(ondragbefore返回false)鼠标移动回调函数
         *    onmouseup : Function(evt) 不满足拖拽条件时(ondragbefore返回false)鼠标松开或离开回调函数
         *    ondragstart : Function(evt) 拖拽起始回调函数，返回DOM将用于拖拽时候调整位置DOM，不传取dom
         *    ondrag : Function(x, y, evt) 拖拽过程中回调函数
         *    ondragcancel : Function(evt) 拖拽越界回调函数，返回false时将结束该次拖拽
         *    ondragend : Function(evt, ui) 拖拽结束回调函数
         *  }
         */
        draggable: function (dom, options) {
            if (!dom) return;
            if (!options) {
                UI.unbind(dom, '.draggable');
            } else {
                var appendTo = options.appendTo, handle = options.handle;
                if (appendTo === 'parent') {
                    appendTo = dom.parentNode;
                } else if (!appendTo || appendTo.nodeType !== 1) {
                    appendTo = UI.getDocument(dom).body;
                }
                if (!handle || handle.nodeType !== 1) handle = false;
                var distance = parseInt(options.distance, 10), boundary = parseInt(options.boundary, 10);
                var horizon = true, vertical = true, direction = options.direction;
                if (direction === 'h') {
                    vertical = false;
                } else if (direction === 'v') {
                    horizon = false;
                }
                var data = {
                    appendTo: appendTo,
                    cursor: options.cursor || '',
                    cursorAt: options.cursorAt,
                    horizon: horizon,
                    vertical: vertical,
                    boundary: isNaN(boundary) || boundary < 0 ? SIZE : boundary,
                    distance: isNaN(distance) || distance < 0 ? SIZE : distance,
                    handle: handle,
                    helper: options.helper,
                    iframeFix: options.iframeFix === true,
                    ondragbefore: options.ondragbefore,
                    onmousemove: options.onmousemove,
                    onmouseup: options.onmouseup,
                    ondragstart: options.ondragstart,
                    ondrag: options.ondrag,
                    ondragend: options.ondragend,
                    ondragcancel: options.ondragcancel
                };
                UI.bind(dom, [{
                    type: 'mousedown.draggable',
                    data: data,
                    handler: _evt_on_mousedown_
                }, {
                    type: 'mousemove.draggable',
                    data: data,
                    handler: _evt_on_mousemove_
                }, {
                    type: 'mouseup.draggable mouseleave.draggable',
                    data: data,
                    handler: _evt_on_mouseup_
                }]);
            }
        }
    });
})(EUI);