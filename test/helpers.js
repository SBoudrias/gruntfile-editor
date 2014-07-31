module.exports = {
  str: function () {
    return this.editor.gruntfile.toString();
  },

  read: function (file) {
    return require('fs').readFileSync(file, 'utf-8').trim();
  },

  insertConfig: function (name, body) {
    return this.editor.insertConfig.bind(this.editor, name, body);
  },

  insertVariable: function (name, value) {
    return this.editor.insertVariable.bind(this.editor, name, value);
  },

  load: function (plugin) {
    return this.editor.loadNpmTasks.bind(this.editor, plugin);
  }
};
