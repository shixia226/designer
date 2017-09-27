EUI.defineCmp('group', function (Component, UI) {
    'use strict';

    function Group(options) {
        Group.Super.call(this, options = options || {});
        UI.extend(false, false, this._property, {
            items: [],
            item4clone: UI.call(options.initClone, this, this.doc, options),
            initItem: options.initItem || false,
            name_itemlist: options.name_itemlist || 'container'
        });
        if (options.items) this.add(options.items);
    }

    var PREFIX_DATA = 'data_';

    UI.inherit(Group, Component, {
        EVT_ON_ADD_BEFORE: 'EVT_ON_ADD_BEFORE',
        EVT_ON_ADD_AFTER: 'EVT_ON_ADD_AFTER',
        EVT_ON_REMOVE_BEFORE: 'EVT_ON_REMOVE_BEFORE',
        EVT_ON_REMOVE_AFTER: 'EVT_ON_REMOVE_AFTER',
        EVT_ON_VISIBLE: 'EVT_ON_VISIBLE',

        add: function (options) {
            if (UI.isArray(options)) {
                UI.each(options, this.add, this);
                return;
            }
            options = options || {};
            var property = this._property,
                items = property.items,
                count = items.length,
                index = parseInt(options.index, 10);
            if (isNaN(index) || index < 0 || index > count) index = count;
            if (this.emit(this.EVT_ON_ADD_BEFORE, index, options) === false) return;
            var itemDom = property.item4clone.cloneNode(true), item = { visible: options.visible !== false, itemDom: itemDom };
            var idx = UI.call(property.initItem, this, itemDom, index, item, options);
            if (!isNaN(idx) && idx >= 0 && idx <= count) {
                index = idx;
            }
            itemDom = item.itemDom;//防止initItem扩展更新了DOM
            if (!item.visible) {
                itemDom.style.display = 'none';
            }
            items.splice(index, 0, item);
            if (index === count) {
                property[property.name_itemlist].appendChild(itemDom);
            } else {
                property[property.name_itemlist].insertBefore(itemDom, property.items[index + 1].itemDom);
            }
            if (options.data) this.data(options.data, index);
            this.emit(this.EVT_ON_ADD_AFTER, index, options);
            return index;
        },
        remove: function (index) {
            index = this.index.apply(this, arguments);
            if (index === -1) return;
            if (this.emit(this.EVT_ON_REMOVE_BEFORE, index) === false) return;
            var property = this._property,
                item = property.items.splice(index, 1)[0];
            property[property.name_itemlist].removeChild(item.itemDom);
            this.emit(this.EVT_ON_REMOVE_AFTER, index, item);
            return item;
        },
        count: function () {
            return this._property.items.length;
        },
        index: function (index) {
            var property = this._property, items = property.items, count = items.length;
            if (count === 0) return -1;
            var idx = parseInt(index, 10);
            if (!isNaN(idx) && idx >= 0 && idx < count) return idx;
            var name, value;
            if (arguments.length === 1) {
                if (index) {
                    if (index.nodeType === 1) {
                        name = 'itemDom';
                        value = index;
                    } else if (UI.isString(index)) {
                        name = 'name';
                        value = index;
                    } else {
                        name = index.name;
                        value = index.value;
                    }
                }
            } else if (UI.isString(index)) {
                name = UI.startWith(index, PREFIX_DATA, true);
                value = arguments[1];
            }
            if (name) {
                for (var i = 0, len = items.length; i < len; i++) {
                    if (items[i][name] === value) return i;
                }
            }
            return -1;
        },
        visible: function (visible, index) {
            if (UI.isBoolean(visible)) {//Set Visible
                if ((index = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                var item = this._property.items[index];
                if (item.visible === visible) return;
                if (this.emit(this.EVT_ON_VISIBLE, index, visible) !== false) {
                    item.itemDom.style.display = (item.visible = visible) ? '' : 'none';
                }
            } else {
                if ((index = this.index.apply(this, arguments)) === -1) return;
                return this._property.items[index].visible;
            }
        },
        /**
         * Group.data({name: value}, index) 设置多个属性数据
         * Group.data(['name'], index) 获取多个属性数据
         * Group.data('name', value, index) 设置一个属性数据
         * Group.data('name', null, index) 删除一个属性数据
         * Group.data('name', index) 获取一个属性数据
         */
        data: function (name, value, index) {
            var item, i;
            if (UI.isPlainObject(name)) {//Set Object Data
                if ((index = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                item = this._property.items[index];
                for (i in name) {
                    if (name.hasOwnProperty(i)) {
                        item[UI.startWith('' + i, PREFIX_DATA, true)] = name[i];
                    }
                }
            } else if (UI.isArray(name)) {//Get Data
                if ((index = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                item = this._property.items[index];
                var arrLen = name.length, rt = {}, sidx = PREFIX_DATA.length;
                if (arrLen === 0) {
                    for (i in item) {
                        if (UI.startWith(i, PREFIX_DATA)) {
                            rt[i.substr(sidx)] = item[i];
                        }
                    }
                } else {
                    for (i = 0; i < arrLen; i++) {
                        var itemName = UI.startWith('' + name[i], PREFIX_DATA, true);
                        rt[itemName.substr(sidx)] = item[itemName];
                    }
                }
                return rt;
            } else {
                name = UI.startWith('' + name, PREFIX_DATA, true);
                if (arguments.length === 2) {//Get
                    if ((index = this.index.call(this, value)) === -1) return;
                    return this._property.items[index][name];
                } else {
                    if ((index = this.index.call(this, index)) === -1) return;
                    item = this._property.items[index];
                    if (value == null) {
                        delete item[name];
                    } else {
                        item[name] = value;
                    }
                }
            }
        }
    });

    return Group;
});