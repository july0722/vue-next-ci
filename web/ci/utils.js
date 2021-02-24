const fs = require('fs')
const dotenv = require('dotenv')
const { join } = require('path')

exports.resolve = dir => join(process.cwd(), dir)

exports.env = envPath => {
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath))
    for (const key in envConfig) {
      process.env[key] = envConfig[key]
    }
  }
}
