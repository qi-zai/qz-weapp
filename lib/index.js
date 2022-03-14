const { src, dest } = require('gulp');
const del = require('del');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify')
let transform = require('./transform')

const handlers = {
  clean() {
    return del(`${this.output}/**/*`)
  },

  vue2tpl() {
    return src('src/**/*.vue')
      .pipe(transform('tpl'))
      .pipe(dest(this.output))
  },

  vue2css() {
    return src('src/**/*.vue')
      .pipe(transform('style'))
      .pipe(sass()).pipe(transform('css2wxss'))
      .pipe(dest(this.output))
  },

  vue2js() {
    return src('src/**/*.vue')
      .pipe(transform('js'))
      .pipe(uglify())
      .pipe(dest(this.output))
  },

  cpfile() {
    return src(['src/page.config.js', 'src/**/*.{scss,js,json}', 'src/app.js'])
      .pipe(transform('handleComponents'))
      .pipe(transform('handleAppJSON'))
      .pipe(dest(this.output))
  },
}

module.exports = function (options) {
  transform = transform.bind(options)
  for (const k in handlers) {
    handlers[k] = handlers[k].bind(options)
  }

  return (task) => task.map(k => handlers[k])
}
