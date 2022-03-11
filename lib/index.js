const { src, dest } = require('gulp');
const transform = require('./transform')

function cpfile() {
  return src(['src/**/*.{scss,js,json}', 'src/app.js']).pipe(dest(this.output))
}

function vue2tpl() {
  return src('src/**/*.vue').pipe(transform('tpl')).pipe(dest(this.output))
}

function vue2css() {
  return src('src/**/*.vue').pipe(transform('style')).pipe(dest(this.output))
}

function vue2js() {
  return src('src/**/*.vue').pipe(transform('js')).pipe(dest(this.output))
}

module.exports = function (options) {
  return [
    cpfile,
    vue2tpl,
    vue2css,
    vue2js,
  ].map((fn) => fn.bind(options))
}
