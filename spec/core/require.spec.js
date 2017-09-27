describe('动态加载【require】', function () {
    describe('方法：EUI.config', function () {
        it('EUI.config(options) · 配置require相关', function () {
            EUI.config({
                base: '',
                path: {
                    jQuery: 'http://code.jquery.com/jquery-1.7.js'
                },
                shim: {
                    jQuery: 'jQuery'
                }
            });
        });
    });
    describe('方法：EUI.require', function () {
        it('EUI.require(name, callback) · 获取对象执行回调', function (done) {
            EUI.require('jQuery', function ($, UI) {
                expect($).toBe(window.jQuery);
                done();
            });
        });
    });
    describe('方法：EUI.define', function () {
        it('EUI.define(name, base, module) · 定义模块对象', function (done) {
            EUI.define('myModule', [], function () {
                return {
                    myMethod: function () {
                        return 'myValue';
                    }
                }
            });

            EUI.require('myModule', function (module) {
                expect(module.myMethod()).toBe('myValue');
                done();
            });
        });
    });
});