const { obj } = require('through2')

const parser = require('./parser')

module.exports = function (fileType) {
  return obj((file, encoding, next) => {
    if (!parser[fileType]) next()

    parser[fileType](file)

    next(null, file)
  })
}