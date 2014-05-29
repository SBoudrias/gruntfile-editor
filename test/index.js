/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');

describe('GruntfileEditor', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
  });

  describe('#insertConfig()', function () {
    it('require a name', function () {
      assert.throws(this.editor.insertConfig.bind(this.editor));
    });

    it('require a task body', function () {
      assert.throws(this.editor.insertConfig.bind(this.editor, 'name'));
    });

    it('insert task config inside grunt.initConfig', function () {
      this.editor.insertConfig('compass', '{ foo: "bar" }');
      assert(this.editor.gruntfile.toString().indexOf('compass: { foo: \'bar\' }') >= 0);
    });

    it('last inserted task take precedence', function () {
      this.editor.insertConfig('compass', '{ foo: "bar" }');
      this.editor.insertConfig('compass', '{ yeo: "man" }');
      assert(this.editor.gruntfile.toString().indexOf('compass: { foo: \'bar\' }') < 0);
      assert(this.editor.gruntfile.toString().indexOf('compass: { yeo: \'man\' }') >= 0);
    });

    it('is chainable', function () {
      assert.equal(this.editor.insertConfig('compass', '{}'), this.editor);
    });
  });

  describe('#loadNpmTask()', function () {

    it('insert task plugin load if not existing', function () {
      this.editor.loadNpmTasks('grunt-contrib-concat');
      assert(this.editor.gruntfile.toString().indexOf('grunt.loadNpmTasks(\'grunt-contrib-concat\')') >= 0);
    });

    it('is chainable', function () {
      assert.equal(this.editor.loadNpmTasks('grunt-contrib-uglify'), this.editor);
    });

  });

  describe('#registerTask()', function () {
    beforeEach(function () {
      this.editor.registerTask('exist', 'bar');
    });

    it('insert task group if not existing', function () {
      this.editor.registerTask('deploy', 'foo');
      assert(this.editor.gruntfile.toString().indexOf('grunt.registerTask(\'deploy\', [\'foo\'])') >= 0);
    });

    it('use existing task group', function () {
      this.editor.registerTask('exist', 'foo');
      assert(this.editor.gruntfile.toString().indexOf('grunt.registerTask(\'exist\', [\n        \'bar\',\n        \'foo\'\n    ])') >= 0);
    });

    it('insert multiple items', function () {
      this.editor.registerTask('deploy', ['foo', 'bar']);
      assert(this.editor.gruntfile.toString().indexOf('grunt.registerTask(\'deploy\', [\n        \'foo\',\n        \'bar\'\n    ])') >= 0);
    });

    it('is chainable', function () {
      assert.equal(this.editor.registerTask('build', 'foo'), this.editor);
    });
  });

  describe('#insertVariable()', function () {
    it('insert variable to the top', function () {
      this.editor.insertVariable('paths', '"foo"');
      var file = this.editor.gruntfile.toString();
      var varIndex = file.indexOf('var paths = \'foo\'');
      var initIndex = file.indexOf('grunt.initConfig');
      assert(varIndex >= 0);
      assert(varIndex < initIndex, 'expected inserted variable to appear before grunt.initConfig');
    });

    it('is chainable', function () {
      assert.equal(this.editor.insertVariable('paths', '"foo"'), this.editor);
    });
  });
});
