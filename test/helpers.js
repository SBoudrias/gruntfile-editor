var assert = require('assert');
var noDef = ' is not defined';

module.exports = {
  str: function () {
    assert(this.editor.gruntfile.toString, 'gruntfile.toString' + noDef);
    return this.editor.gruntfile.toString();
  },

  read: function (file) {
    return require('fs').readFileSync(file, 'utf-8').trim();
  },

  insertConfig: function (name, body) {
    assert(this.editor.insertConfig, 'insertConfig' + noDef);
    return this.editor.insertConfig.bind(this.editor, name, body);
  },

  insertVariable: function (name, value) {
    assert(this.editor.insertVariable, 'insertVariable' + noDef);
    return this.editor.insertVariable.bind(this.editor, name, value);
  },

  load: function (plugin) {
    assert(this.editor.loadNpmTasks, 'loadNpmTasks' + noDef);
    return this.editor.loadNpmTasks.bind(this.editor, plugin);
  },

  registerTask: function (group, tasks, multi) {
    assert(this.editor.registerTask, 'registerTask' + noDef);
    return this.editor.registerTask.bind(this.editor, group, tasks, multi);
  },
};
