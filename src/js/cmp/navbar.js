EUI.defineCmp('navbar', ['guide', 'bar'], function (Guide, Bar, UI) {
    'use strict';

    var g_config = {
        events: {
            click: function (evt) {
                var target = evt.target, pnode = null;
                while (target) {
                    if ((pnode = target.parentNode) === this) {
                        evt.data.active(target);
                        break;
                    }
                    target = pnode;
                }
            }
        },

        cls_item: 'ui-navbar-item',
        cls_icon: 'ui-navbar-icon',
        cls_text: 'ui-navbar-text',
        cls_active: 'ui-navbar-active',

        initClone: function (doc, options) {
            var item4clone = doc.createElement('li');
            item4clone.className = options.cls_item;
            var html = '<span class="ui-icon ' + options.cls_icon + '"></span><span class="' + options.cls_text + '"></span>';
            item4clone.innerHTML = UI.call(options.formatCloneHtml, null, html, options) || html;
            return item4clone;
        },
        initItem: function (elem, index, item, options) {
            var text = null, icon = null;
            if (UI.isString(options)) {
                text = options;
            } else {
                text = options.text;
                icon = options.icon;
            }
            text = text || ('tab' + index);
            var iconDom = elem.firstChild, textDom = iconDom.nextSibling;
            UI.title(textDom, text, this._property.max4text);
            UI.icon(iconDom, icon, UI.extend(item, {
                text: text,
                iconDom: iconDom,
                textDom: textDom
            }));
        },

        onComponentInit: function (pelem, doc, options) {
            var container = pelem.appendChild(doc.createElement('ul'));
            container.className = options.cls_container || 'ui-navbar';
            return {
                container: container,
                max4text: parseInt(options.max4text, 10) || 0,
                activeidx: -1
            };
        }
    };

    function Navbar(options) {
        options = UI.extend(true, false, options, g_config);
        Navbar.Super.call(this, options);
        this.style(options.style);
    }

    UI.inherit(Navbar, Guide, Bar.prototype, {
        EVT_ON_STYLE: 'EVT_ON_STYLE',

        style: function (style) {
            var property = this._property, oristyle = property.style;
            if (arguments.length === 0) {
                return oristyle;
            }
            var container = property.container;
            if (oristyle) {
                if (oristyle === style) return;
                UI.removeClass(container, oristyle);
            }
            UI.addClass(container, style);
            this.emit(this.EVT_ON_STYLE, property.style = style, oristyle);
        }
    });

    return Navbar;
});