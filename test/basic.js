/*globals describe, it, beforeEach, afterEach */
'use strict';

var assert = require('assert');
var fs = require('fs');
var GruntfileEditor = require('..');

describe('GruntfileEditor', function () {
  describe('default file', function () {
    it('uses default file', function () {
      this.editor = new GruntfileEditor();
      assert.equal(
        this.editor.gruntfile.toString(),
        fs.readFileSync('default-gruntfile.js', 'utf-8').trim()
      );
    });
  });

  describe('existing file', function () {
    var loaded = fs.readFileSync(
      'test/fixtures/custom-gruntfile.js', 'utf-8'
    ).trim();
    it('loads the custom file', function () {
      this.editor = new GruntfileEditor(loaded);
      assert.equal(this.editor.gruntfile.toString(), loaded);
    });
  });
});
