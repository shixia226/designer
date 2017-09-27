describe('国际化【i18n】', function () {
    describe('方法：EUI.i18n', function () {
        it('EUI.i18n(name) · 获取i18n值', function () {
            expect(EUI.i18n('spec.i18n.load')).toBe('')
            expect(EUI.i18n('spec.i18n.xxx')).toBe('')
            expect(EUI.i18n('spec.i18n.load', 'This is default value')).toBe('This is default value');
            EUI.i18nInit({
                'spec.i18n.load': 'This is a i18n load value.',
                'spec.i18n.xxx': 'Something {0} for {1}.'
            });
            expect(EUI.i18n('spec.i18n.load')).toBe('This is a i18n load value.');
            expect(EUI.i18n('spec.i18n.xxx')).toBe('Something {0} for {1}.');
            expect(EUI.i18n('spec.i18n.xxx', null, 'test', 'i18n')).toBe('Something test for i18n.');
        });
    });
});