/*
 * 根据代码中的I18N调用生成I18N的配置文件
 */

var fs = require('fs');

function resolve2i18n(file, i18n, callback) {
	if (!fs.existsSync(file)) return;
	callback.count += 1;
	if (fs.statSync(file).isDirectory()) {
		fs.readdir(file, function (err, files) {
			if (err) {
				console.log('读取目录失败.\r\n' + err);
			} else {
				for (var i = 0, len = files.length; i < len; i++) {
					resolve2i18n(file + '/' + files[i], i18n, callback);
				}
			}
			checkCallback(i18n, callback);
		});
	} else {
		fs.readFile(file, function (err, data) {
			console.log(file);
			if (err) {
				console.log('读取文件失败.\r\n' + err);
			} else {
				var reg = /E?UI\.i18n\(([''])(.+?)\1[^'']+([''])(.+?)\3/g, matchs;
				while (matchs = reg.exec(data)) {
					i18n[matchs[2]] = matchs[4];
				}
			}
			checkCallback(i18n, callback);
		});
	}
}

function checkCallback(i18n, callback) {
	if ((--callback.count) === 0) {
		callback.handler(callback.path, i18n);
	}
}

function readyFolder(file) {
	var path = __dirname, folders = file.substr(path.length).split('/');
	folders.pop();
	while (folders.length) {
		path += '/' + folders.shift();
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	}
}

function output4i18n(output, i18n) {
	var names = [], name;
	for (name in i18n) {
		names.push(name);
	}
	names.sort();
	var content = ['{'], len = names.length;
	for (var i = 0; i < len; i++) {
		name = names[i];
		content.push('\r\n    "', name, '": "', i18n[name], '",');
	}
	if (len > 0) {
		content[content.length - 1] = '"';
	}
	content.push('\r\n}');
	readyFolder(output);
	fs.writeFile(output, content.join(''), { encoding: 'utf-8' }, function (err) {
		if (err) {
			console.log('写文件失败\r\n' + err);
		} else {
			console.log('解析成功.');
		}
	})
}

(function (entry, output) {
	var i18n = {}, dir = __dirname + '/', callback = { path: dir + output, handler: output4i18n, count: 0 };
	for (var i = 0, len = entry.length; i < len; i++) {
		resolve2i18n(dir + entry[i], i18n, callback);
	}
})(['src/js/core', 'src/js/cmp'], 'server/i18n/client/zh-CN.json');