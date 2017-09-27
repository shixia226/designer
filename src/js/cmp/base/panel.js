/**
 * 具有面板属性的组件基类.
 * 构造参数配置项: {
 *      icon: String, //左上角图标
 *      caption: String, //左上角标题
 *      
 *  }
 */
EUI.defineCmp('panel', 'size', function (Size, UI) {
    'use strict';

    var CLS_EXPAND = 'ui-icon-arrow-up', CLS_COLLAPSE = 'ui-icon-arrow-down',
        _evt_on_mousemove = function (evt) {
            var property = evt.data._property, target = evt.target, activeminibtn = property._activeminibtn_;
            if (target.parentNode === this) {
                if (activeminibtn === target) return;
                var cls_minibtn_hover = property.cls_minibtn_hover;
                UI.removeClass(activeminibtn, cls_minibtn_hover);
                UI.addClass(property._activeminibtn_ = target, cls_minibtn_hover);
            } else if (activeminibtn) {
                UI.removeClass(activeminibtn, property.cls_minibtn_hover);
                property._activeminibtn_ = null;
            }
        },
        _evt_on_mouseleave = function (evt) {
            var property = evt.data._property, activeminibtn = property._activeminibtn_;
            if (activeminibtn) {
                UI.removeClass(activeminibtn, property.cls_minibtn_hover);
                property._activeminibtn_ = null;
            }
        },
        _evt_on_mouseup = function (evt) {
            var panel = evt.data, property = panel._property, activeminibtn = property._activeminibtn_;
            if (activeminibtn) {
                var miniBtns = property.miniBtns, btn = null;
                for (var i = 0, len = miniBtns.length; i < len; i++) {
                    if ((btn = miniBtns[i]).iconDom === activeminibtn) {
                        UI.call(btn, panel, activeminibtn);
                        _evt_on_mouseleave(evt);
                    }
                }
            }
        },
        findMiniBtn = function (name, property) {
            var btns = property.miniBtns;
            if (!btns) return;
            if (UI.isString(name)) {
                for (var i = 0, len = btns.length; i < len; i++) {
                    var btn = btns[i];
                    if (btn.name === name) return btn;
                }
            } else {
                return btns[name];
            }
        },
        initMiniBtns = function (elem, btns, doc, options) {
            if (btns) {
                var btnArray = [], miniBtns = options.miniBtnsConfig || {},
                    iconCls = options.cls_btn || 'ui-icon ui-panel-btn';
                for (var i = 0, len = btns.length; i < len; i++) {
                    var btn = btns[i];
                    if (UI.isString(btn)) {
                        if (!(btn = miniBtns[btn])) continue;
                    }
                    var btnDom = elem.appendChild(doc.createElement('span'));
                    btnDom.title = btn.hint || '';
                    btnDom.className = iconCls;
                    var cls = UI.call(btn.cls, this, btnDom, options) || btn.cls;
                    btnArray.push(UI.icon(btnDom, cls, {
                        iconDom: btnDom,
                        name: btn.name || cls || UI.random(),
                        handler: btn.handler,
                        args: btn.args,
                        context: btn.context
                    }));
                }
                if (btnArray.length) {
                    UI.bind(elem, [{
                        type: 'mousemove.panel',
                        data: this,
                        handler: _evt_on_mousemove
                    }, {
                        type: 'mouseup.panel',
                        data: this,
                        handler: _evt_on_mouseup
                    }, {
                        type: 'mouseleave.panel',
                        data: this,
                        handler: _evt_on_mouseleave
                    }]);
                    return btnArray;
                }
            }
            elem.style.display = 'none';
        },
        _reset_collapse_icon_ = function (expand, btn) {
            if (btn === this.KEY_ROLLBACK) {
                btn = expand[1];
                expand = !expand[0];
            }
            if (expand) {
                UI.replaceClass(btn, CLS_EXPAND, CLS_COLLAPSE);
            } else {
                UI.replaceClass(btn, CLS_COLLAPSE, CLS_EXPAND);
            }
        },
        _get_class_name = function (cls, defaultCls) {
            return UI.isString(cls) ? cls : UI.call(cls, this, defaultCls) || defaultCls;
        },
        g_config = {
            height: '100%',

            resizeheight: function(height) {
                var property = this._property;
                if (property.expand) {
                    property.container.style.height = height;
                }
            },

            miniBtnsConfig: {
                collapse: {
                    cls: function (btn, options) {
                        UI.namespace(true, 'handlers.' + this.EVT_ON_EXPAND_AFTER, options, { handler: _reset_collapse_icon_, args: btn });
                        return CLS_EXPAND;
                    },
                    handler: 'expand'
                }
            },

            onComponentInit: function (pelem, doc, options) {
                var container = pelem.appendChild(doc.createElement('div')), caption = (options.caption || '');
                container.className = _get_class_name(options.cls_container, 'ui-panel');
                container.innerHTML = '<div class="' + _get_class_name(options.cls_header, 'ui-panel-header') + '">' +
                    '<i style="display: none" class="ui-icon ' + _get_class_name(options.cls_icon, 'ui-panel-icon') + '"></i>' +
                    '<span class="' + _get_class_name(options.cls_caption, 'ui-panel-caption') + '">' + caption + '</span>' +
                    '<div class="' + _get_class_name(options.cls_btns, 'ui-panel-btns') + '"></div>' +
                    '</div>' +
                    '<div class="' + _get_class_name(options.cls_content, 'ui-panel-content') + '"></div>';
                var header = container.firstChild, iconDom = header.firstChild, captionDom = iconDom.nextSibling, content = header.nextSibling;
                return {
                    container: container,
                    iconDom: iconDom,
                    captionDom: captionDom,
                    content: content,
                    icon: false,
                    caption: caption,
                    cls_minibtn_hover: options.cls_minibtn_hover || 'ui-panel-btn-hover',
                    miniBtns: initMiniBtns.call(this, captionDom.nextSibling, options.miniBtns, doc, options),
                    expand: true
                };
            }
        };

    function Panel(options) {
        options = UI.extend(true, false, options, g_config);
        Panel.Super.call(this, options);
        this.icon(options.icon);
        UI.content(this._property.content, options.content, null, this);
    }

    UI.inherit(Panel, Size, {
        EVT_ON_EXPAND_BEFORE: 'EVT_ON_EXPAND_BEFORE',
        EVT_ON_EXPAND_AFTER: 'EVT_ON_EXPAND_AFTER',

        caption: function (caption) {
            if (arguments.length === 0) {
                return this._property.caption;
            }
            var property = this._property;
            caption = caption ? UI.formatHtml(caption) : UI.i18n('cmp.panel.caption.none', '无标题');
            if (property.caption !== caption) {
                property.captionDom.innerHTML = property.caption = caption;
            }
        },
        icon: function (icon) {
            if (arguments.length === 0) {
                return this._property.icon;
            }
            var property = this._property;
            if (arguments.length !== 1) {
                if (!(property = findMiniBtn(arguments[1], property))) return;
            }
            if (property.icon === (icon = icon || false)) return;
            UI.icon(property.iconDom, icon, property);
        },
        expand: function (expand) {
            if (arguments.length === 0) {
                return this._property.expand;
            }
            var property = this._property, oexpand = property.expand;
            if (expand === true || expand === false) {
                if ((expand = expand !== false) === oexpand) return false;
            } else {
                expand = !oexpand;
            }
            if (this.emit(this.EVT_ON_EXPAND_BEFORE, expand) === false) return false;
            var height = null, disp = null;
            if ((property.expand = expand)) {//展开时显示内容区域并恢复高度
                height = property.height;
                disp = '';
            } else {//收拢后隐藏内容区域并清除高度
                height = '';
                disp = 'none';
            }
            property.container.style.height = height;
            property.content.style.display = disp;
            this.emit(this.EVT_ON_EXPAND_AFTER, expand);
        }
    });

    return Panel;
});