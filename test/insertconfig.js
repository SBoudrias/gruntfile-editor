/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var fs = require('fs');
var GruntfileEditor = require('..');

describe('#insertConfig()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
  });

  it('is chainable', function () {
    assert.equal(this.editor.insertConfig('compass', '{}'), this.editor);
  });

  it('requires a String name', function () {
    var bound = this.editor.insertConfig;
    var msg = /You must provide a task name/;
    assert(bound.bind(this.editor, 'name'));
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
    var msg = /You must provide a task configuration body as a String/;

    it('as a String', function () {
      var bound = this.editor.insertConfig;
      assert(bound.bind(this.editor, 'name', 'hi there'));
      assert.throws(bound.bind(this.editor, 'name'), msg);
      assert.throws(bound.bind(this.editor, 'name', ''), msg);
      assert.throws(bound.bind(this.editor, 'name', ' '), msg);
    });

    describe('does not yet accept:', function () {
      it('an object', function () {
        assert.throws(
          this.editor.insertConfig.bind(this.editor, 'name', {}), msg
        );
      });

      it('an integer', function () {
        assert.throws(
          this.editor.insertConfig.bind(this.editor, 'name', 4), msg
        );
      });

      it('a boolean', function () {
        assert.throws(
          this.editor.insertConfig.bind(this.editor, 'name', false), msg
        );
        assert.throws(
          this.editor.insertConfig.bind(this.editor, 'name', true), msg
        );
      });

      it('an array', function () {
        assert.throws(this.editor.insertConfig.bind(this.editor, 'name', [
          42, 'life', { sunshine: 'good' }
        ]));
        assert.throws(
          this.editor.insertConfig.bind(this.editor, 'name', []), msg
        );
      });
    });
  });

  beforeEach(function () {
    this.editor.insertConfig('compass', '{ foo: "bar" }');
  });

  it('insert task config inside grunt.initConfig', function () {
    assert(this.editor.gruntfile.toString().indexOf(
      'compass: { foo: \'bar\' }'
    ) >= 0);
  });

  it('last inserted task take precedence', function () {
    this.editor.insertConfig('compass', '{ yeo: "man" }');
    assert(this.editor.gruntfile.toString().indexOf(
      'compass: { foo: \'bar\' }'
    ) < 0);
    assert(this.editor.gruntfile.toString().indexOf(
      'compass: { yeo: \'man\' }'
    ) >= 0);
  });

  it('updates task config inside grunt.initConfig', function () {
    this.editor.insertConfig('compass', '{ foo: "baz" }');
    assert(this.editor.gruntfile.toString().indexOf(
      'compass: { foo: \'baz\' }'
    ) >= 0);
    assert(this.editor.gruntfile.toString().indexOf(
      'compass: { foo: \'bar\' }'
    ) < 0);
  });
});
