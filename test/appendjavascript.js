'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#appendJavaScript()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.insert = helper.appendJavaScript;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.appendJavaScript('/* EOF */'), this.editor);
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

  it('append JS code at the end of grunt.initConfig', function () {
    this.editor.appendJavaScript('var filepath = "my path";');
    console.log(this.str());
    assert(this.str().indexOf('grunt.initConfig({});\n    var filepath = \'my path\';') >= 0);
  });
});
