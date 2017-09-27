EUI.defineCmp('menu', 'float', function (Float, UI) {
    'use strict';

    var NAME_ITEM = 'itemname',
        CLS_ARROW = 'ui-menu-item-arrow',
        CLS_HOVER = 'ui-menu-item-hover',
        CLS_DISABLED = 'ui-menu-item-disabled',
        CLS_CHECKED = 'ui-icon-checked',
        PREFIX_ITEM = 'menuitem_',

        _get_item_target_ = function (target) {
            if (target.nodeType !== 1) target = target.parentNode;
            if (target.tagName.toLowerCase() !== 'li') {
                target = target.parentNode;
                if (target.tagName.toLowerCase() !== 'li') target = null;
            }
            return target && UI.hasClass(target.parentNode, 'ui-menu') ? target : null;
        },
        _hide_menu_ = function (evt) {
            if (_get_item_target_(evt.target)) return;
            evt.data.hide();
        },
        g_config = {
            events: {
                'mousemove.menu': function (evt) {
                    var target = _get_item_target_(evt.target);
                    var property = evt.data._property, activeitem = property.activeitem;
                    if (activeitem) {
                        if (activeitem.getItemDom() === target) return;
                        activeitem.doClick(false);
                    }
                    if (target) {
                        var name = target.getAttribute(NAME_ITEM), item = null;
                        if (name && (item = property.itemsMap[name])) {
                            property.activeitem = item.doClick(true) === false ? null : item;
                            return;
                        }
                    }
                    property.activeitem = null;
                },
                'mouseup.menu': function (evt) {
                    if (evt.which === UI.MOUSE_LEFT) {
                        var item = evt.data._property.activeitem;
                        if (item) item.doClick();
                    }
                },
                'mouseleave.menu': function (evt) {
                    var menu = evt.data, property = menu._property, activeitem = property.activeitem;
                    if (activeitem) {
                        menu = activeitem.getMenu();
                        if (menu && UI.isAncestor(menu.elem(), evt.relatedTarget, true)) return;
                        activeitem.doClick(false);
                        property.activeitem = null;
                    }
                }
            },
            handlers: {
                'EVT_ON_SHOW.system': function () {
                    if (arguments.length > 0 && !this.getRootMenu()) {
                        UI.bind(this.doc.body, 'mousedown.' + this._property.cmpid, this, _hide_menu_);
                    }
                },
                'EVT_ON_HIDE.system': function () {
                    var property = this._property, activeitem = property.activeitem;
                    if (activeitem) {
                        activeitem.doClick(false);
                        property.activeitem = null;
                    }
                    if (!this.getRootMenu()) {
                        UI.unbind(this.doc.body, 'mousedown.' + property.cmpid);
                    }
                }
            },
            onComponentInit: function (pelem, doc) {
                var container = pelem.appendChild(doc.createElement('ul'));
                container.className = 'ui-menu';
                return { container: container, items: [], itemsMap: {}, spaceItems: [] };
            }
        };

    function Menu(options) {
        options = UI.extend(true, false, options, g_config);
        Menu.Super.call(this, options);
        var property = this._property, item_dom_clone = property.item_dom_clone = this.doc.createElement('li');
        item_dom_clone.className = 'ui-menu-item';
        item_dom_clone.innerHTML = '<span class="ui-icon"></span><span class="ui-menu-text"></span>';
        var item_space_clone = property.item_space_clone = this.doc.createElement('li');
        item_space_clone.className = 'ui-menu-space';
        property.rootmenu = options.rootmenu;
        var items = options.items;
        if (items) this.addItem(items);
    }

    function MenuItem(owner, name, caption, itemDom, options) {
        var property = this._property = {
            owner: owner,
            name: name,
            icon: false,
            iconUrl: false,
            caption: '',
            dom: itemDom,
            iconDom: itemDom.firstChild,
            captionDom: itemDom.lastChild,
            disabled: false,
            visible: true,
            enable_checked: false
        };
        this.setCaption(caption);
        if (options.enablechecked || options.group) {
            this.enableChecked(true, options.group);
            if (options.checked) this.setChecked(true);
        } else {
            this.setIcon(options.icon);
        }
        var items = options.items;
        if (UI.isArray(items)) {
            property.items = [].concat(items);
            UI.addClass(itemDom, CLS_ARROW);
        } else {
            this.setOnClick(options.onclick);
        }
        this.setData(options.data);
        this.disabled(options.disabled);
    }

    var _doAddItem = function (property, items, container, caption, options) {
        if (!UI.isString(caption)) {
            options = caption || options || {};
            if (options.space === true) {
                var space = container.appendChild(property.item_space_clone.cloneNode(true));
                property.spaceItems.push({
                    dom: space,
                    index: items.length
                });
                return;
            }
            caption = options.caption;
        } else if (!options) {
            options = {};
        }
        var name = options.name || UI.random(PREFIX_ITEM), itemsMap = property.itemsMap;
        if (itemsMap[name]) {
            UI.error(UI.i18n('cmp.menu.item.repeat', '重复定义菜单项别名【{0}】', name));
        }
        caption = caption || UI.i18n('cmp.menu.item.name', '菜单{0}', items.length + 1);
        var itemDom = container.appendChild(property.item_dom_clone.cloneNode(true));
        itemDom.setAttribute(NAME_ITEM, name);
        var item = itemsMap[name] = new MenuItem(this, name, caption, itemDom, options);
        items.push(item);
        if (options.visible === false) item.visible(false);
    };

    UI.inherit(Menu, Float, {
        dispose: function () {
            var property = this._property, items = property.items;
            for (var i = 0, len = items.length; i < len; i++) {
                items[i]._property = null;
            }
            UI.unbind(property.container, '.menu');
            Menu.Super.prototype.dispose.call(this);
        },
        getRootMenu: function () {
            return this._property.rootmenu || (arguments[0] === true ? this : null);
        },
        addItem: function (caption, options) {
            var property = this._property, items = property.items, container = property.container;
            if (UI.isArray(caption)) {
                for (var i = 0, len = caption.length; i < len; i++) {
                    _doAddItem.call(this, property, items, container, caption[i]);
                }
            } else {
                _doAddItem.call(this, property, items, container, caption, options);
            }
        },
        removeItem: function (name) {
            var item = this.getItem(name);
            if (!item) return false;
            var property = this._property,
                items = property.items,
                idx = items.indexOf(item),
                itemDom = item._property.dom,
                spaceItems = property.spaceItems,
                len = spaceItems.length;
            if (len > 0) {
                var spaceIndex = 0;
                while (spaceIndex < len) {
                    if (spaceItems[spaceIndex].index > idx) break;
                    spaceIndex++;
                }
                while ((--len) >= spaceIndex) {
                    spaceItems[len].index--;
                }
                var fidx = 0, tidx = spaceItems[spaceIndex].index;
                if (spaceIndex > 0) {
                    fidx = spaceItems[spaceIndex = spaceIndex - 1].index;
                }
                if (fidx === tidx) {
                    property.container.removeChild(spaceItems[spaceIndex].dom);
                    spaceItems.splice(spaceIndex, 1);
                } else {
                    for (var i = fidx; i < tidx; i++) {
                        if (items[i].visible()) {
                            fidx = -1;
                            break;
                        }
                    }
                    if (fidx !== -1) spaceItems[spaceIndex].dom.style.display = 'none';
                }
            }
            delete property.itemsMap[itemDom.getAttribute(NAME_ITEM)];
            items.splice(idx, 1);
            item._property = null;
            property.container.removeChild(itemDom);
        },
        getItem: function (name) {
            var property = this._property, items = property.items, len = items.length;
            if (UI.isString(name)) {
                var item = property.itemsMap[name];
                if (!item && arguments[1] === true) {
                    for (var i = 0; i < len; i++) {
                        var menu = items[i].getMenu();
                        if (menu && (item = menu.getItem(name, true))) break;
                    }
                }
                return item;
            } else {
                return len ? items[name >= 0 ? name : (name + len) % len] : undefined;
            }
        }
    });

    UI.extend(MenuItem.prototype, {
        getOwner: function () {
            return this._property.owner;
        },
        getName: function () {
            return this._property.name;
        },
        getCaption: function () {
            return this._property.caption;
        },
        setCaption: function (caption) {
            if (!caption) return;
            caption = UI.formatHtml(caption);
            var property = this._property;
            if (caption === property.caption) return;
            property.captionDom.innerHTML = property.caption = caption;
        },
        getIcon: function () {
            return this._property.icon;
        },
        setIcon: function (icon) {
            var property = this._property;
            if (property.enable_checked) return false;
            if (property.icon === (icon = icon || false)) return;
            UI.icon(property.iconDom, property.icon = icon, property);
        },
        getItemDom: function () {
            return this._property.dom;
        },
        setOnClick: function (onclick) {
            var property = this._property;
            if (property.menu || property.items) return false;
            property.onclick = onclick;
        },
        doClick: function (pop) {
            var property = this._property, menu;
            if (property.disabled) return false;
            if (pop === false) {
                if ((menu = this.getMenu())) menu.hide();//隐藏下级菜单
                UI.removeClass(property.dom, CLS_HOVER);
            } else if (pop === true) {
                var itemDom = property.dom;
                if ((menu = this.getMenu())) menu.showAt(itemDom, true);//显示下级菜单
                UI.addClass(itemDom, CLS_HOVER);
            } else if (!(property.menu || property.items)) {
                if (UI.call(property.onclick, this, menu = property.owner) !== false) {
                    if ((menu = menu.getRootMenu(true)).emit('onclick', this) !== false) {
                        this.setChecked();
                        menu.hide();
                    }
                }
            }
        },
        visible: function (visible) {
            var property = this._property;
            if (UI.isNull(visible)) return property.visible;
            if ((visible = visible === true) === property.visible) return;
            if ((property.visible = visible)) {
                property.dom.style.display = '';
            } else {
                property.dom.style.display = 'none';
            }
            // 以下代码控制菜单分割线的显示或隐藏，防止同一位置出现多条分割线
            var prop = property.owner._property, spaceItems = prop.spaceItems, len = spaceItems.length;
            if (!len) return;
            var items = prop.items, idx = items.indexOf(this), _idx = 0;
            while (_idx < len) {
                if (spaceItems[_idx].index > idx) break;
                _idx++;
            }
            var fidx = null, tidx = null;
            if (_idx === len) {
                fidx = spaceItems[_idx = _idx - 1].index;
                tidx = items.length;
            } else {
                tidx = spaceItems[_idx].index;
                fidx = _idx > 0 ? spaceItems[_idx = _idx - 1].index : 0;
            }
            var disp = '';
            if (!visible) {
                for (var i = fidx; i < tidx; i++) {
                    if (items[i].visible()) return;
                }
                disp = 'none';
            }
            spaceItems[_idx].dom.style.display = disp;
        },
        disabled: function (disabled) {
            var property = this._property;
            if (UI.isNull(disabled)) return property.disabled;
            if ((disabled = disabled === true) === property.disabled) return;
            if ((property.disabled = disabled)) {
                UI.addClass(property.dom, CLS_DISABLED);
            } else {
                UI.removeClass(property.dom, CLS_DISABLED);
            }
        },
        enableChecked: function (enable, group) {
            var property = this._property;
            if ((enable = enable === true) === property.enable_checked) return;
            var menu = property.owner, groups;
            if (enable) {
                this.setIcon(null);
                property.enable_checked = enable;
                if (group) {
                    groups = menu.property('groups');
                    var name = null, nullable = null, idx = null;
                    if (UI.isString(group)) {
                        name = group;
                        nullable = arguments[2] === true;
                        idx = parseInt(arguments[3], 10);
                    } else {
                        if (!(name = group.name) || !UI.isString(name)) {
                            UI.error('未指定菜单分组名称.');
                            return;
                        }
                        nullable = group.nullable === true;
                        idx = parseInt(group.index, 10);
                    }
                    property._items_group_name = name;
                    if (!groups) {
                        groups = {};
                        groups[name] = { nullable: nullable, idx: isNaN(idx) || idx < 0 ? -1 : idx, items: [this] };
                        menu.property('groups', groups);
                        if (!nullable) this.setChecked(true);
                    } else {
                        var _groups = groups[name];
                        if (_groups) {
                            _groups.items.push(this);
                        } else {
                            groups[name] = { nullable: nullable, idx: isNaN(idx) || idx < 0 ? -1 : idx, items: [this] };
                            if (!nullable) this.setChecked(true);
                        }
                    }
                }
            } else {
                if (property._items_group_name) {
                    groups = menu.property('groups')[property._items_group_name];
                    var items = groups.items;
                    items.splice(items.indexOf(this), 1);
                    if (this === groups.item) this.setChecked(false);
                    property._items_group_name = null;
                } else {
                    this.setChecked(false);
                }
                property.enable_checked = enable;
            }
        },
        isChecked: function () {
            return this._property.checked;
        },
        setChecked: function (checked) {
            var property = this._property;
            if (!property.enable_checked) return false;
            if (property._items_group_name) {
                var groups = property.owner.property('groups')[property._items_group_name], item = groups.item, items = groups.items;
                if (checked) {
                    if (item === this) return false;
                    groups.item = this;
                    if (item) item.setChecked(false);
                } else {
                    if (checked !== false) {
                        if (!groups.nullable && item === this) {
                            return false;
                        }
                        if (!this.isChecked()) {
                            this.setChecked(true);
                            return;
                        }
                    }
                    if (!item || item === this) {
                        groups.item = null;
                        if (!groups.nullable) {
                            var idx = groups.idx;
                            if (idx !== -1) {
                                item = items[idx];
                            } else {
                                for (var i = 0, len = items.length; i < len; i++) {
                                    if ((item = items[i]) !== this) break;
                                }
                            }
                            if (!item || item === this) return false;
                            item.setChecked(true);
                        }
                    }
                }
            }
            if ((checked = checked === true) === property.checked) return false;
            if ((property.checked = checked)) {
                UI.addClass(property.iconDom, CLS_CHECKED);
            } else {
                UI.removeClass(property.iconDom, CLS_CHECKED);
            }
        },
        getMenu: function () {
            var property = this._property, menu = property.menu;
            if (!menu) {
                if (!property.items) return;
                var owner = property.owner;
                menu = property.menu = new Menu({
                    wnd: owner.wnd,
                    items: property.items,
                    rootmenu: owner.getRootMenu(true)
                });
                delete property.items;
            }
            return menu;
        },
        addItem: function (items) {
            if (!items) return false;
            var property = this._property, menu = property.menu;
            if (menu) {
                menu.addItem(items);
            } else {
                var oitems = property.items;
                if (!oitems) {
                    oitems = [];
                    UI.addClass(property.dom, CLS_ARROW);
                    if (property.onclick) this.setOnClick(null);
                }
                property.items = oitems.concat(items);
            }
        },
        setData: function (name, data) {
            if (!name) return;
            var property = this._property;
            if (!data) {
                if (UI.isString(name)) {
                    delete property[UI.startWith(name, PREFIX_ITEM, true)];
                } else {
                    for (var i in name) {
                        if (name.hasOwnProperty(i)) {
                            property[UI.startWith(i, PREFIX_ITEM, true)] = name[i];
                        }
                    }
                }
            } else {
                property[UI.startWith(name, PREFIX_ITEM, true)] = data;
            }
        },
        getData: function (name) {
            return name ? this._property[UI.startWith(name, PREFIX_ITEM, true)] : null;
        }
    });

    return Menu;
});