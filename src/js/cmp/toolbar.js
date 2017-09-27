EUI.defineCmp('toolbar', 'bar', function (Bar, UI) {
    'use strict';

    var CLS_HOVER = 'ui-toolbar-item-hover',
        CLS_DISABLED = 'ui-toolbar-item-disabled',
        CLS_CHECKED = 'ui-toolbar-item-checked',
        CLS_ARROW = 'ui-arrow',

        g_menuEvents = {
            'mouseleave.menu': function (evt) {
                var menu = evt.data;
                UI.removeClass(menu.property('toolbar_item').itemDom, CLS_HOVER);
                menu.property('toolbar_item', null);
                menu.hide();
            }
        };

    var _initMenu = function (item) {
        item.menu = this;
        delete item.items;
        if (item.showMenu) {
            this.showAt(item.itemDom);
            delete item.showMenu;
        }
    };

    function _get_item_target_(target) {
        if (target.nodeType !== 1) target = target.parentNode;
        if (target.tagName.toLowerCase() !== 'li') {
            target = target.parentNode;
            if (target.tagName.toLowerCase() !== 'li') target = null;
        }
        return target;
    }

    function _showMenu(item) {
        var menu = item.menu;
        if (menu) {
            menu.showAt(item.itemDom);
        } else {
            var items = item.items;
            if (items) {
                if (item.showMenu === undefined) {
                    UI.getCmp('menu', { items: items, events: g_menuEvents }, { handler: _initMenu, args: item });
                }
                item.showMenu = true;
            }
        }
    }

    function _hideMenu(item, elem) {
        var menu = item.menu;
        if (menu) {
            if (UI.isAncestor(menu.elem(), elem, true)) {
                menu.property('toolbar_item', item);
                return false;
            }
            menu.hide();
        } else if (item.showMenu) {
            item.showMenu = false;
        }
    }

    function _isBeforeSpace(items, idx) {
        var isSpace = true;
        while ((--idx) >= 0) {
            var item = items[idx];
            if (item.space) {
                break;
            } else if (item.visible) {
                isSpace = false;
                break;
            }
        }
        return isSpace;
    }

    var g_config = {
        events: {
            mousemove: function (evt) {
                var target = _get_item_target_(evt.target);
                var toolbar = evt.data, property = toolbar._property,
                    items = property.items,
                    hoverIndex = property.hover_index,
                    idx = -1;
                if (hoverIndex !== -1) {
                    var hoverItem = items[hoverIndex], elem = hoverItem.itemDom;
                    if (elem === target) return;
                    UI.removeClass(elem, CLS_HOVER);
                    _hideMenu(hoverItem);
                }
                if (target) {
                    if ((idx = toolbar.index(target)) !== -1) {
                        var item = property.items[idx];
                        if (item.enable && !item.space) {
                            UI.addClass(item.itemDom, CLS_HOVER);
                            _showMenu(item);
                        } else {
                            idx = -1;
                        }
                    }
                }
                property.hover_index = idx;
            },
            mouseup: function (evt) {
                if (evt.which === UI.MOUSE_LEFT) {
                    var toolbar = evt.data, idx = toolbar._property.hover_index;
                    if (idx !== -1) toolbar.click(idx);
                }
            },
            mouseleave: function (evt) {
                var property = evt.data._property, idx = property.hover_index;
                if (idx !== -1) {
                    var item = property.items[idx];
                    if (_hideMenu(item, evt.relatedTarget) !== false) {
                        UI.removeClass(item.itemDom, CLS_HOVER);
                    }
                    property.hover_index = -1;
                }
            }
        },

        handlers: {
            'EVT_ON_ADD_BEFORE.system': function (index, options) {
                if (options.space === true) {//处理分割栏
                    var property = this._property,
                        items = property.items;
                    var item_space = property.item_space_clone = this.doc.createElement('li');
                    item_space.className = 'ui-toolbar-space';
                    if (index === items.length) {
                        property[property.name_itemlist].appendChild(item_space);
                    } else {
                        property[property.name_itemlist].insertBefore(item_space, items[index].itemDom);
                    }
                    var isSpace = _isBeforeSpace(items, index);
                    if (isSpace) {
                        item_space.style.display = 'none';
                    }
                    items.splice(index, 0, {
                        itemDom: item_space,
                        visible: !isSpace,
                        space: true
                    });
                    return false;
                }
            },
            'EVT_ON_VISIBLE.system': function (index, visible) {
                var items = this._property.items, item = items[index];
                if (item.space) {
                    return false;
                }
                if (visible) {
                    var count = items.length;
                    while ((++index) < count) {
                        item = items[index];
                        if (item.space) {
                            if (!item.visible) {
                                item.visible = true;
                                item.itemDom.style.display = '';
                            }
                            break;
                        } else if (item.visible) {
                            break;
                        }
                    }
                } else {
                    if (_isBeforeSpace(items, index)) {
                        while ((++index) < count) {
                            item = items[index];
                            if (item.space) {
                                if (item.visible) {
                                    item.visible = false;
                                    item.itemDom.style.display = 'none';
                                }
                                break;
                            } else if (item.visible) {
                                break;
                            }
                        }
                    }
                }
            }
        },

        initClone: function (doc) {
            var item4clone = doc.createElement('li');
            item4clone.className = 'ui-toolbar-item';
            item4clone.innerHTML = '<span class="ui-toolbar-icon"></span><span class="ui-toolbar-text"></span>';
            return item4clone;
        },

        initItem: function (elem, index, item, options) {
            var name = options.name || UI.random(),
                iconDom = elem.firstChild,
                textDom = elem.lastChild,
                text = options.text,
                enable = options.enable !== false,
                items = options.items;
            if (options.visible === false) {
                item.visible = false;
                elem.style.display = 'none';
            }
            if (!enable) {
                UI.addClass(elem, CLS_DISABLED);
            }
            if (items && UI.isArray(items)) {
                UI.addClass(elem, CLS_ARROW);
            } else {
                items = false;
            }
            UI.title(textDom, text, this._property.max4text);
            UI.icon(iconDom, options.icon, UI.extend(item, {
                name: name,
                hint: elem.title = options.hint || '',
                text: text,
                iconDom: iconDom,
                textDom: textDom,
                enable: enable,
                items: items,
                onclick: options.onclick,
                checkable: options.checkable
            }));
        },

        onComponentInit: function (pelem, doc, options) {
            var container = pelem.appendChild(doc.createElement('ul'));
            container.className = 'ui-toolbar';
            return { container: container, items: [], hover_index: -1, max4text: parseInt(options.max4text) || 0 };
        }
    };

    function Toolbar(options) {
        Toolbar.Super.call(this, UI.extend(true, false, options, g_config));
    }

    UI.inherit(Toolbar, Bar, {
        hint: function (hint) {
            var idx = -1;
            if (UI.isString(hint)) {//Set Hint
                if ((idx = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                var item = this._property.items[idx];
                item.itemDom.title = item.hint = hint;
            } else {//Get Hint
                if ((idx = this.index.apply(this, arguments)) === -1) return;
                return this._property.items[idx].hint;
            }
        },
        enable: function (enable) {
            var idx = -1;
            if (UI.isBoolean(enable)) {//Set
                if ((idx = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                var item = this._property.items[idx];
                if (item.enable === enable) return;
                if ((item.enable = enable)) {
                    UI.removeClass(item.itemDom, CLS_DISABLED);
                } else {
                    UI.addClass(item.itemDom, CLS_DISABLED);
                }
            } else {//Get
                if ((idx = this.index.apply(this, arguments)) === -1) return;
                return this._property.items[idx].enable;
            }
        },
        click: function () {
            var idx = this.index.apply(this, arguments);
            if (idx === -1) return;
            var items = this._property.items, item = items[idx];
            if (!item.enable || item.space) return;
            if (item.items || item.menu) return;
            var checkable = item.checkable;
            if (checkable) {
                var elem = item.itemDom, checked = !UI.hasClass(elem, CLS_CHECKED);
                if (UI.call(item.onclick, this, checked) !== false) {
                    if (checked && UI.isString(checkable)) {
                        for (var i = 0, len = items.length; i < len; i++) {
                            if (i === idx) continue;
                            if ((item = items[i]).checkable === checkable) {
                                UI.removeClass(item.itemDom, CLS_CHECKED);
                            }
                        }
                    }
                    UI[checked ? 'addClass' : 'removeClass'](elem, CLS_CHECKED);
                }
            } else {
                UI.call(item.onclick, this);
            }
        }
    });

    return Toolbar;
});