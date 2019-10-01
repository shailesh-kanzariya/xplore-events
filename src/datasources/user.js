const winston = require('winston')
winston.add(new winston.transports.Console()) // add Console as transport target
const debug = require('debug')('user')
const { DataSource } = require('apollo-datasource')
const { isEmail } = require('isemail')
const utils = require('./../utils')
const { DynamoDBTableUtil } = require('./../lambda-layers/aws-utils-layer/nodejs/DynamoDBTableUtil')
// constants
const USERS_DDB_TABLE_NAME = 'users'

class UserAPI extends DataSource {
  async init () {
    const funcName = 'init: '
    try {
      const ddbConfigOptions = utils.getDynamoDBConfigOptions()
      this.usersTableUtil = new DynamoDBTableUtil(USERS_DDB_TABLE_NAME, ddbConfigOptions)
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  initialize (config) {
    this.context = config.context
  }

  async findOrCreateUser ({ email: emailArg } = {}) {
    const funcName = 'findOrCreateUser: '
    try {
      const email = this.context && this.context.user ? this.context.user.email : emailArg
      if (!email || !isEmail.validate(email)) {
        return null
      }
      const itemJson = { email: emailArg }
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const userItem = await this.usersTableUtil.findOrCreateItem(itemJson)
      return userItem
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }
} // class
module.exports = {
  UserAPI
}
