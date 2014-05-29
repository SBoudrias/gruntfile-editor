'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var Tree = require('ast-query');

/**
 * A class managing the edition of the project Gruntfile content. Editing the Gruntfile
 * using this class allow easier Generator composability as they can work and add parts
 * to the same Gruntfile without having to parse the Gruntfile AST themselves.
 * @constructor
 * @param  {String} gruntfileContent - The project's actual Gruntfile.js content
 */

var GruntfileEditor = module.exports = function (gruntfileContent) {
  gruntfileContent = gruntfileContent || fs.readFileSync(path.join(__dirname, 'default-gruntfile.js'));
  this.gruntfile = new Tree(gruntfileContent.toString());
};

/**
 * Insert a configuration section inside the Gruntfile.js (`grunt.initConfig`)
 * @param  {String} name   - Key name of the configuration block
 * @param  {String} config - Configuration content code as a string.
 * @return {this}
 */

GruntfileEditor.prototype.insertConfig = function (name, config) {
  assert(_.isString(name), 'You must provide a task name');
  assert(_.isString(config), 'You must provide a task configuration body as String');
  this.gruntfile.callExpression('grunt.initConfig').arguments.at(0)
    .key(name).value(config);
  return this;
};

/**
 * Load a Grunt plugin
 * @param {String}               pluginName - name of the plugin to load (ex: 'grunt-contrib-uglify')
 * @return {this}
 */

GruntfileEditor.prototype.loadNpmTasks = function (pluginName) {
  this.gruntfile.assignment('module.exports').value().body.prepend(
    'grunt.loadNpmTasks("' + pluginName + '");'
  );
  return this;
};

/**
 * Register a task inside a named task group
 * @param {String}               name  - Task group name
 * @param {String|Array[String]} tasks - Tasks name to insert in the group
 * @return {this}
 */

GruntfileEditor.prototype.registerTask = function (name, tasks) {
  var current = this.gruntfile.callExpression('grunt.registerTask').filter(function (node) {
    return node.arguments[0].value === name;
  });
  tasks = _.isArray(tasks) ? tasks : [tasks];
  if (!current.length) {
    this.gruntfile.assignment('module.exports').value().body.append(
      'grunt.registerTask("' + name + '", ["' + tasks.join('","') + '"])'
    );
  } else {
    tasks.forEach(function (task) {
      current.arguments.at(1).push('"' + task + '"');
    });
  }
  return this;
};

/**
 * Add a variable declaration to the Gruntfile
 * @param {String} name  - Variable name
 * @param {String} value
 * @return {this}
 */

GruntfileEditor.prototype.insertVariable = function (name, value) {
  var current = this.gruntfile.var(name);
  if (current.length) {
    current.value(value);
  } else {
    this.gruntfile.assignment('module.exports').value().body
      .prepend('var ' + name + ' = ' + value);
  }
  return this;
};

GruntfileEditor.prototype.toString = function () {
  return this.gruntfile.toString();
};
