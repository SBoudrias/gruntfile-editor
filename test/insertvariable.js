/*globals describe, it, beforeEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#insertVariable()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.insert = helper.insertVariable;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.insertVariable('paths', '"foo"'), this.editor);
  });

  describe('requires a name', function () {
    var msg = /You must provide a variable name/;

    it('as a String', function () {
      assert(this.insert(' name '));
      assert.throws(this.insert(), msg);
      assert.throws(this.insert(''), msg);
      assert.throws(this.insert(' '), msg);
      assert.throws(this.insert({}), msg);
      assert.throws(this.insert(42), msg);
      assert.throws(this.insert(false), msg);
      assert.throws(this.insert(true), msg);
      assert.throws(this.insert(0), msg);
      assert.throws(this.insert(-1), msg);
      assert.throws(this.insert([ 'an', 'array' ]), msg);
    });
  });

  describe('require a config body', function () {
    var msg = /You must provide a variable value as a String/;

    it('as a String', function () {
      assert(this.insert('name', 'hi there'));
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
        assert.throws(this.insert('name', [ 5, 'a', { b: 'c' } ]));
        assert.throws(this.insert('name', []), msg);
      });
    });
  });

  describe('inserts/updates', function () {
    it('insert task config inside grunt.initConfig', function () {
      this.editor.insertVariable(' compass ', '27');
      assert(this.str().indexOf('var compass = 27') >= 0);
    });

    it('insert variable to the top', function () {
      this.editor.insertVariable('paths', '"foo"');
      var varIndex = this.str().indexOf('var paths = \'foo\'');
      assert(varIndex >= 0);
      assert(varIndex < this.str().indexOf('grunt.initConfig'));
    });

    it('updates variable', function () {
      this.editor.insertVariable('paths', '"foo"');
      this.editor.insertVariable('paths', '"bar"');
      assert(this.str().indexOf('var paths = \'bar\'') >= 0);
      assert(this.str().indexOf('var paths = \'foo\'') < 0);
    });

    it('inserts variable referencing another variable', function () {
      this.editor.insertVariable('paths', 'foo');
      assert(this.str().indexOf('var paths = foo') > 0);
    });

    it('updates variable referencing another variable', function () {
      this.editor.insertVariable('paths', 'foo');
      this.editor.insertVariable('paths', 'bar');
      assert(this.str().indexOf('var paths = bar') >= 0);
      assert(this.str().indexOf('var paths = foo') < 0);
    });

    it('inserts variable requiring something', function () {
      var req = 'require(\'./.yo-rc.json\')[\'generator-angular\']';
      this.editor.insertVariable('paths', req);
      assert(this.str().indexOf('var paths = ' + req) > 0);
    });

    it('updates variable requiring something', function () {
      var req = 'require(\'./.yo-rc.json\')[\'foo\']';
      var paths = 'var paths = ' + req;
      this.editor.insertVariable('paths', req);
      this.editor.insertVariable('paths', req.replace('foo', 'bar'));
      assert(this.str().indexOf(paths) < 0);
      assert(this.str().indexOf(paths.replace('foo', 'bar')) >= 0);
    });
  });
});
