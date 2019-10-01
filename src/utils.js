const winston = require('winston')
winston.add(new winston.transports.Console()) // add Console as transport target
const debug = require('debug')('utils')
// load env vars
require('dotenv').config()

async function getDynamoDBConfigOptions () {
  const funcName = 'getDynamoDBConfigOptions: '
  try {
    const ddbConfigOptions = {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: 'us-east-2'
    }
    debug(`${funcName}ddbConfigOptions = ${JSON.stringify(ddbConfigOptions)}`)
    return ddbConfigOptions
  } catch (error) {
    winston.error(`${funcName}error = ${error}`)
    throw (error)
  }
}
module.exports = {
  getDynamoDBConfigOptions
}
