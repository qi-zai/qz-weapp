const { task, parallel, watch } = require('gulp')

const init = require('./lib')

module.exports = function (options) {
  const handlers = init({
    output: "dist",
    ...options,
    componentsMappers: {},
  })

  task('build', parallel(
    handlers(['clean', 'vue2tpl', 'vue2css', 'vue2js', 'cpfile'])
  ))

  task('dev', function () {
    watch('src/**/*', parallel(
      handlers(['vue2tpl', 'vue2css', 'vue2js', 'cpfile'])
    )).on('change', function (event) {
      console.log(event)
    })
  })
}
