EUI.defineCmp('ppt', ['util.editor', 'group'], function (Editor, Group, UI) {
    'use strict';

    function renderItem(ppt, value, item, type) {
        if (!type) type = Editor.get(item.type);
        var ovalue = item.value;
        value = UI.value(UI.call(type.validator, type, value), value);
        if (ovalue === value) return;
        item.value = value;
        var elem = item.valueDom;
        if (UI.call(type.render, type, value, elem, item.render) !== false) {
            UI.html(elem, UI.value(UI.call(type.format, type, value), value), true);
        }
        UI.call(item.onchange, ppt, value, ovalue, item.name);
        ppt.emit(ppt.EVT_ON_CHANGE, value, ovalue, item.name);
    }
    function initItemRender(value, elem, item, options, ppt) {
        var type = Editor.get(item.type);
        item.render = UI.call(type.oninit, type, {
            handler: ppt.value,
            context: ppt,
            args: item.name,
            before: true
        }, elem, options, ppt.doc);
        renderItem(ppt, value, item, type);
    }
    function clickGroupItem(elem, items, cls_expand) {
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item.group && item.itemDom === elem) {
                var expand = item.expand;
                UI[expand ? 'removeClass' : 'addClass'](elem, cls_expand);
                item.expand = !expand;
                var group = item.name, disp = expand ? 'none' : '';
                for (i++; i < len; i++) {
                    item = items[i];
                    if (item.group !== group) break;
                    if (item.visible) {
                        item.itemDom.style.display = disp;
                    }
                }
                break;
            }
        }
    }
    function editItem(item, ppt, evt) {
        if (item.group === true) return;
        var type = Editor.get(item.type);
        return UI.call(type.editor, type, item.value, {
            handler: ppt.value,
            context: ppt,
            args: item.name,
            before: true
        }, item.valueDom, item.render, evt);
    }
    function clickItem(elem, items, ppt, evt) {
        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            if (item.valueDom === elem) {
                return editItem(item, ppt, evt);
            }
        }
    }
    var g_config = {
        events: {
            'click.ppt': function (evt) {
                var target = evt.target;
                var ppt = evt.data, property = ppt._property,
                    cls_value = property.cls_value,
                    cls_group = property.cls_group,
                    editor = property.editor;
                if (editor) {
                    editor.hide();
                    property.editor = null;
                }
                while (target !== this) {
                    if (UI.hasClass(target, cls_value)) {
                        property.editor = clickItem(target, property.items, ppt, evt);
                        return;
                    }
                    if (UI.hasClass(target, cls_group)) {
                        return clickGroupItem(target, property.items, property.cls_expand);
                    }
                    target = target.parentNode;
                }
                ppt.emit(ppt.EVT_ON_CLICK, evt);
            }
        },
        handlers: {
            'EVT_ON_ADD_BEFORE.system': function (index, options) {
                var name = options.name;
                return name && UI.indexOf(this._property.items, name, 'name') === -1;
            },
            'EVT_ON_VISIBLE.system': function (index, visible) {
                var items = this._property.items, item = items[index];
                if (item.group && item.expand) {
                    var group = item.name, disp = visible ? '' : 'none';
                    for (var i = index + 1, len = items.length; i < len; i++) {
                        item = items[i];
                        if (item.group !== group) break;
                        if (item.visible) item.itemDom.style.display = disp;
                    }
                }
            }
        },
        cls_item: 'ui-ppt-item',
        cls_text: 'ui-ppt-text',
        cls_value: 'ui-ppt-value',
        cls_group: 'ui-ppt-group',
        cls_expand: 'ui-ppt-group-expand',
        initClone: function (doc, options) {
            var item4clone = doc.createElement('li');
            item4clone.className = options.cls_item;
            item4clone.innerHTML = '<div class="' + options.cls_text + '"></div><div class="' + options.cls_value + '"></div>';
            return item4clone;
        },
        initItem: function (elem, index, item, options) {
            var name = options.name, group = options.group;
            if (group === true) {
                var property = this._property, expand = options.expand !== false;
                UI.clearNode(elem);
                elem.className = property.cls_group;
                UI.css(elem, options.cls_text);
                UI.html(elem, options.text, false);
                if (expand) UI.addClass(elem, property.cls_expand);
                UI.extend(item, {
                    name: name,
                    group: true,
                    expand: expand
                });
                return;
            }
            var textDom = elem.firstChild, valueDom = textDom.nextSibling;
            UI.css(elem, options.cls_item);
            UI.css(textDom, options.cls_text);
            UI.html(textDom, options.text);
            UI.css(valueDom, options.cls_value);
            UI.extend(item, {
                name: name,
                textDom: textDom,
                valueDom: valueDom,
                group: group || '',
                type: options.type || 'text',
                onchange: options.onchange
            });
            if (group) {
                var items = this._property.items, idx = UI.indexOf(items, group, 'name');
                if (!items[idx].expand && item.visible) {
                    elem.style.display = 'none';
                }
                if (index <= idx) {
                    index = idx + 1;
                } else {
                    while ((++idx) < index) {
                        if (items[idx].group !== group) {
                            index = idx;
                            break;
                        }
                    }
                }
            }
            initItemRender(options.value, valueDom, item, options, this);
            return index;
        },
        onComponentInit: function (pelem, doc, options) {
            var container = pelem.appendChild(doc.createElement('ul'));
            container.className = 'ui-ppt';
            return { container: container, cls_group: options.cls_group, cls_expand: options.cls_expand, cls_value: options.cls_value };
        }
    };

    function Ppt(options) {
        options = UI.extend(true, false, options, g_config);
        Ppt.Super.call(this, options);
        this.value(options.value);
    }

    UI.inherit(Ppt, Group, {
        EVT_ON_CHANGE: 'EVT_ON_CHANGE',
        EVT_ON_CLICK: 'EVT_ON_CLICK',

        dispose: function () {
            this.hideEditor();
            Ppt.Super.prototype.dispose.call(this);
        },
        value: function (name, value) {
            var index = -1, items = this._property.items;
            if (arguments.length === 1) {
                if (UI.isObject(name)) {
                    for (var i in name) {
                        if (name.hasOwnProperty(i)) {
                            if ((index = UI.indexOf(items, name, 'name')) === -1) continue;
                            renderItem(this, value, items[index]);
                        }
                    }
                } else {
                    if ((index = this.index(name)) === -1) return;
                    return items[index].value;
                }
            } else {
                if ((index = this.index(name)) === -1) return;
                renderItem(this, value, items[index]);
            }
        },
        edit: function (name) {
            var property = this._property, editor = property.editor;
            if (editor) {
                editor.hide();
                property.editor = null;
            }
            var index = this.index(name);
            if (index === -1) return;
            property.editor = editItem(property.items[index], this);
        }
    });

    return Ppt;
});