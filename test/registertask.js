/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('#registerTask()', function () {
  beforeEach(function () {
    this.editor = new GruntfileEditor();
    this.register = helper.registerTask;
    this.str = helper.str;
  });

  it('is chainable', function () {
    assert.equal(this.editor.registerTask('build', 'foo'), this.editor);
  });

  describe('requires a name', function () {
    var msg = /You must provide a task group name/;

    it('requires a String name', function () {
      assert.throws(this.register(), msg);
      assert.throws(this.register(''), msg);
      assert.throws(this.register(' '), msg);
      assert.throws(this.register({}), msg);
      assert.throws(this.register(42), msg);
      assert.throws(this.register(false), msg);
      assert.throws(this.register(true), msg);
      assert.throws(this.register(0), msg);
      assert.throws(this.register(-1), msg);
      assert.throws(this.register([ 'an', 'array' ]), msg);
    });
  });

  describe('require task(s)', function () {
    var msg = /You must provide a task or an array of tasks/;

    it('as a String', function () {
      assert(this.register('name', 'task'));
      assert(this.register('name', '  task  '));
      assert.throws(this.register('name'), msg);
      assert.throws(this.register('name', ''), msg);
      assert.throws(this.register('name', ' '), msg);
    });

    it('as an Array', function () {
      assert(this.register('name', ['task']));
      assert(this.register('name', ['task', 'task2']));
      assert.throws(this.register('name'), msg);
      assert.throws(this.register('name', []), msg);
    });

    describe('does not yet accept:', function () {
      it('an object', function () {
        assert.throws(this.register('name', {}), msg);
      });

      it('an integer', function () {
        assert.throws(this.register('name', 4), msg);
      });

      it('a boolean', function () {
        assert.throws(this.register('name', false), msg);
        assert.throws(this.register('name', true), msg);
      });
    });
  });

  describe('optional options', function () {
    var msg = /If you provide options, they must be as an Object/;

    it('as an object', function () {
      assert(this.register('name', '  task  '));
      assert(this.register('name', 'task', {}));
      assert(this.register('name', 'task', null), msg);
      assert(this.register('name', 'task', false), msg);
      assert(this.register('name', 'task', { duplicates: true }), msg);
      assert.throws(this.register('name', 'task', 'options'), msg);
      assert.throws(this.register('name', 'task', ['options']), msg);
      assert.throws(this.register('name', 'task', /regex/), msg);
      assert.throws(this.register('name', 'task', new Number(1)), msg);
      assert.throws(this.register('name', 'task', function () {
        return true;
      }), msg);
    });
  });

  describe('insert into', function () {
    var gf;

    beforeEach(function () {
      gf = 'grunt.registerTask(\'deploy\', [' +
        '\n        \'foo\',' +
        '\n        \'bar\',' +
        '\n        \'baz\'';
    });

    describe('a new group', function () {
      it('a single task', function () {
        gf = 'grunt.registerTask(\'deploy\', [\'foo\'])';
        assert(this.str().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('a single task with a target', function () {
        gf = 'grunt.registerTask(\'deploy\', [\'foo:bar\'])';
        assert(this.str().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo:bar');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('an array of tasks', function () {
        gf +=  '\n    ])';
        assert(this.str().indexOf(gf) < 0);
        this.editor.registerTask('deploy', ['foo', 'bar', 'baz']);
        assert(this.str().indexOf(gf) >= 0);
      });

      it('a csv list of tasks', function () {
        gf +=  '\n    ])';
        assert(this.str().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo,bar,baz');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('a csv list (with spaces) of tasks', function () {
        gf += ',\n        \'cat\'\n    ])';
        assert(this.str().indexOf(gf) < 0);
        this.editor.registerTask('deploy', 'foo, bar,   baz,      cat');
        assert(this.str().indexOf(gf) >= 0);
      });
    });

    describe('an existing group with one item', function () {
      beforeEach(function () {
        gf = 'grunt.registerTask(\'exist\', [\n        \'bar\',';
        this.editor.registerTask('exist', 'bar');
      });

      it('a single task', function () {
        this.editor.registerTask('exist', 'foo');
        assert(this.str().indexOf(gf + '\n        \'foo\'\n    ])') >= 0);
      });

      it('a single task with a target', function () {
        this.editor.registerTask('exist', 'foo:bar');
        assert(this.str().indexOf(gf + '\n        \'foo:bar\'\n    ])') >= 0);
      });

      it('an array of tasks', function () {
        gf += '\n        \'foo\',\n        \'baz\'\n    ])';
        this.editor.registerTask('exist', ['foo', 'baz']);
        assert(this.str().indexOf(gf) >= 0);
      });

      it('not one task multiple times', function () {
        gf = 'grunt.registerTask(\'exist\', [\'bar\'])';
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'bar');
        this.editor.registerTask('exist', 'bar');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('one task multiple times', function () {
        gf += '\n        \'bar\',\n        \'bar\'\n    ])';
        this.editor.registerTask('exist', 'bar', { duplicates: true });
        this.editor.registerTask('exist', 'bar', { duplicates: true });
        assert(this.str().indexOf(gf) >= 0);
      });
    });

    describe('an existing group with many items', function () {
      beforeEach(function () {
        this.editor.registerTask('deploy', 'foo,bar,baz');
      });

      it('a single task', function () {
        gf += ',\n        \'cat\'\n    ])';
        this.editor.registerTask('deploy', 'cat');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('a single task with a target', function () {
        gf += ',\n        \'foo:bar\'\n    ])';
        this.editor.registerTask('deploy', 'foo:bar');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('an array of tasks', function () {
        gf += ',\n        \'cat\',' +
          '\n        \'bak\'' +
          '\n    ])';
        this.editor.registerTask('deploy', ['cat', 'bak']);
        assert(this.str().indexOf(gf) >= 0);
      });

      it('not one task multiple times', function () {
        gf += '\n    ])';
        this.editor.registerTask('deploy', 'foo');
        this.editor.registerTask('deploy', 'foo');
        this.editor.registerTask('deploy', 'bar');
        this.editor.registerTask('deploy', 'bar');
        this.editor.registerTask('deploy', 'baz');
        this.editor.registerTask('deploy', 'baz');
        assert(this.str().indexOf(gf) >= 0);
      });

      it('one task multiple times', function () {
        gf += ',\n        \'bar\',' +
          '\n        \'bar\'' +
          '\n    ])';
        this.editor.registerTask('deploy', 'bar', { duplicates: true });
        this.editor.registerTask('deploy', 'bar', { duplicates: true });
        assert(this.str().indexOf(gf) >= 0);
      });

      it('not an array of tasks multiple times', function () {
        this.editor.registerTask('deploy', ['foo', 'bar']);
        this.editor.registerTask('deploy', ['foo', 'bar']);
        this.editor.registerTask('deploy', ['foo', 'bar']);
        assert(this.str().indexOf(gf) >= 0);
      });

      it('an array of tasks multiple times', function () {
        gf += ',\n        \'foo\',' +
          '\n        \'bar\',' +
          '\n        \'baz\'' +
          '\n    ])';
        this.editor.registerTask('deploy', ['foo', 'bar', 'baz'], {
          duplicates: true
        });
        assert(this.str().indexOf(gf) >= 0);
      });
    })
  });
});
