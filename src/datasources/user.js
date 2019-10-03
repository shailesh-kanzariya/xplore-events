const winston = require('winston')
winston.add(new winston.transports.Console()) // add Console as transport target
// const debug = require('debug')('user')
const { DataSource } = require('apollo-datasource')
const isEmail = require('isemail')
const utils = require('./../utils')
const { ValidationUtil } = require('./../lambda-layers/common-layer/nodejs/ValidationUtil')
const { DynamoDBTableUtil } = require('./../lambda-layers/aws-utils-layer/nodejs/DynamoDBTableUtil')
// constants
const USERS_DDB_TABLE_NAME = 'users'

class UserAPI extends DataSource {
  async init () {
    const funcName = 'init: '
    try {
      const ddbConfigOptions = await utils.getDynamoDBConfigOptions()
      this.usersTableUtil = new DynamoDBTableUtil(USERS_DDB_TABLE_NAME, ddbConfigOptions)
      this.eventIdListAttributeName = 'eventIdList'
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  async initialize (config) {
    console.log('datasource initialize')
    this.context = config.context
    await this.init() // set up ddb configs and create users-table-util
    console.log('datasource initialize done')
  }

  async findOrCreateUser (emailArg) {
    const funcName = 'findOrCreateUser: '
    try {
      if (this.context && this.context.user) {
        console.log(`${funcName}this.context.user = ${JSON.stringify(this.context.user)}`)
      }
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
      const userEmail = this.context.user.email
      console.log(`${funcName}userEmail = ${userEmail}`)
      if (!userEmail) return
      // fetch saved events by quering to DDB
      return []
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getSavedEventsByUser

  async saveEventForUser (eventId) {
    const funcName = 'saveEventForUser: '
    try {
      console.log(`${funcName}eventId = ${eventId}`)
      if (!eventId) {
        winston.error(`${funcName} invalid event id = ${eventId}`)
        return null
      }
      const userEmail = this.context.user.email
      console.log(`${funcName}userEmail = ${userEmail}`)
      if (!userEmail) {
        winston.error(`${funcName} invalid user email = ${userEmail}`)
        return null
      }
      const eventIdList = await this.getEventIdListForUser(userEmail)
      // check if eventId already exist
      if (eventIdList && eventIdList.includes(eventId)) {
        winston.error(`${funcName} event already exist in user's saved event list`)
        return 'This event is already saved and exist in your saved event list'
      }
      // save event for the user in DDB
      const updatedEventIdList = await this.usersTableUtil.updateItemByAppendingList(userEmail, this.eventIdListAttributeName, [eventId])
      console.log(`updatedEventIdList = ${JSON.stringify(updatedEventIdList)}`)
      return eventId
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // saveEventForUser

  async unSaveEventForUser (eventId) {
    const funcName = 'unSaveEventForUser: '
    try {
      console.log(`${funcName}eventId = ${eventId}`)
      if (!eventId) {
        winston.error(`${funcName} invalid event id = ${eventId}`)
        return null
      }
      const userEmail = this.context.user.email
      console.log(`${funcName}userEmail = ${userEmail}`)
      if (!userEmail) {
        winston.error(`${funcName} invalid user email = ${userEmail}`)
        return null
      }
      // get eventIDList for the user
      const eventIdList = await this.getEventIdListForUser(userEmail)
      if (!(eventIdList && Array.isArray(eventIdList))) {
        winston.error(`${funcName} invalid event id list for attribute: ${this.eventIdListAttributeName}`)
        throw (new Error(`${funcName} invalid event id list for attribute: ${this.eventIdListAttributeName}`))
      }
      // check if event exist in the list
      if (!eventIdList.includes(eventId)) {
        // no eventId exist in the eventIdList, so no need to go for remove process
        return 'Error: given event do not exist in your saved event list'
      }
      // delete eventId
      const updatedItem = await this.usersTableUtil.updateItemByRemovingList(userEmail, this.eventIdListAttributeName, [eventId])
      console.log(`${funcName}updatedItem = ${JSON.stringify(updatedItem)}`)
      return eventId
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // unSaveEventForUser

  async getEventIdListForUser (userEmail) {
    const funcName = 'getEventIdListForUser: '
    try {
      await ValidationUtil.isValidString([userEmail])
      // get the item
      const userItem = await this.usersTableUtil.getItem(userEmail)
      console.log(`userItem = ${JSON.stringify(userItem)}`)
      if (!userItem) {
        winston.error(`${funcName} invalid user item = ${userItem}`)
        throw (new Error(`${funcName} invalid user item`))
      }
      const eventIdList = userItem[this.eventIdListAttributeName]
      console.log(`eventIdList = ${JSON.stringify(eventIdList)}`)
      if (eventIdList && Array.isArray(eventIdList)) {
        return eventIdList
      }
      return null
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getEventIdListForUser
} // class
module.exports = {
  UserAPI
}
