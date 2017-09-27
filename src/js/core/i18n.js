(function (UI) {

    var I18N = {}, reg_param = /\{(\d+)\}/g;

    UI.extend(UI, {
        i18nInit: function (i18n, replace) {
            if (replace) {
                I18N = i18n;
            } else {
                for (var name in i18n) {
                    if (i18n.hasOwnProperty(name)) {
                        I18N[name] = i18n[name];
                    }
                }
            }
        },
        i18n: function (name, defaultI18n) {
            var i18n = I18N[name] || defaultI18n || '', args = [].slice.call(arguments, 2);
            return args.length ? i18n.replace(reg_param, function (_, $1) { return args[$1]; }) : i18n;
        }
    });
})(EUI);