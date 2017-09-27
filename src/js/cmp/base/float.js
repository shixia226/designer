EUI.defineCmp('float', function (Component, UI) {
    'use strict';

    function Float(options) {
        Float.Super.call(this, options);
        this.elem().style.position = 'absolute';
        this.hide();
    }

    function _filter_position_ancestor_(node) {
        if (node.tagName.toLowerCase() === 'body') return true;
        var pos = UI.css(node, 'position');
        return pos === 'relative' || pos === 'absolute';
    }

    UI.inherit(Float, Component, {
        EVT_ON_SHOW: 'EVT_ON_SHOW',
        EVT_ON_HIDE: 'EVT_ON_HIDE',

        visible: function () {
            return this._property.visible;
        },
        showAt: function (dom) {
            if (!dom) return;
            var x = dom.pageX, y = null, left = null, top = null;
            if (isNaN(x)) {
                var rect = UI.getRect(dom);
                if (arguments[1] === true) {//横向，在右边或左边显示
                    x = rect.right;
                    left = rect.left;
                    y = rect.top;
                    top = rect.bottom;
                } else {//纵向，在下边或上边显示
                    x = rect.left;
                    left = rect.right;
                    y = rect.bottom;
                    top = rect.top;
                }
            } else {
                y = dom.pageY;
                left = dom.left;
                top = dom.top;
            }
            this.show(x, y, left, top);
        },
        show: function (x, y, right, bottom) {
            if (this.emit(this.EVT_ON_SHOW) === false) return false;
            var container = this.elem(), pnode = UI.browseParent(container.parentNode, _filter_position_ancestor_);
            if (right === false) {
                if (isNaN(x)) return UI.error('浮动位置横坐标参数有误.');
            } else {
                var scrollLeft = pnode.scrollLeft;
                if (x === 'left') {//水平居左
                    x = scrollLeft + 1;
                } else {
                    var width = container.offsetWidth, pwidth = pnode.clientWidth;
                    if (x === 'right') {//水平居右
                        x = scrollLeft + pwidth - width - 1;
                    } else if (x == null || x === 'center' || isNaN(x = parseFloat(x, 10))) {//水平居中
                        x = scrollLeft + (pwidth - width) / 2;
                    } else {//指定水平坐标
                        var maxX = scrollLeft + pwidth - width - 1;
                        if (x > maxX) {
                            if (!isNaN(right = parseFloat(right, 10))) maxX = Math.min(maxX, right - width - 1);
                            x = Math.max(scrollLeft, maxX);
                        }
                    }
                }
            }
            if (bottom === false) {
                if (isNaN(y)) return UI.error('浮动位置纵坐标参数有误.');
            } else {
                var scrollTop = pnode.scrollTop;
                if (y === 'top') {//竖直居上
                    y = scrollTop + 1;
                } else {
                    var height = container.offsetHeight, pheight = pnode.clientHeight;
                    if (y === 'bottom') {//竖直居下
                        y = scrollTop + pheight - height - 1;
                    } else if (y == null || y === 'middle' || isNaN(y = parseFloat(y, 10))) {//竖直居中
                        y = scrollTop + (pheight - height) / 2;
                    } else {//指定竖直坐标
                        var maxY = scrollTop + pheight - height - 1;
                        if (y > maxY) {
                            if (!isNaN(bottom = parseFloat(bottom, 10))) maxY = Math.min(maxY, bottom - height - 1);
                            y = Math.max(scrollTop, maxY);
                        }
                    }
                }
            }
            container.style.cssText += '; left: ' + x + 'px; top: ' + y + 'px;';
            if (this._property.visible) {
                UI.downZindex(container);
            } else {
                this._property.visible = true;
            }
            UI.upZindex(container);
            this.emit(this.EVT_ON_SHOW, x, y);
        },
        hide: function () {
            var property = this._property;
            if (property.visible === false) return false;
            var container = this.elem();
            container.style.cssText += '; left: -99999px; top: -99999px;';
            property.visible = false;
            UI.downZindex(container);
            this.emit(this.EVT_ON_HIDE);
        }
    });

    return Float;
});