/**
 * 具有宽高的组件基类。
 * 
 * 构造参数配置项: {
 *      width: Number/Percent/'auto', //宽度
 *      height: Number/Percent/'auto', //高度
 *      resizewidth: Element/Handler(width, owidth) //缺省设置容器宽度，也可以传入其他元素或传入方法进行自定义设置
 *      resizeheight: Element/Handler(height, oheight) //类resizewidth
 *  }
 * 
 * 公共方法：
 *  width: Function(width), //无参数时为获取宽度，否则为设置宽度
 *  height: Function(height), //类width
 */
EUI.defineCmp('size', function (Component, UI) {
    'use strict';

    function Size(options) {
        Size.Super.call(this, options);
        if (options) {
            var property = this._property;
            property.resizewidth = options.resizewidth || false;
            property.resizeheight = options.resizeheight || false;
            this.width(options.width);
            this.height(options.height);
        }
    }

    var _setWH = function (name, wh, ckwh, dom) {
        if (wh === false || wh === '' || wh === 'auto') {
            wh = '';
        } else if (UI.isString(wh)) {
            var _wh = parseInt(wh, 10);
            wh = _wh > 0 ? (_wh + (UI.endWith(wh, '%') ? '%' : 'px')) : '100%';
        } else if (UI.isNumber(wh)) {
            wh = wh > 0 ? (wh + 'px') : '100%';
        } else {
            wh = '100%';
        }
        if (ckwh !== wh) {
            if (dom.nodeType === 1) {
                dom.style[name] = wh;
            } else {
                var rt = UI.call(dom, this, wh, ckwh);
                return rt === false ? ckwh : rt != null ? rt : wh;
            }
        }
        return wh;
    };

    UI.inherit(Size, Component, {
        EVT_ON_WIDTH_CHANGE: 'EVT_ON_WIDTH_CHANGE',
        EVT_ON_HEIGHT_CHANGE: 'EVT_ON_HEIGHT_CHANGE',

        width: function (width) {
            if (arguments.length === 0) {
                return this._property.width;
            }
            var property = this._property, owidth = property.width;
            width = _setWH.call(this, 'width', width, owidth, property.resizewidth || property.container);
            if (owidth === width) return false;
            property.width = width;
            this.emit(this.EVT_ON_WIDTH_CHANGE, width, owidth);
        },
        height: function (height) {
            if (arguments.length === 0) {
                return this._property.height;
            }
            var property = this._property, oheight = property.height;
            height = _setWH.call(this, 'height', height, oheight, property.resizeheight || property.container);
            if (oheight === height) return false;
            property.height = height;
            this.emit(this.EVT_ON_HEIGHT_CHANGE, height, oheight);
        }
    });

    return Size;
});