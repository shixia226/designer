EUI.defineCmp('guide', 'group', function (Group, UI) {
    'use strict';

    var g_config = {
        handlers: {
            'EVT_ON_ADD_AFTER.system.guide': function (index, options) {
                var property = this._property;
                if (UI.isString(property.cls_active)) {
                    var activeidx = property.activeidx;
                    if ((activeidx === -1 || options.reactive !== false)) {
                        if (activeidx >= index) property.activeidx += 1;
                        this.active(index);
                    } else if (activeidx >= index) {
                        property.activeidx += 1;
                        this.emit(this.EVT_ON_SWITCH_AFTER, activeidx + 1, activeidx, false);
                    }
                }
            },
            'EVT_ON_REMOVE_AFTER.system.guide': function (index) {
                var property = this._property, activeidx = property.activeidx;
                if (activeidx === index) {
                    property.activeidx = -1;
                    this.active(property.items.length === activeidx ? activeidx - 1 : activeidx);
                } else if (activeidx > index) {
                    this.emit(this.EVT_ON_SWITCH_AFTER, (property.activeidx = activeidx - 1), activeidx, false);
                }
            },
            'EVT_ON_VISIBLE.system.guide': function (index, visible) {
                var property = this._property;
                if (visible) {
                    if (property.activeidx === -1) {
                        this.active(index);
                    }
                } else {
                    if (property.activeidx === index && this.nextActive() === -1) {
                        property.activeidx = -1;
                    }
                }
            }
        }
    };

    function Guide(options) {
        options = UI.extend(true, false, options, g_config);
        Guide.Super.call(this, options);
        this._property.cls_active = options.cls_active || '';
        this.active(options.active_index || 0);
    }

    UI.inherit(Guide, Group, {
        EVT_ON_SWITCH_BEFORE: 'EVT_ON_SWITCH_BEFORE',
        EVT_ON_SWITCH_AFTER: 'EVT_ON_SWITCH_AFTER',

        active: function (index) {
            var property = this._property, activeidx = property.activeidx;
            if (arguments.length === 0) {
                return activeidx;
            }
            index = this.index.apply(this, arguments);
            if (index === -1) return false;
            if (activeidx === index) return false;
            if (this.emit(this.EVT_ON_SWITCH_BEFORE, index, activeidx) === false) return false;
            var items = property.items;
            if (activeidx !== -1) {
                UI.removeClass(items[activeidx].itemDom, property.cls_active);
            }
            var item = items[property.activeidx = index];
            UI.addClass(item.itemDom, property.cls_active);
            if (!item.visible) {
                this.visible(index, true);
            }
            this.emit(this.EVT_ON_SWITCH_AFTER, index, activeidx, true);
        },
        nextActive: function () {
            var index = this.index.apply(this, arguments);
            if (index === -1) return false;
            var property = this._property, items = property.items, i, len;
            for (i = index + 1, len = items.length; i < len; i++) {
                if (items[i].visible) {
                    this.active(i);
                    return i;
                }
            }
            for (i = 0; i < index; i++) {
                if (items[i].visible) {
                    this.active(i);
                    return i;
                }
            }
            if (property.activeidx === -1) {
                this.active(index);
                return index;
            }
            return -1;
        },
        prevActive: function () {
            var index = this.index.apply(this, arguments);
            if (index === -1) return;
            var property = this._property, items = property.items, i;
            for (i = index - 1; i >= 0; i--) {
                if (items[i].visible) {
                    this.active(i);
                    return i;
                }
            }
            for (i = items.length - 1; i > index; i--) {
                if (items[i].visible) {
                    this.active(i);
                    return i;
                }
            }
            if (property.activeidx === -1) {
                this.active(index);
                return index;
            }
            return -1;
        },
        index: function () {
            if (arguments.length === 0) {
                return this._property.activeidx;
            } else {
                return Guide.Super.prototype.index.apply(this, arguments);
            }
        }
    });

    return Guide;
});