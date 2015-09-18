#!/usr/bin/env node

var fs = require('fs');
var http = require("http");
var minimist = require('minimist');
var exec = require('child_process').exec;
var cheerio = require("cheerio");

var argv = minimist(process.argv.slice(2), {
    alias: {
        l: [ 'ls', 'list'],
        h: 'help'
    }
});

var _url = "http://nodeschool.io/";

function _puts(error, stdout, stderr) { 
    process.stdout.write(stdout);
}

function _isOptionalArg(value) {
  return value.indexOf('-') !== 0
}

function _download(url, callback) {
  http.get(url, function(res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on("end", function() {
      callback(data);
    });
  }).on("error", function() {
    callback(null);
  });
}

function _parseModuleName(command) {
    var arr = command.split(' ').slice(2);
    return arr.filter(_isOptionalArg)[0];
}

function _checkInstalled(moduleName) {
    var existsPath = 'if [ -x "$(command -v ' + moduleName + ')" ]; then echo "' + moduleName + ' INSTALLED" >&1; else echo "' + moduleName + ' NOT INSTALLED" >&1; fi';
    exec(existsPath, _puts);
}

if (argv.list) {
    _download(_url, function (data) {
        if (data) {
            var $ = cheerio.load(data);
            $('.workshopper[id] code').each(function (i, e) {
                var moduleName = _parseModuleName($(this).text());
                _checkInstalled(moduleName);
            });
        } else {
            console.error('Could not reach nodeschool website. Please retry soon.')
        }
    });
} else {
    return fs.createReadStream(__dirname + '/usage.txt')
        .pipe(process.stdout);    
}