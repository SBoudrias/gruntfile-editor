/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#loadNpmTask()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.load = helper.load;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.loadNpmTasks('time-grunt'), this.editor);
  });

  describe('requires a name', function () {
    var msg = /You must provide a plugin name/;

    it('as a string or array', function () {
      assert(this.load('name'));
      assert(this.load(' name '));
      assert(this.load(['foo', 'bar']));
      assert(this.load(['foo    ', '   bar   ']));
      assert.throws(this.load(), msg);
      assert.throws(this.load(''), msg);
      assert.throws(this.load(' '), msg);
      assert.throws(this.load([]), msg);
      assert.throws(this.load(['']), msg);
      assert.throws(this.load([{}]), msg);
      assert.throws(this.load({}), msg);
      assert.throws(this.load(42), msg);
      assert.throws(this.load(false), msg);
      assert.throws(this.load(true), msg);
      assert.throws(this.load(0), msg);
      assert.throws(this.load(-1), msg);
    });
  });

  describe('inserts', function () {
    var loadTask = 'grunt.loadNpmTasks(\'grunt-contrib-concat\');';
    it('insert task plugin from string if not existing', function () {
      assert(this.str().indexOf(loadTask) < 0);
      this.editor.loadNpmTasks('  grunt-contrib-concat  ');
      assert(this.str().indexOf(loadTask) >= 0);
    });
    it('insert task plugin from array if not existing', function () {
      assert(this.str().indexOf(loadTask) < 0);
      this.editor.loadNpmTasks(['  grunt-contrib-concat  ']);
      assert(this.str().indexOf(loadTask) >= 0);
    });

    it('ignore duplicate loads', function () {
      assert(this.str().indexOf(loadTask) < 0);
      this.editor.loadNpmTasks(['grunt-contrib-concat  ',' grunt-contrib-concat']);
      assert(this.str().indexOf(loadTask) === this.str().lastIndexOf(loadTask));
    });
  });
});
