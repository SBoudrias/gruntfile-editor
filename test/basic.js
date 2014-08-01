/*globals describe, it */
'use strict';

var assert = require('assert');
var GruntfileEditor = require('..');
var helper = require('./helpers');

describe('GruntfileEditor', function () {
  it('uses default file', function () {
    this.editor = new GruntfileEditor();
    assert.equal(helper.str.call(this), helper.read('default-gruntfile.js'));
  });

  it('loads the custom file', function () {
    var loaded = helper.read('test/fixtures/custom-gruntfile.js');
    this.editor = new GruntfileEditor(loaded);
    assert.equal(helper.str.call(this), loaded);
  });
});
