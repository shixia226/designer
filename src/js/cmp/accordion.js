EUI.defineCmp('accordion', ['layout', 'panel'], function (Layout, Panel, UI) {
    'use strict';

    var CLS_ICON_MAX = 'ui-icon-max', g_config = {
        onComponentInit: function (pelem, doc) {
            var container = pelem.appendChild(doc.createElement('div'));
            container.className = 'ui-accordion';
            return { container: container, panels: [], expandedPanels: [] };
        },
        doLayout: function () {
            var property = this._property, panels = property.panels, len = panels.length;
            if (len === 0) return false;
            var expandedPanels = [];
            for (var i = 0; i < len; i++) {
                var panel = panels[i];
                panel.icon(CLS_ICON_MAX, CLS_ICON_MAX);
                if (panel.expand()) {
                    expandedPanels.push(panel);
                }
            }
            var ilen = expandedPanels.length;
            var height = UI.innerHeight(property.container) + 1 - 19 * (len - ilen), avgh = Math.ceil(height / ilen);
            for (i = 1; i < ilen; i++) {
                expandedPanels[i].height(avgh);
                height -= avgh;
            }
            expandedPanels[0].height(height);
            if (ilen === 1) {
                expandedPanels[0].icon('', CLS_ICON_MAX);
            }
        }
    };

    /**
     *
     * @param options
     *  {
     *
     *    autoCollapse: Boolean,
     *    btns: [], 每个子面板右上角都有的按钮
     *    items: [...]
     *  }
     * @constructor
     */
    function Accordion(options) {
        options = UI.extend(true, false, options, g_config);
        Accordion.Super.call(this, options);
        var items = options.items;
        if (items) {
            for (var i = 0, len = items.length; i < len; i++) {
                this.add(items[i]);
            }
            this.layout(false);
        }
    }

    var NAME_EVT_EXPAND = 'name_evt_expand',
        _merge_class = function (cls, extCls) {
            return cls + ' ' + extCls;
        },
        panelConfig = {
            cls_container: {
                handler: _merge_class,
                args: 'ui-accordion-panel'
            },
            cls_header: {
                handler: _merge_class,
                args: 'ui-accordion-header'
            },
            cls_content: {
                handler: _merge_class,
                args: 'ui-accordion-content'
            }
        },
        _getPanel = function (name) {
            var panels = this._property.panels;
            if (UI.isNumber(name)) {
                return panels[name];
            } else if (UI.isString(name)) {
                for (var i = 0, len = panels.length; i < len; i++) {
                    var panel = panels[i];
                    if (panel.property('_name_') === name) return panel;
                }
            } else if (name instanceof Panel) {
                if (UI.indexOf(panels, name) !== -1) return name;
            }
        },
        _set_panel_expand = function (panel, expand) {
            var evt = panel.property(NAME_EVT_EXPAND);
            panel.off(true, evt);
            panel.expand(expand);
            panel.on(true, evt);
        },
        _expand_current = function (btn, accordion) {
            var panels = accordion._property.panels;
            _set_panel_expand(this, true);
            for (var i = 0, len = panels.length; i < len; i++) {
                var panel = panels[i];
                if (panel !== this) {
                    _set_panel_expand(panel, false);
                }
            }
            accordion.layout(false);
        },
        _check_expandable = function (expand, panels) {
            if (!expand) {
                for (var i = 0, len = panels.length; i < len; i++) {
                    var panel = panels[i];
                    if (panel !== this) {
                        if (panel.expand()) return true;
                    }
                }
                return false;
            }
        };


    UI.inherit(Accordion, Layout, {
        dispose: function () {
            var panels = this._property.panels;
            for (var i = 0, len = panels.length; i < len; i++) {
                panels[i].dispose();
            }
            Accordion.Super.prototype.dispose.call(this);
        },
        /**
         * 添加一个子面板
         * @param options 参加Panel构造方法配置
         * @param name 指定面板Name
         * @returns index
         */
        add: function (options, name) {
            options = UI.extend(options, { pelem: this.elem() }, panelConfig);
            var panels = this._property.panels;
            if (!options || options.ignoreDefaultBtn !== true) {
                UI.namespace(true, 'miniBtns', options, {
                    cls: CLS_ICON_MAX,
                    handler: _expand_current,
                    args: [this]
                }, 'collapse');
            }
            var panel = new Panel(options);
            panel.on(panel.EVT_ON_EXPAND_BEFORE, { handler: _check_expandable, args: [panels] });
            panel.property(NAME_EVT_EXPAND, panel.on(panel.EVT_ON_EXPAND_AFTER, { handler: this.layout, args: false, context: this }));
            if (!name) name = options.name || UI.random('panel_');
            panel.property('_name_', name);
            panels.push(panel);
            if (options.expanded === false) {
                panel.expand(false);
            }
            return name;
        },
        /**
         * 设置子面板展开或收拢
         * @param expand
         * @param collapse 当expand为true时，该参数为true时表示收拢其他面板
         */
        expand: function (expand, collapse) {
            var panel = _getPanel.apply(this, [].slice.call(arguments, 2));
            if (!panel) return;
            if (expand !== true && expand !== false) expand = !panel.expand();
            if (expand) {
                if (collapse === true) {
                    _expand_current.call(panel);
                } else {
                    panel.expand(true);
                }
            } else {
                panel.expand(false);
            }
        }
    });

    return Accordion;
});