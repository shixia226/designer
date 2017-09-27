describe('Ajax库【ajax】', function () {
    beforeEach(function () {
        jasmine.clock().install();
        jasmine.Ajax.install();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
        jasmine.Ajax.uninstall();
    });
    describe('方法：EUI.ajax', function () {
        it('EUI.ajax(options) · AJAX请求', function () {
            var doneSuccess = jasmine.createSpy("success");
            var doneError = jasmine.createSpy("error");
            EUI.ajax({
                url: 'myurl',
                params: { id: 'zs' },
                onsuccess: doneSuccess,
                onerror: doneError
            });
            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('myurl?id=zs');
            expect(request.method).toBe('GET');
            expect(request.data()).toEqual({});
            request.respondWith({
                "status": 200,
                "contentType": 'text/plain',
                "responseText": 'awesome response'
            });
            jasmine.clock().tick(500);
            expect(doneError).not.toHaveBeenCalled();
            expect(doneSuccess).toHaveBeenCalledWith('awesome response');
        });
    });
    describe('方法：EUI.get', function () {
        it('EUI.get(url, data, onsucess, onerror) · GET请求', function () {
            var doneSuccess = jasmine.createSpy("success");
            var doneError = jasmine.createSpy("error");
            EUI.get('myurl', { id: 'zs', age: 18 }, doneSuccess, doneError);
            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('myurl?id=zs&age=18');
            expect(request.method).toBe('GET');
            expect(request.data()).toEqual({});
            request.respondWith({
                "status": 200,
                "contentType": 'text/plain',
                "responseText": 'awesome response'
            });
            jasmine.clock().tick(500);
            expect(doneError).not.toHaveBeenCalled();
            expect(doneSuccess).toHaveBeenCalledWith('awesome response');
        });
    });
    describe('方法：EUI.post', function () {
        it('EUI.post(url, data, onsuccess, onerror) · POST请求', function () {
            var doneSuccess = jasmine.createSpy("success");
            var doneError = jasmine.createSpy("error");
            EUI.post('myurl', { id: 'zs', age: 18 }, doneSuccess, doneError);
            var request = jasmine.Ajax.requests.mostRecent();
            expect(request.url).toBe('myurl');
            expect(request.method).toBe('POST');
            expect(request.data()).toEqual({ id: ['zs'], age: ['18'] });
            request.respondWith({
                "status": 200,
                "contentType": 'text/plain',
                "responseText": 'awesome response'
            });
            jasmine.clock().tick(500);
            expect(doneError).not.toHaveBeenCalled();
            expect(doneSuccess).toHaveBeenCalledWith('awesome response');
        });
    });
    describe('方法：EUI.script', function () {
        it('EUI.script(url) · 动态加载JS文件', function () {
            expect(window.jQuery).toBeUndefined();
            EUI.script('https://code.jquery.com/jquery-1.12.4.min.js', function () {
                expect(window.jQuery).not.toBeUndefined();
            });
        });
        it('EUI.script(script) · 动态加载JS代码', function () {
            expect(window.myAjaxVar).toBeUndefined();
            EUI.script('window.myAjaxVar = "OK"', function () {
                expect(window.myAjaxVar).toBe('OK');
            });
        });
    });
    describe('方法：EUI.style', function () {
        it('EUI.style(url) · 动态加载CSS文件', function (done) {
            var elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'ui-helper-hidden';
            expect(EUI.css(elem, 'display')).toBe('block');
            EUI.style('https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css', function () {
                expect(EUI.css(elem, 'display')).toBe('none');
                done();
            });
        });
        it('EUI.style(style) · 动态加载CSS代码', function () {
            var elem = document.body.appendChild(document.createElement('div'));
            elem.className = 'my-elem';
            expect(EUI.css(elem, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
            EUI.style('.my-elem{ background: red; }');
            expect(EUI.css(elem, 'backgroundColor')).toBe('rgb(255, 0, 0)');
        });
    });
    describe('方法：EUI.form', function () {

    });
});