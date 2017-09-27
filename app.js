var g_express = require('express');
var g_app = g_express();
var g_queue = require("./server/util/queue.js");
var g_fs = require('fs');

function _read_files_(datas) {
    for (var i = 0, len = datas.length; i < len; i++) {
        var data = datas[i], info = data.info;
        if (data.error) {
            console.log("读取文件【" + (info.file || info) + "】失败:" + data.error);
        } else {
            var prefix = info.prefix, suffix = info.suffix;
            if (prefix) this.write(prefix);
            this.write(data.content);
            if (suffix) this.write(suffix);
        }
    }
    this.end();
}
g_app.all(/\/eui(?:.min)?\.css$/, function (req, res, next) {
    res.setHeader("Content-Type", "text/css");
    var theme = require("url").parse(req.url, true).query.theme;
    var fileName = req.url.match(/\/eui(?:.min)?\.css/)[0];
    var fileQueue = g_queue.getFileQueue(_read_files_, res);
    fileQueue.read(__dirname + '/public/css' + fileName, fileName);
    theme = theme ? theme + '.css' : 'defalut.css';
    fileQueue.read(__dirname + '/public/css/theme/' + theme, theme);
    fileQueue.finish();
});
g_app.all(/\/eui(?:\.min)?\.js$/, function (req, res) {
    res.setHeader("Content-Type", "text/javascript");
    var fileName = req.url.match(/\/eui(?:.min)?\.js/)[0];
    var fileQueue = g_queue.getFileQueue(_read_files_, res);
    fileQueue.read(__dirname + '/public/js' + fileName, fileName);
    var language = (require("url").parse(req.url, true).query.i18n || 'zh-CN') + ".json";
    fileQueue.read(__dirname + '/server/i18n/client/' + language, { file: language, prefix: "EUI.i18nInit(", suffix: ")" });
    fileQueue.finish();
});

g_app.all(/\/welcome.html$/, function (req, res) {
    g_fs.readFile(__dirname + '/public/' + req.url, function (err, data) {
        if (!err) {
            g_fs.readdir(__dirname + '/public/test', function (err, files) {
                if (!err) {
                    var json = [];
                    for (var i = 0, len = files.length; i < len; i++) {
                        var file = files[i];
                        if (file.substr(file.length - 5) === '.html') {
                            json.push(file);
                        }
                    }
                    data = data.toString().replace('</html>', '<script>\r\nlistPages(' + JSON.stringify(json) + ')\r\n</script>\r\n</html>');
                }
                res.send(data);
            });
        } else {
            console.log(err);
            res.end();
        }
    });
});

(function listRoutes(dir, unavailableRoutes, _) {
    g_fs.readdir(dir, function (err, files) {
        if (err) {
            console.log('read dir error:' + err);
            return;
        }
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i], path = dir + '/' + file;
            if (unavailableRoutes && unavailableRoutes.indexOf(file) !== -1) continue;
            if (file.substr(file.length - 3) === '.js') {
                try {
                    require(path)(g_app);
                } catch (e) {
                    console.log('route error(' + path + '):' + e);
                }
            } else {
                _.count++;
                listRoutes(path, unavailableRoutes, _);
            }
        }
        if ((_.count -= 1) === 0) {
            g_app.use(g_express.static('public'));
        }
    });
})('./server/routes', [], { count: 1 });

var port = process.env.VCAP_APP_PORT || '8826', host = process.env.VCAP_APP_HOST || 'localhost';
g_app.listen(port, host);
console.log('应用启动成功\r\n地址为：%s:%s', host, port);