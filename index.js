const { task, parallel, watch } = require('gulp')

const init = require('./lib')

module.exports = function () {
  const options = {
    output: "dist",
  }

  task('build', parallel(init(options)))

  task('dev',() => watch('src/**/*', parallel(init(options))))
}
