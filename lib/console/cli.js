'use strict';

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var out = require('./out');
var args = require('./args');

var options = [{
  name: 'admin',
  flag: 'a',
  param: 'port',
  "default": 8889,
  description: 'Port for admin portal. Defaults to 8889.'
},{
  name: 'cert',
  flag: 'c',
  param: 'file',
  "default": "" + __dirname + "/../../tls/cert.pem",
  description: 'Certificate file. Use with --key.'
},{
  name: 'data',
  flag: 'd',
  param: 'file',
  description: 'Data file to pre-load endoints. YAML or JSON format.'
},{
  name: 'help',
  flag: 'h',
  "default": false,
  description: 'This help text.'
},{
  name: 'key',
  flag: 'k',
  param: 'file',
  "default": "" + __dirname + "/../../tls/key.pem",
  description: 'Private key file. Use with --cert.'
},{
  name: 'location',
  flag: 'l',
  param: 'hostname',
  "default": '0.0.0.0',
  description: 'Hostname at which to bind stubby.'
},{
  name: 'mute',
  flag: 'm',
  description: 'Prevent stubby from printing to the console.'
},{
  name: 'pfx',
  flag: 'p',
  param: 'file',
  description: 'PFX file. Ignored if used with --key/--cert'
},{
  name: 'stubs',
  flag: 's',
  param: 'port',
  "default": 8882,
  description: 'Port for stubs portal. Defaults to 8882.'
},{
  name: 'tls',
  flag: 't',
  param: 'port',
  "default": 7443,
  description: 'Port for https stubs portal. Defaults to 7443.'
},{
  name: 'version',
  flag: 'v',
  description: 'Prints stubby\'s version number.'
},{
  name: 'watch',
  flag: 'w',
  description: 'Auto-reload data file when edits are made.'
},{
  name: 'latency',
  flag: 'o',
  param: 'milliseconds',
  "default": 0,
  description: 'Global latency delay when not defined in a route.'
}];

function help(go) {
  if (go == null) { go = false; }
  if (!go) { return; }

  out.log(args.helpText(options, 'stubby'));
  process.exit();
}

function version(go) {
  if (go == null) { go = false; }

  var version = (require('../../package.json')).version;

  if (!go) { return version; }

  out.log(version);
  process.exit();
}

function data(filename) {
  if (filename === null) { return []; }

  var filedata = [];

  try {
    filedata = (fs.readFileSync(filename, 'utf8')).trim();
  } catch (e) {
    out.warn('File "' + filename + '" could not be found. Ignoring...');
    return [];
  }

  try {
    return yaml.load(filedata);
  } catch (e) {
    out.warn('Couldn\'t parse "' + filename + '" due to syntax errors:');
    out.log(e.message);
    process.exit(0);
  }
}

function key(file) { return readFile(file, 'pem'); }
function cert(file) { return readFile(file, 'pem'); }
function pfx(file) { return readFile(file, 'pfx'); }

function readFile(filename, type) {
  if (filename === null) { return null; }

  var filedata = fs.readFileSync(filename, 'utf8');
  var extension = filename.replace(/^.*\.([a-zA-Z0-9]+)$/, '$1');

  if (!filedata) { return null; }

  if (extension !== type) {
    out.warn('[' + flag + ', ' + option + '] only takes files of type .' + type + '. Ignoring...');
    return null;
  }

  return filedata.trim();
}

function getArgs(argv) {
  if (argv == null) { argv = process.argv; }

  var params = args.parse(options, argv);
  params.datadir = path.resolve(path.dirname(params.data));

  if (params.watch) { params.watch = params.data; }

  var self = this;
  options.forEach(function (option) {
    if (self[option.name] != null) {
      params[option.name] = self[option.name](params[option.name]);
    }
  });

  return params;
}

module.exports = {
  options: options,
  help: help,
  version: version,
  data: data,
  key: key,
  cert: cert,
  pfx: pfx,
  readFile: readFile,
  getArgs: getArgs
};
