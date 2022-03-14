const { obj } = require('through2')

const parser = require('./parser')

module.exports = function (fileType, options) {
  return obj((file, encoding, next) => {
    if (!parser[fileType]) next()

    parser[fileType](file, this)

    next(null, file)
  })
}