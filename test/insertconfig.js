/* globals describe, it, beforeEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#insertConfig()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.insert = helper.insertConfig;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.insertConfig('compass', '{}'), this.editor);
  });

  describe('requires a name', function () {
    var msg = /You must provide a task name/;

    it('as a String', function () {
      assert(this.insert('name'));
      assert(this.insert('name    '));
      assert.throws(this.insert(msg));
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
  });

  describe('requires a config body', function () {
    var msg = /You must provide a task configuration body as a String/;

    it('as a String', function () {
      assert(this.insert('name', 'hi there'));
      assert(this.insert('name', '  hi there  '));
      assert.throws(this.insert('name'), msg);
      assert.throws(this.insert('name', ''), msg);
      assert.throws(this.insert('name', ' '), msg);
    });

    describe('does not yet accept:', function () {
      it('an object', function () {
        assert.throws(this.insert('name', {}), msg);
      });

      it('an integer', function () {
        assert.throws(this.insert('name', 4), msg);
      });

      it('a boolean', function () {
        assert.throws(this.insert('name', false), msg);
        assert.throws(this.insert('name', true), msg);
      });

      it('an array', function () {
        assert.throws(this.insert('name', [5, 'la', {b: 'c'}]));
        assert.throws(this.insert('name', []), msg);
      });
    });
  });

  describe('inserts', function () {
    var gf = 'compass: { foo: \'bar\' }';

    beforeEach(function () {
      this.editor.insertConfig(' compass ', ' { foo: "bar" } ');
    });

    it('a task config', function () {
      assert(this.str().indexOf(gf) >= 0);
    });

    it('the last inserted task config taking precedence', function () {
      this.editor.insertConfig('compass', '{ yeo: "man" }');
      assert(this.str().indexOf(gf) < 0);
      assert(this.str().indexOf('compass: { yeo: \'man\' }') >= 0);
    });

    it('an updated task config', function () {
      this.editor.insertConfig('compass', '{ foo: "baz" }');
      assert(this.str().indexOf(gf) < 0);
      assert(this.str().indexOf(gf.replace('bar', 'baz')) >= 0);
    });
  });

  describe('inserts sub task', function () {
    it('add sub task ', function () {
      // add first sub task. create parent if not exist.
      this.editor.insertConfig('compass.src1', JSON.stringify({
        files: ['./src1/**']
      }));

      this.editor.insertConfig('compass.src2', JSON.stringify({
        files: ['./src2/**']
      }));

      assert.equal(
        this.str().replace(/\s/g, ''), "module.exports=function(grunt){'usestrict';grunt.initConfig({compass:{src1:{'files':['./src1/**']},src2:{'files':['./src2/**']}}});};"
      );
    });
  });
});
