EUI.defineCmp('layout', 'size', function (Size, UI) {
    'use strict';

    var g_config = {
        handlers: {
            'EVT_ON_WIDTH_CHANGE.system': {
                handler: function () {
                    this.layout(this.DIRECTION_HORIZON, true);
                }
            },
            'EVt_ON_HEIGHT_CHANGE.system': {
                handler: function () {
                    this.layout(this.DIRECTION_VERTICAL, true);
                }
            }
        }
    };

    function Layout(options) {
        options = UI.extend(true, false, options, g_config);
        Layout.Super.call(this, options);
        UI.extend(this._property, {
            doLayout: options.doLayout,
            doHorizonLayout: options.doHorizonLayout,
            doVerticalLayout: options.doVerticalLayout
        });
    }


    var doLayout = function (layout, timeout) {
        if (!layout) return false;
        if (timeout === true) {
            UI.timeout({ handler: layout, context: this }, true);
        } else if (timeout === false) {
            UI.timeout({ handler: layout, context: this }, true);
            layout.call(this);
        } else {
            UI.timeout({ handler: layout, context: this, delay: timeout, unique: true });
        }
    };

    UI.inherit(Layout, Size, {
        DIRECTION_HORIZON: 'horizon',
        DIRECTION_VERTICAL: 'vertical',

        layout: function (direction, timeout) {
            var property = this._property;
            if (direction === this.DIRECTION_HORIZON) {
                if (doLayout.call(this, property.doHorizonLayout, timeout) === false) {
                    doLayout.call(this, property.doLayout, timeout);
                }
            } else if (direction === this.DIRECTION_VERTICAL) {
                if (doLayout.call(this, property.doVerticalLayout, timeout) === false) {
                    doLayout.call(this, property.doLayout, timeout);
                }
            } else {
                if (timeout !== true && timeout !== false) timeout = direction;
                if (doLayout.call(this, property.doLayout, timeout) === false) {
                    doLayout.call(this, property.doHorizonLayout, timeout);
                    doLayout.call(this, property.doVerticalLayout, timeout);
                }
            }
        }
    });

    return Layout;
});