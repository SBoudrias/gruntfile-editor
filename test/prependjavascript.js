/* globals describe, it, beforeEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#prependJavaScript()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.insert = helper.prependJavaScript;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.prependJavaScript('require(\'load-grunt-tasks\')(grunt);'), this.editor);
  });

  it('as a String', function () {
    var msg = /You must provide code to be inserted/;

    assert(this.insert(' code '));
    assert.throws(this.insert(), msg);
    assert.throws(this.insert(''), msg);
    assert.throws(this.insert(' '), msg);
    assert.throws(this.insert({}), msg);
    assert.throws(this.insert(42), msg);
    assert.throws(this.insert(false), msg);
    assert.throws(this.insert(true), msg);
    assert.throws(this.insert(0), msg);
    assert.throws(this.insert(-1), msg);
    assert.throws(this.insert(['an', 'array']), msg);
  });

  it('insert require call inside grunt.initConfig', function () {
    this.editor.prependJavaScript('require(\'load-grunt-tasks\')(grunt);');
    assert(this.str().indexOf('require(\'load-grunt-tasks\')(grunt);') >= 0);
  });
});
