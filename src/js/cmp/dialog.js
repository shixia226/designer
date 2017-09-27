EUI.defineCmp('dialog', ['panel', 'float', 'button'], function (Panel, Float, Button, UI) {
    'use strict';

    var g_config = {
        width: false,
        height: 200,
        cls_container: 'ui-dialog',
        cls_header: 'ui-dialog-header',
        cls_content: 'ui-dialog-content',
        cls_icon: 'ui-icon ui-dialog-icon',
        cls_caption: 'ui-dialog-caption',
        cls_btns: 'ui-dialog-btns',
        cls_btn: 'ui-icon ui-dialog-btn',
        cls_actbtn: 'ui-dialog-btn-hover',

        miniBtnsConfig: {
            close: {
                cls: 'font-icon-close',
                hint: UI.i18n('close', '关闭'),
                handler: 'hide'
            },
            max: {
                cls: 'font-icon-max',
                handler: function () {
                    var restoresize = this.property('restoresize'), container = this.elem();
                    if (restoresize) {
                        UI.removeClass(this, 'ui-dialog-btn-restore');
                        UI.addClass(this, 'ui-dialog-btn-max');
                        this.property('restoresize', null);
                        this.width(restoresize.width);
                        this.height(restoresize.height);
                        container.style.cssText += '; left: ' + restoresize.left + '; top: ' + restoresize.top + ';';
                    } else {
                        UI.removeClass(this, 'ui-dialog-btn-max');
                        UI.addClass(this, 'ui-dialog-btn-restore');
                        this.property('restoresize', {
                            left: UI.css(container, 'left'),
                            top: UI.css(container, 'top'),
                            width: this.width(),
                            height: this.height()
                        });
                        this.width('100%');
                        this.height('100%');
                        container.style.cssText += '; left: 0px; top: 0px;';
                    }
                }
            }
        }
    };


    var g_buttons = {
        ok: {
            text: UI.i18n('ok', '确定'),
        },
        cancel: {
            text: UI.i18n('cancel', '取消'),
        }
    };
    function _handler_ok(onclick, dlg) {
        if (UI.call(onclick, dlg) !== false) dlg.hide();
    }
    function createBtn(dlg, pelem, options) {
        var onclick;
        if (UI.isFunction(options)) {
            onclick = options;
            options = g_buttons.ok;
        } else if (UI.isString(options)) {
            options = g_buttons[options];
        }
        options = options || g_buttons.cancel;
        return new Button({
            pelem: pelem,
            text: options.text,
            icon: options.icon,
            onclick: {
                handler: _handler_ok,
                args: [onclick || options.onclick, dlg]
            }
        });
    }
    function initBtns(dlg, pelem, btns, buttons) {
        if (UI.isArray(btns)) {
            var len = btns.length;
            if (len > 0) {
                pelem = pelem.appendChild(dlg.doc.createElement('div'));
                pelem.className = 'ui-dialog-btns';
                for (var i = 0; i < len; i++) {
                    buttons.push(createBtn(dlg, pelem, btns[i]));
                }
            }
        } else {
            pelem = pelem.appendChild(dlg.doc.createElement('div'));
            pelem.className = 'ui-dialog-btns';
            buttons.push(createBtn(dlg, pelem, btns));
        }
    }
    function ondragbefore(evt) {
        return !UI.hasClass(evt.target, 'ui-icon');
    }

    /**
     * 对话框
     * @param options
     *  {
     *    caption: String,
     *    icon: String,
     *    miniBtns: [ String / {
     *      cls: String / Function(),
     *      hint: String,
     *      handler: Function()
     *    } ],
     *    btns : [ { ... 见 Button 构造方法 ... } ]
     *  }
     * @constructor
     */
    function Dialog(options) {
        options = UI.extend(true, false, options, g_config);
        Dialog.Super.call(this, options);
        var property = this._property;
        if (!property.btns) {
            var tail = property.container.appendChild(this.doc.createElement('div'));
            tail.className = 'ui-dialog-tail';
            UI.call(options.initTail, this, tail);
            initBtns(this, tail, options.btns, property.btns = []);
        }
        UI.draggable(property.captionDom.parentNode, { helper: "parent", ondragbefore: ondragbefore });
    }

    UI.inherit(Dialog, Panel, {
        dispose: function () {
            var property = this._property, btns = property.btns;
            for (var i = 0, len = btns.length; i < len; i++) {
                btns[i].dispose();
            }
            UI.draggable(property.captionDom.parentNode);
            Dialog.Super.prototype.dispose.call(this);
        },
        visible: Float.prototype.visible,
        show: function (modal) {
            if (this.visible()) this.hide();
            if (modal === true) {
                UI.shadow(true, { doc: this.doc, id: 'dialog.' + this._property.cmpid, css: 'ui-shadow' });
            }
            return Float.prototype.show.call(this);
        },
        hide: function () {
            UI.shadow(false, 'dialog.' + this._property.cmpid);
            return Float.prototype.hide.call(this);
        }
    });

    return Dialog;
});