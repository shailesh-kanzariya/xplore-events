const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as transport target
const debug = require('debug')('SimpleDynamoDBUtil')
const AWS = require('aws-sdk')
const { ValidationUtil } = require('./common-utils/ValidationUtil')
// constan values
const KEYTYPE_KEY_NAME = 'KeyType'
const HASH_KEY_TYPE = 'HASH'
const RANGE_KEY_TYPE = 'RANGE'
/**
 * creates a new object of SimpleDynamoDBUtil, exposes 'AWS DynamoDB' helper functions
 * @class SimpleDynamoDBUtil
 */
class SimpleDynamoDBUtil extends Object {
  /**
   * @param {JSON} [options=null] dynamodb config options
   */
  constructor (options = null) {
    super()
    if (options) {
      this.dynamodb = new AWS.DynamoDB(options)
      this.docClient = new AWS.DynamoDB.DocumentClient(options)
    } else {
      this.dynamodb = new AWS.DynamoDB()
      this.docClient = new AWS.DynamoDB.DocumentClient()
    }
  } // constructor

  /**
   * get table information including pk schema, indexes, created-on, provisioned throughput etc.
   * @param {string} tableName table about which to get information
   */
  async getTableInfo (tableName) {
    const funcName = 'getTableInfo: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      // prepare params
      const params = {
        TableName: tableName
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.dynamodb.describeTable(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getTableInfo

  /**
   * get table's key schema e.g. partition-key, sorty-key attributes and types
   * @param {string} tableName table for which to get key schema information
   */
  async getKeySchemaForTable (tableName) {
    const funcName = 'getKeySchemaForTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      debug(`${funcName}tableName = ${tableName}}`)
      const data = await this.getTableInfo(tableName)
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      debug(`${funcName}data.Table.KeySchema = ${JSON.stringify(data.Table.KeySchema)}`)
      return data.Table.KeySchema // key schema array
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getKeySchemaForTable

  /**
   * get hash key attribute name of the table
   * @param {string} tableName table for which to get hash key attribute name
   */
  async getHashKeyAttributeNameForTable (tableName) {
    const funcName = 'getHashKeyAttributeNameForTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      debug(`${funcName}tableName = ${tableName}}`)
      const data = await this.getTableInfo(tableName)
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      debug(`${funcName}data.Table.KeySchema = ${JSON.stringify(data.Table.KeySchema)}`)
      const tableKeySchemaList = data.Table.KeySchema
      let hashKeyAttributeName = null
      if (tableKeySchemaList && Array.isArray(tableKeySchemaList)) {
        // iterate both keys
        for (const keySchema of tableKeySchemaList) {
          debug(`${funcName}keySchema = ${JSON.stringify(keySchema)}`)
          // check key type if hash or range
          for (const key in keySchema) {
            if (Object.prototype.hasOwnProperty.call(keySchema, key)) {
              const keyVal = keySchema[key]
              debug(`${funcName}key = ${key}, keyVal = ${keyVal}`)
              if (key === KEYTYPE_KEY_NAME && keyVal === HASH_KEY_TYPE) {
                hashKeyAttributeName = keySchema.AttributeName
                debug(`${funcName}found hash key, hashKeyAttributeName = ${hashKeyAttributeName}`)
                break
              } // if
            } // if
          } //  for in
          if (hashKeyAttributeName !== null) {
            break
          }
        } // for of
      }
      return hashKeyAttributeName
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getKeySchemaForTable

  /**
   * get range key attribute name of the table
   * @param {string} tableName table for which to get range key attribute name
   */
  async getRangeKeyAttributeNameForTable (tableName) {
    const funcName = 'getRangeKeyAttributeNameForTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.dynamodb])
      debug(`${funcName}tableName = ${tableName}}`)
      const data = await this.getTableInfo(tableName)
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      debug(`${funcName}data.Table.KeySchema = ${JSON.stringify(data.Table.KeySchema)}`)
      const tableKeySchemaList = data.Table.KeySchema
      let rangeKeyAttributeName = null
      if (tableKeySchemaList && Array.isArray(tableKeySchemaList)) {
        // iterate both keys
        for (const keySchema of tableKeySchemaList) {
          debug(`${funcName}keySchema = ${JSON.stringify(keySchema)}`)
          // check key type if hash or range
          for (const key in keySchema) {
            if (Object.prototype.hasOwnProperty.call(keySchema, key)) {
              const keyVal = keySchema[key]
              debug(`${funcName}key = ${key}, keyVal = ${keyVal}`)
              if (key === KEYTYPE_KEY_NAME && keyVal === RANGE_KEY_TYPE) {
                rangeKeyAttributeName = keySchema.AttributeName
                debug(`${funcName}found range key, rangeKeyAttributeName = ${rangeKeyAttributeName}`)
                break
              } // if
            } // if
          } //  for in
          if (rangeKeyAttributeName !== null) {
            break
          }
        } // for of
      }
      return rangeKeyAttributeName
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getKeySchemaForTable

  /**
   * creates new item into the table
   * @param {string} tableName table in which new item to create
   * @param {JSON} itemJson new item to create
   * @param {Boolean} [shouldOverwriteExistingItem=true] overwrites existing item if item having same partition-key (pk) value already exist
   */
  async createNewItemInTable (tableName, itemJson, shouldOverwriteExistingItem = true) {
    const funcName = 'createNewItemInTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([itemJson, this.docClient])
      await ValidationUtil.isValidBoolean(shouldOverwriteExistingItem)
      // prepare params
      const params = {
        TableName: tableName,
        Item: itemJson,
        ReturnValues: 'ALL_OLD'
      }
      if (shouldOverwriteExistingItem === false) { // don't overwrite an existing item
        // get table's keyschema
        const pkAttributeName = await this.getHashKeyAttributeNameForTable(tableName)
        debug(`${funcName}pkAttributeName = ${pkAttributeName}`)
        if (!pkAttributeName) {
          winston.error(`${funcName}failed to get attribute name of partition key, pkAttributeName = ${pkAttributeName}`)
          throw (new Error(`${funcName}failed to get attribute name of partition key, pkAttributeName = ${pkAttributeName}`))
        }
        params.ConditionExpression = `attribute_not_exists(${pkAttributeName})`
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.put(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  /**
   * get specified item from table
   * @param {string} tableName table from which to get the item
   * @param {any} itemPkValue pk attribute-value of the item to get
   */
  async getItemFromTable (tableName, itemPkValue) {
    const funcName = 'getItemFromTable: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName])
      await ValidationUtil.isValidObject([this.docClient])
      debug(`${funcName}itemPkValue = ${itemPkValue}`)
      if (itemPkValue === null || itemPkValue === undefined) {
        winston.error(`${funcName}invalid param: itemPkValue = ${itemPkValue}`)
        throw (new Error(`${funcName}invalid param: itemPkValue = ${itemPkValue}`))
      }
      // get pk attribute name from table
      const pkAttributeName = await this.getHashKeyAttributeNameForTable(tableName)
      debug(`${funcName}pkAttributeName = ${pkAttributeName}`)
      if (!pkAttributeName) {
        winston.error(`${funcName}failed to get attribute name of partition key, pkAttributeName = ${pkAttributeName}`)
        throw (new Error(`${funcName}failed to get attribute name of partition key, pkAttributeName = ${pkAttributeName}`))
      }
      // prepare params
      const params = {
        TableName: tableName,
        Key: {}
      }
      params.Key[pkAttributeName] = itemPkValue // set pkAttributeName and its value
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.get(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      if (!data.Item) { // no 'Item' element returned if matching item not found
        debug(`${funcName} no matching item found`)
        return null
      }
      return data.Item
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem
  /**
   * simple query to the table
   * @param {string} tableName
   * @param {string} keyConditionExpression
   * @param {JSON} expressionAttributeNames
   * @param {JSON} expressionAttributeValues
   * @param {string} filterExpression
   * @param {string} projectionExpression
   */
  /*
  async queryTableSimple (tableName, keyConditionExpression, expressionAttributeNames, expressionAttributeValues, filterExpression = null, projectionExpression = null) {
    const funcName = 'queryTableSimple: '
    try {
      // validate input params
      await ValidationUtil.isValidString([tableName, keyConditionExpression])
      await ValidationUtil.isValidObject([this.docClient, expressionAttributeNames, expressionAttributeValues])
      // prepare params
      const params = {
        TableName: tableName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        FilterExpression: filterExpression,
        ProjectionExpression: projectionExpression
      }
      debug(`${funcName}params = ${JSON.stringify(params)}`)
      const data = await this.docClient.query(params).promise()
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // queryTableSimple
  */
} // class

module.exports = {
  SimpleDynamoDBUtil
}
