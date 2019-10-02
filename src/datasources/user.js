const winston = require('winston')
winston.add(new winston.transports.Console()) // add Console as transport target
// const debug = require('debug')('user')
const { DataSource } = require('apollo-datasource')
const isEmail = require('isemail')
const utils = require('./../utils')
const { DynamoDBTableUtil } = require('./../lambda-layers/aws-utils-layer/nodejs/DynamoDBTableUtil')
// constants
const USERS_DDB_TABLE_NAME = 'users'

class UserAPI extends DataSource {
  async init () {
    const funcName = 'init: '
    try {
      const ddbConfigOptions = await utils.getDynamoDBConfigOptions()
      console.log(`ddbConfigOptions = ${JSON.stringify(ddbConfigOptions)}`)
      this.usersTableUtil = new DynamoDBTableUtil(USERS_DDB_TABLE_NAME, ddbConfigOptions)
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  async initialize (config) {
    this.context = config.context
    await this.init() // set up ddb configs and create users-table-util
  }

  async findOrCreateUser (emailArg) {
    const funcName = 'findOrCreateUser: '
    try {
      console.log(`${funcName}this.context = ${this.context}`)
      console.log(`${funcName}emailArg = ${emailArg}`)
      const email = this.context && this.context.user ? this.context.user.email : emailArg
      console.log(`${funcName}email = ${email}`)
      if (!email || !isEmail.validate(email)) {
        return null
      }
      const itemJson = { email: emailArg }
      console.log(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const userItem = await this.usersTableUtil.findOrCreateItem(itemJson)
      console.log(`${funcName}userItem = ${JSON.stringify(userItem)}`)
      return userItem
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  async getSavedEventsByUser () {
    const funcName = 'getSavedEventsByUser: '
    try {
      const userId = this.context.user.userId
      console.log(`${funcName}userId = ${userId}`)
      // fetch saved events by quering to DDB
      return []
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }
} // class
module.exports = {
  UserAPI
}
