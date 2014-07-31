/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var fs = require('fs');
var GruntfileEditor = require('..');

describe('#registerTask()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
  });

  it('is chainable', function () {
    assert.equal(this.editor.registerTask('build', 'foo'), this.editor);
  });

  it('requires a String name', function () {
    var bound = this.editor.registerTask;
    var msg = /You must provide a task group name/;
    assert(bound.bind(this.editor, ' name '));
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

  describe('require task(s)', function () {
    var msg = /You must provide a task or an array of tasks/;

    it('as a String', function () {
      var bound = this.editor.registerTask;
      assert(bound.bind(this.editor, 'name', 'task'));
      assert(bound.bind(this.editor, 'name', '  task  '));
      assert.throws(bound.bind(this.editor, 'name'), msg);
      assert.throws(bound.bind(this.editor, 'name', ''), msg);
      assert.throws(bound.bind(this.editor, 'name', ' '), msg);
    });

    it('as an Array', function () {
      var bound = this.editor.registerTask;
      assert(bound.bind(this.editor, 'name', ['task']));
      assert(bound.bind(this.editor, 'name', ['task', 'task2']));
      assert.throws(bound.bind(this.editor, 'name'), msg);
      assert.throws(bound.bind(this.editor, 'name', []), msg);
    });

    describe('does not yet accept:', function () {
      it('an object', function () {
        assert.throws(
          this.editor.registerTask.bind(this.editor, 'name', {}), msg
        );
      });

      it('an integer', function () {
        assert.throws(
          this.editor.registerTask.bind(this.editor, 'name', 4), msg
        );
      });

      it('a boolean', function () {
        assert.throws(
          this.editor.registerTask.bind(this.editor, 'name', false), msg
        );
        assert.throws(
          this.editor.registerTask.bind(this.editor, 'name', true), msg
        );
      });
    });
  });

  describe('insert into', function () {
    describe('a new group', function () {
      it('insert single task', function () {
        var gf = 'grunt.registerTask(\'deploy\', [\'foo\'])';
        assert(this.editor.gruntfile.toString().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo');
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });

      it('insert single task with a target', function () {
        var gf = 'grunt.registerTask(\'deploy\', [\'foo:bar\'])';
        assert(this.editor.gruntfile.toString().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo:bar');
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });

      it('insert array of tasks', function () {
        var gf = 'grunt.registerTask(\'deploy\', [' +
          '\n        \'foo\',' +
          '\n        \'bar\',' +
          '\n        \'baz\'' +
          '\n    ])';
        assert(this.editor.gruntfile.toString().indexOf(gf) < 0);
        this.editor.registerTask('deploy', ['foo', 'bar', 'baz']);
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });

      it('insert csv list of tasks', function () {
        var gf = 'grunt.registerTask(\'deploy\', [' +
          '\n        \'foo\',' +
          '\n        \'bar\',' +
          '\n        \'baz\'' +
          '\n    ])';
        assert(this.editor.gruntfile.toString().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo,bar,baz');
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });

      it('insert csv list (with spaces) of tasks', function () {
        var gf = 'grunt.registerTask(\'deploy\', [' +
          '\n        \'foo\',' +
          '\n        \'bar\',' +
          '\n        \'baz\',' +
          '\n        \'cat\'' +
          '\n    ])';
        assert(this.editor.gruntfile.toString().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo, bar,   baz,      cat');
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });
    });

    describe('an existing group with one item', function () {
      var gf = 'grunt.registerTask(\'exist\', [\n        \'bar\',';

      beforeEach(function () {
        this.editor.registerTask('exist', 'bar');
      });

      it('insert single task', function () {
        this.editor.registerTask('exist', 'foo');
        assert(this.editor.gruntfile.toString().indexOf(
          gf + '\n        \'foo\'\n    ])'
        ) >= 0);
      });

      it('insert single task with a target', function () {
        this.editor.registerTask('exist', 'foo:bar');
        assert(this.editor.gruntfile.toString().indexOf(
          gf + '\n        \'foo:bar\'\n    ])'
        ) >= 0);
      });

      it('insert array of tasks', function () {
        this.editor.registerTask('exist', ['foo', 'baz']);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          '\n        \'foo\',' +
          '\n        \'baz\'' +
          '\n    ])'
        ) >= 0);
      });

      it('do not insert one task multiple times', function () {
        var gf = 'grunt.registerTask(\'exist\', [\'bar\'])';
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'bar');
        assert(this.editor.gruntfile.toString().indexOf(gf) >= 0);
      });

      it('do insert one task multiple times', function () {
        this.editor.registerTask('exist', 'bar', true);
        assert(this.editor.gruntfile.toString().indexOf(
          gf + '\n        \'bar\'\n    ])'
        ) >= 0);
        this.editor.registerTask('exist', 'bar', true);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          '\n        \'bar\',' +
          '\n        \'bar\'' +
          '\n    ])'
        ) >= 0);
      });
    });

    describe('an existing group with many items', function () {
      var gf = 'grunt.registerTask(\'exist\', [' +
      '\n        \'bar\',' +
      '\n        \'baz\',' +
      '\n        \'ban\'';

      beforeEach(function () {
        this.editor.registerTask('exist', 'bar,baz,ban');
      });

      it('insert single task', function () {
        this.editor.registerTask('exist', 'foo');
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'foo\'' +
          '\n    ])'
        ) >= 0);
      });

      it('insert single task with a target', function () {
        this.editor.registerTask('exist', 'foo:bar');
        assert(this.editor.gruntfile.toString().indexOf(
          gf + ',\n        \'foo:bar\'\n    ])'
        ) >= 0);
      });

      it('insert array of tasks', function () {
        this.editor.registerTask('exist', ['foo', 'bak']);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'foo\',' +
          '\n        \'bak\'' +
          '\n    ])'
        ) >= 0);
      });

      it('do not insert one task multiple times', function () {
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'baz');
        this.editor.registerTask('exist', 'baz');
        this.editor.registerTask('exist', 'ban');
        this.editor.registerTask('exist', 'ban');
        assert(this.editor.gruntfile.toString().indexOf(
          gf + '\n    ])'
        ) >= 0);
      });

      it('do insert one task multiple times', function () {
        this.editor.registerTask('exist', 'bar', true);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'bar\'' +
          '\n    ])'
        ) >= 0);
        this.editor.registerTask('exist', 'bar', true);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'bar\',' +
          '\n        \'bar\'' +
          '\n    ])'
        ) >= 0);
      });

      it('do not insert array of tasks multiple times', function () {
        this.editor.registerTask('exist', ['foo', 'bak']);
        this.editor.registerTask('exist', ['foo', 'bak']);
        this.editor.registerTask('exist', ['foo', 'bak']);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'foo\',' +
          '\n        \'bak\'' +
          '\n    ])'
        ) >= 0);
      });

      it('do insert array of tasks multiple times', function () {
        this.editor.registerTask('exist', ['bar', 'baz', 'ban'], true);
        assert(this.editor.gruntfile.toString().indexOf(
          gf +
          ',\n        \'bar\',' +
          '\n        \'baz\',' +
          '\n        \'ban\'' +
          '\n    ])'
        ) >= 0);
      });
    })
  });
});
