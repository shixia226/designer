describe('事件库【event】', function () {
    var elem, sum = 0;
    beforeEach(function () {
        elem = document.body.appendChild(document.createElement('div'));
        sum = 0;
    });
    afterEach(function () {
        EUI.removeNode(elem);
    });
    function click(evt) {
        var data = evt ? evt.data : null;
        sum += (data ? data.count : 1);
    }
    describe('方法：EUI.bind', function () {
        it('EUI.bind(elem, type, handler) · 绑定事件', function () {
            EUI.bind(elem, 'click', click);
            expect(sum).toBe(0);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(1);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(2);
        });
        it('EUI.bind(elem, type, handler, once) · 绑定一次性事件', function () {
            EUI.bind(elem, 'click', click, true);
            expect(sum).toBe(0);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(1);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(1);
        });
        it('EUI.bind(elem, type, data, handler) · 绑定带参数的事件', function () {
            EUI.bind(elem, 'click', { count: 10 }, click);
            expect(sum).toBe(0);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(10);
            EUI.trigger(elem, 'click');
            expect(sum).toBe(20);
        });
    });
    describe('方法：EUI.unbind', function () {
        it('EUI.unbind(elem, type) · 解绑指定事件类型事件', function () {
            EUI.bind(elem, 'click.spec', { count: 1 }, click);
            EUI.bind(elem, 'mousedown.spec', { count: 2 }, click);
            EUI.bind(elem, 'mouseup.spec', { count: 4 }, click);
            expect(sum).toBe(0);
            EUI.trigger(elem, 'click');
            EUI.trigger(elem, 'mousedown');
            EUI.trigger(elem, 'mouseup');
            expect(sum).toBe(7);
            EUI.unbind(elem, 'mousedown');
            EUI.trigger(elem, 'click');
            EUI.trigger(elem, 'mousedown');
            EUI.trigger(elem, 'mouseup');
            expect(sum).toBe(12);
        });
        it('EUI.unbind(elem, namespace) · 解绑指定类型各种事件', function () {
            EUI.bind(elem, 'click.spec', { count: 1 }, click);
            EUI.bind(elem, 'mousedown.spec', { count: 2 }, click);
            EUI.bind(elem, 'mouseup.spec', { count: 4 }, click);
            expect(sum).toBe(0);
            EUI.trigger(elem, 'click');
            EUI.trigger(elem, 'mousedown');
            EUI.trigger(elem, 'mouseup');
            expect(sum).toBe(7);
            EUI.unbind(elem, '.spec');
            EUI.trigger(elem, 'click');
            EUI.trigger(elem, 'mousedown');
            EUI.trigger(elem, 'mouseup');
            expect(sum).toBe(7);
        });
    });
    describe('方法：EUI.ready', function () {
        it('EUI.ready(handler) · 注册文档加载完毕后的回调', function () {
            expect(sum).toBe(0);
            EUI.ready(click);
            expect(sum).toBe(1);
            EUI.ready({
                handler: click,
                args: { data: { count: 10 } }
            });
            expect(sum).toBe(11);
        });
    });
    describe('方法：EUI.unload', function () {

    });
});