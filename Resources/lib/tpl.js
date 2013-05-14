/**
 * FoodCare City - FoodCare City
 * Author: FoodCare Inc. Copyright 2013. All Rights Reserved
 **/

// Based on - Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
// http://ejohn.org/blog/javascript-micro-templating/

var fs = require('/lib/filesystem').filesystem;

function renderFile(template, data) {
	var tplPath = fs.resourcesDirectory + 'templates';
	var template = fs.file_get_contents(tplPath, template);
	return render(template, data);
}

function compile(string) {

	tpl = string.replace(/[\r\t\n]/g, " ").replace(/\'/g, '"').split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'");

	func = "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + tpl + "');}return p.join('');";

	return new Function("obj", func);
}

function render_c(fn, data) {
	return fn(data);
}

function render(string, data) {
	return render_c(compile(string), data);
}

exports.renderFile = renderFile;

