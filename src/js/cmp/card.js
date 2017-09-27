EUI.defineCmp('card', ['guide'], function (Guide, UI) {
    'use strict';

    var g_config = {
        cls_item: 'ui-card-item',
        cls_active: 'ui-card-active',

        initClone: function (doc, options) {
            var item4clone = doc.createElement('div');
            item4clone.className = options.cls_item;
            return item4clone;
        },

        initItem: function (elem, index, item, options) {
            var content = options.content;
            if (content) {
                if (this.active() === index) {
                    UI.content(elem, content, item, this);
                } else {
                    (options.data = options.data || {}).$_lazy_load_content = [elem, content, item];
                }
            }
        },

        handlers: {
            'EVT_ON_SWITCH_AFTER.system.card': function (idx, oidx, swap) {
                if (swap === false) return;
                var content = this.data('$_lazy_load_content', idx);
                if (content) {
                    this.data('$_lazy_load_content', null, idx);
                    UI.content(content[0], content[1], content[2], this);
                }
            }
        },

        onComponentInit: function (pelem, doc, options) {
            var container = pelem.appendChild(doc.createElement('div'));
            container.className = options.cls_container || 'ui-card';
            return {
                container: container,
                activeidx: -1,
                items: []
            };
        }
    };

    function Card(options) {
        Card.Super.call(this, UI.extend(true, false, options, g_config));
    }

    UI.inherit(Card, Guide);

    return Card;
});