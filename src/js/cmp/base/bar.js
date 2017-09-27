EUI.defineCmp('bar', 'group', function (Group, UI) {
    'use strict';

    function Bar(options) {
        Bar.Super.call(this, options);
    }

    UI.inherit(Bar, Group, {
        text: function (text, index) {
            if (UI.isString(text)) {//Set text
                if ((index = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                var property = this._property, item = property.items[index];
                if (item.text === text) return;
                UI.title(item.textDom, item.text = text, property.max4text);
            } else {//Get text
                if ((index = this.index.apply(this, arguments)) === -1) return;
                return this._property.items[index].text;
            }
        },
        icon: function (icon, index) {
            if (UI.isString(icon)) {//Set Icon
                if ((index = this.index.apply(this, [].slice.call(arguments, 1))) === -1) return;
                var item = this._property.items[index];
                UI.icon(item.iconDom, icon, item);
            } else {//Get Icon
                if ((index = this.index.apply(this, arguments)) === -1) return;
                return this._property.items[index].icon;
            }
        }
    });

    return Bar;
});