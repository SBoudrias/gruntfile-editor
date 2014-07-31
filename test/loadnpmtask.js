/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var fs = require('fs');
var GruntfileEditor = require('..');

describe('#loadNpmTask()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
  });

  it('is chainable', function () {
    assert.equal(this.editor.loadNpmTasks('time-grunt'), this.editor);
  });

  it('requires a String name', function () {
    var bound = this.editor.loadNpmTasks;
    var msg = /You must provide a plugin name/;
    assert(bound.bind(this.editor));
    assert.throws(bound.bind(this.editor), msg);
    assert.throws(bound.bind(this.editor, ''), msg);
    assert.throws(bound.bind(this.editor, ' '), msg);
    assert.throws(bound.bind(this.editor, {}), msg);
    assert.throws(bound.bind(this.editor, 42), msg);
    assert.throws(bound.bind(this.editor, false), msg);
    assert.throws(bound.bind(this.editor, true), msg);
    assert.throws(bound.bind(this.editor, 0), msg);
    assert.throws(bound.bind(this.editor, -1), msg);
    assert.throws(bound.bind(this.editor, [ 'an', 'array' ]), msg);
  });

  it('insert task plugin load if not existing', function () {
    assert(this.editor.gruntfile.toString().indexOf(
      'grunt.loadNpmTasks(\'grunt-contrib-concat\')'
    ) < 0);
    this.editor.loadNpmTasks('grunt-contrib-concat');
    assert(this.editor.gruntfile.toString().indexOf(
      'grunt.loadNpmTasks(\'grunt-contrib-concat\')'
    ) >= 0);
  });

  it('ignore duplicate loads', function () {
    assert(this.editor.gruntfile.toString().indexOf(
      'grunt.loadNpmTasks(\'grunt-contrib-concat\')'
    ) < 0);
    this.editor.loadNpmTasks('grunt-contrib-concat');
    this.editor.loadNpmTasks('grunt-contrib-concat');
    assert(this.editor.gruntfile.toString().indexOf(
      'grunt.loadNpmTasks(\'grunt-contrib-concat\')'
    ) >= 0);
  });
});
