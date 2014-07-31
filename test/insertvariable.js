/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var fs = require('fs');
var GruntfileEditor = require('..');

describe('#insertVariable()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
  });

  it('is chainable', function () {
    assert.equal(this.editor.insertVariable('paths', '"foo"'), this.editor);
  });

  it('requires a String name', function () {
    var bound = this.editor.insertVariable;
    var msg = /You must provide a variable name/;
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

  describe('require a config body', function () {
    var msg = /You must provide a variable value as a String/;

    it('as a String', function () {
      var bound = this.editor.insertVariable;
      assert(bound.bind(this.editor, 'name', 'hi there'));
      assert.throws(bound.bind(this.editor, 'name'), msg);
      assert.throws(bound.bind(this.editor, 'name', ''), msg);
      assert.throws(bound.bind(this.editor, 'name', ' '), msg);
    });

    describe('does not yet accept:', function () {
      it('an object', function () {
        assert.throws(
          this.editor.insertVariable.bind(this.editor, 'name', {}), msg
        );
      });

      it('an integer', function () {
        assert.throws(
          this.editor.insertVariable.bind(this.editor, 'name', 4), msg
        );
      });

      it('a boolean', function () {
        assert.throws(
          this.editor.insertVariable.bind(this.editor, 'name', false), msg
        );
        assert.throws(
          this.editor.insertVariable.bind(this.editor, 'name', true), msg
        );
      });

      it('an array', function () {
        assert.throws(this.editor.insertVariable.bind(this.editor, 'name', [
          42, 'life', { sunshine: 'good' }
        ]));
        assert.throws(
          this.editor.insertVariable.bind(this.editor, 'name', []), msg
        );
      });
    });
  });

  beforeEach(function () {
    this.editor.insertVariable('compass', '27');
  });

  it('insert task config inside grunt.initConfig', function () {
    assert(this.editor.gruntfile.toString().indexOf(
      'var compass = 27'
    ) >= 0);
  });

  it('insert variable to the top', function () {
    this.editor.insertVariable('paths', '"foo"');
    var file = this.editor.gruntfile.toString();
    var varIndex = file.indexOf('var paths = \'foo\'');
    var initIndex = file.indexOf('grunt.initConfig');
    assert(varIndex >= 0);
    assert(
      varIndex < initIndex,
      'expected inserted variable to appear before grunt.initConfig'
    );
  });

  it('updates variable', function () {
    this.editor.insertVariable('paths', '"foo"');
    this.editor.insertVariable('paths', '"bar"');
    var file = this.editor.gruntfile.toString();
    var bar = file.indexOf('var paths = \'bar\'');
    var foo = file.indexOf('var paths = \'foo\'');
    assert(bar >= 0);
    assert(foo < 0);
  });

  it('inserts variable referencing another variable', function () {
    this.editor.insertVariable('paths', 'foo');
    var file = this.editor.gruntfile.toString();
    var foo = file.indexOf('var paths = foo');
    assert(foo > 0);
  });

  it('updates variable referencing another variable', function () {
    this.editor.insertVariable('paths', 'foo');
    this.editor.insertVariable('paths', 'bar');
    var file = this.editor.gruntfile.toString();
    var bar = file.indexOf('var paths = bar');
    var foo = file.indexOf('var paths = foo');
    assert(bar >= 0);
    assert(foo < 0);
  });

  it('inserts variable requiring something', function () {
    this.editor.insertVariable(
      'paths',
      'require(\'./.yo-rc.json\')[\'generator-angular\']'
    );
    var file = this.editor.gruntfile.toString();
    var foo = file.indexOf(
      'var paths = require(\'./.yo-rc.json\')[\'generator-angular\']'
    );
    assert(foo > 0);
  });

  it('updates variable requiring something', function () {
    this.editor.insertVariable(
      'paths',
      'require(\'./.yo-rc.json\')[\'foo\']'
    );
    this.editor.insertVariable(
      'paths',
      'require(\'./.yo-rc.json\')[\'bar\']'
    );
    var file = this.editor.gruntfile.toString();
    var foo = file.indexOf(
      'var paths = require(\'./.yo-rc.json\')[\'foo\']'
    );
    var bar = file.indexOf(
      'var paths = require(\'./.yo-rc.json\')[\'bar\']'
    );
    assert(bar >= 0);
    assert(foo < 0);
  });
});
