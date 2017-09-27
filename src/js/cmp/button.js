EUI.defineCmp('button', 'size', function (Size, UI) {
    'use strict';

    function setText(elem, html) {
        if (html) {
            UI.html(elem, html);
            elem.style.display = '';
        } else {
            elem.style.display = 'none';
            html = '';
        }
        return html;
    }
    var CLS_DISABLED = 'disabled';
    var g_config = {
        width: false,
        height: false,
        events: {
            'click.button': function (evt) {
                evt.data.doClick();
            }
        },

        onComponentInit: function (pelem, doc, options) {
            var container = pelem.appendChild(doc.createElement('a'));
            container.className = 'ui-button';
            container.innerHTML = '<span class="ui-icon ui-button-icon"></span><span class="ui-button-text"></span>';
            var iconDom = container.firstChild, textDom = iconDom.nextSibling;
            var enable = options.enable !== false;
            if (!enable) {
                UI.addClass(container, CLS_DISABLED);
            }
            return UI.icon(iconDom, options.icon, {
                container: container,
                onclick: options.onclick,
                enable: enable,
                text: setText(textDom, options.text),
                iconDom: iconDom,
                textDom: textDom
            });
        }
    };

    /**
     * 按钮
     * @param options
     *  {
     *    text: String
     *    icon: String,
     *    arrow: String
     *    onclick: Function
     *    args: Any
     *  }
     * @constructor
     */
    function Button(options) {
        Button.Super.call(this, UI.extend(true, false, options, g_config));
    }

    UI.inherit(Button, Size, {
        dispose: function () {
            UI.unbind(this.elem(), '.toolbar');
            Button.Super.prototype.dispose.call(this);
        },
        doClick: function () {
            var property = this._property;
            if (property.enable) {
                UI.call(property.onclick, this);
            }
        },
        text: function (text) {
            var property = this._property, _caption = property.text;
            if (arguments.length === 0) {
                return _caption;
            }
            text = text ? UI.formatHtml(text) : '';
            if (_caption === text) return;
            property.text = setText(property.textDom, text);
        },
        icon: function (icon) {
            var property = this._property;
            if (arguments.length === 0) {
                return property.icon;
            }
            UI.icon(property.iconDom, icon, property);
        },
        enable: function (enable) {
            enable = enable !== false;
            var property = this._property;
            if (property.enable === enable) return;
            UI[(property.enable = enable) ? 'removeClass' : 'addClass'](property.container, CLS_DISABLED);
        }
    });

    return Button;
});