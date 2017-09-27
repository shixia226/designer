EUI.defineCmp('tab', ['navbar', 'card'], function (Navbar, Card, UI) {
    'use strict';

    var g_config = {
        evtelem: 'headerDom',
        events: {
            click: function (evt) {
                var target = evt.target, isclose = UI.hasClass(target, 'ui-tab-close'), tab = evt.data;
                while (target !== this) {
                    if (UI.hasClass(target, 'ui-tab-item')) {
                        tab[isclose ? 'remove' : 'active'](target);
                        break;
                    }
                    target = target.parentNode;
                }
                if (!isclose) tab.emit(tab.EVENT_ON_CLICK, evt);
            }
        },

        handlers: {
            'EVT_ON_ADD_AFTER.system.tab': function (index, options) {
                var property = this._property,
                    fixedcount = property.fixedcount,
                    items = property.items,
                    item = items[index];
                item.closeDom = item.textDom.nextSibling;
                if (fixedcount > index) {
                    if (property.closable) item.closeDom.style.display = 'none';
                    if (fixedcount < items.length) property.fixedcount = fixedcount + 1;
                }
                property.bodyCard.add(options);
                property.bodyCard.active(this.active());
                this.layout();
            },
            'EVT_ON_REMOVE_AFTER.system.tab': function (index, item) {
                var property = this._property, bodyCard = property.bodyCard;
                bodyCard.remove(index);
                var overhidden = property.overhidden;
                for (var i = 0, len = overhidden.length; i < len; i++) {
                    if (overhidden[i] >= index) {
                        overhidden[i] -= 1;
                    }
                }
                if (item.visible) {
                    var idx = overhidden.indexOf(index - 1);
                    if (idx !== -1) {
                        var menu = property.overhiddenmenu, overhiddenspan = property.overhiddenspan;
                        menu.removeXMenuItem(menu.getXMenuItem(idx));
                        overhidden.splice(idx, 1);
                        if ((overhiddenspan.lastChild.innerHTML = overhidden.length) === 0) {
                            overhiddenspan.style.display = 'none';
                        }
                    } else {
                        this.layout();
                    }
                }
            },
            'EVT_ON_SWITCH_AFTER.system.tab': function (index) {
                if (arguments[2]) {
                    var property = this._property;
                    property.bodyCard.active(index);
                    if (property.overhidden.indexOf(index) !== -1) {
                        this.layout();
                    }
                }
            },
            'EVT_ON_VISIBLE.system.tab': function (index, visible) {
                var property = this._property, item = property.items[index];
                property.bodyCard.visible(index, visible);
                if (visible) {
                    this.layout();
                } else {
                    var overhidden = property.overhidden, idx = overhidden.indexOf(index);
                    if (idx === -1) {
                        this.layout();
                    } else {
                        var menu = property.overhiddenmenu, overhiddenspan = property.overhiddenspan;
                        menu.removeItem(item.id);
                        overhidden.splice(idx, 1);
                        var len = overhiddenspan.lastChild.innerHTML = overhidden.length;
                        if (len === 0) overhiddenspan.style.display = 'none';
                    }
                }
            }
        },

        cls_item: 'ui-tab-item',
        cls_icon: 'ui-tab-icon',
        cls_text: 'ui-tab-text',
        cls_active: 'ui-tab-active',
        tip4close: UI.i18n('close', '关闭'),
        name_itemlist: 'headerlist',

        formatCloneHtml: function (html, options) {
            return html + '<span title="' + (options.tip4close || 'remove') + '" class="ui-tab-close font-icon-close" style="display: none"></span>';
        },

        style: 'default',
        onComponentInit: function (pelem, doc) {
            var container = pelem.appendChild(doc.createElement('div'));
            container.className = 'ui-tab';
            container.innerHTML = '<div class="ui-tab-header"><ul class="ui-tab-header-list"></ul></div>';
            var headerDom = container.firstChild;
            return {
                container: container,
                headerDom: headerDom,
                headerlist: headerDom.firstChild,
                bodyCard: new Card({
                    pelem: container,
                    handlers_filter: /\.system\.guide$/,
                    cls_container: 'ui-tab-body',
                    cls_item: 'ui-tab-body-item',
                    cls_active: 'ui-tab-body-active'
                }),
                closable: false,
                headervisible: true,
                fixedcount: 0,
                overhidden: [],
                activeidx: -1,
                items: []
            };
        }
    };

    function Tab(options) {
        options = UI.extend(true, false, options, g_config);
        Tab.Super.call(this, options);
        this.fixed(options.fixedcount);
        if (options.closable === true) this.closable(true);
    }

    UI.inherit(Tab, Navbar, {
        EVENT_ON_CLICK: 'onclick',

        headerVisible: function (visible) {
            var property = this._property;
            if (arguments.length === 0) {
                return property.headervisible;
            }
            if (property.headervisible === (visible = visible !== false)) return false;
            var headerDom = property.headerDom, bodyDom = property.bodyCard.elem();
            if ((property.headervisible = visible)) {
                headerDom.style.display = '';
                bodyDom.style.cssText = bodyDom.style.cssText.replace(/([; ]+|^)(left|right|top|bottom|border):[^;]+(;|$)/gi, ';');
            } else {
                headerDom.style.display = 'none';
                bodyDom.style.cssText += '; left: 0; top: 0; right: 0; bottom: 0; border: none;';
            }
        },
        fixed: function (count) {
            count = parseInt(count, 10);
            if (isNaN(count)) return;
            if (count < 0) count = 0;
            var property = this._property, oricount = property.fixedcount;
            if (count === oricount) return;
            if (property.closable) {
                var items = property.items, i, len;
                if (oricount > count) {
                    for (i = count, len = Math.min(oricount, items.length); i < len; i++) {
                        items[i].closeDom.style.display = '';
                    }
                } else {
                    for (i = oricount, len = Math.min(count, items.length); i < len; i++) {
                        items[i].closeDom.style.display = 'none';
                    }
                }
            }
            property.fixedcount = count;
        },
        closable: function (closable) {
            var property = this._property;
            if (arguments.length === 0) {
                return property.closable;
            }
            closable = closable !== false;
            if (property.closable === closable) return false;
            var disp = (property.closable = closable) ? '' : 'none';
            var items = property.items, fixedcount = property.fixedcount;
            for (var i = fixedcount, len = items.length; i < len; i++) {
                items[i].closeDom.style.display = disp;
            }
            property.item4clone.lastChild.style.display = disp;
            this.layout();
        },
        reverse: function () {

        },
        layout: function () {

        }
    });

    return Tab;
});