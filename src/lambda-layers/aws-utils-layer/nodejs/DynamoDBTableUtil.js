const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as trsport target
const debug = require('debug')('DynamoDBTableUtil')
const { SimpleDynamoDBUtil } = require('./SimpleDynamoDBUtil')
const { ValidationUtil } = require('./common-utils/ValidationUtil')

/**
 * creates a new object of DynamoDBTableUtil, exposes 'AWS DynamoDB Table' helper functions
 * @class DynamoDBTableUtil
 */
class DynamoDBTableUtil extends SimpleDynamoDBUtil {
  /**
   * @param {*} tableName name of the table for which to create the object
   * @param {*} [options=null] dynamodb config options
   */
  constructor (tableName, options = null) {
    const funcName = 'constructor:'
    if (options) {
      super(options)
    } else {
      super()
    }
    if (!tableName || typeof tableName !== 'string' || String(tableName).length <= 0) {
      winston.error(`${funcName}invalid tableName: = ${tableName}`)
      throw (new Error(`${funcName}invalid tableName: = ${tableName}`))
    }
    this.tableName = tableName
  } // constructor

  /**
   * initializes the DynamoDBTableUtil object by setting hash and range key attribute names
   */
  async init () {
    const funcName = 'init: '
    try {
      debug(`${funcName}this.tableName = ${this.tableName}`)
      await ValidationUtil.isValidString([this.tableName])
      // get hash and range key attributes name and set to this
      const hashKeyAttributeName = await super.getHashKeyAttributeNameForTable(this.tableName)
      debug(`${funcName}hashKeyAttributeName = ${hashKeyAttributeName}`)
      const rangeKeyAttributeName = await super.getRangeKeyAttributeNameForTable(this.tableName)
      debug(`${funcName}rangeKeyAttributeName = ${rangeKeyAttributeName}`)
      // validate both key values are valid
      await ValidationUtil.isValidString([hashKeyAttributeName])
      // now, set to this
      this.hashKeyAttributeName = hashKeyAttributeName
      if (rangeKeyAttributeName) {
        this.rangeKeyAttributeName = rangeKeyAttributeName
      }
      return this
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  }

  /**
   * creates new item in table, if similar item already exist then this does not overwrite instead it throws an error
   * @param {JSON} itemJson item to create
   */
  async createNewItem (itemJson) {
    const funcName = 'createNewItem: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([itemJson])
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const data = await super.createNewItemInTable(this.tableName, itemJson, false) // don;t overwrite
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  /**
   * creates new item if similar item already does not exist in table, instead it overwrites and replaces existing item with new item
   * @param {*} itemJson item to create
   */
  async createNewOrReplaceItem (itemJson) {
    const funcName = 'createNewOrReplaceItem: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([itemJson])
      debug(`${funcName}itemJson = ${JSON.stringify(itemJson)}`)
      const data = await super.createNewItemInTable(this.tableName, itemJson) // overwrite existing similar item if exist
      return data
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // createNewItem

  /**
   * get specified item from table
   * @param {*} itemPkValue value of partition-key attribute of the item to get
   */
  async getItem (itemPkValue) {
    const funcName = 'getItem: '
    try {
      // validate input params
      if (itemPkValue === null || itemPkValue === undefined) {
        winston.error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`)
        throw (new Error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`))
      }
      debug(`${funcName}itemPkValue = ${itemPkValue}`)
      const dataItem = await super.getItemFromTable(this.tableName, itemPkValue)
      debug(`${funcName}dataItem = ${JSON.stringify(dataItem)}`)
      return dataItem
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // getItem

  /**
   * find the specified item, if not found then create it
   * @param {JSON} itemJSON item to find or create
   */
  async findOrCreateItem (itemJSON) {
    const funcName = 'findOrCreateItem: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([itemJSON])
      debug(`${funcName}itemJSON = ${JSON.stringify(itemJSON)}`)
      const hashKeyAttributeName = await super.getHashKeyAttributeNameForTable(this.tableName)
      debug(`${funcName}hashKeyAttributeName = ${hashKeyAttributeName}`)
      if (!hashKeyAttributeName) {
        winston.error(`${funcName}invalid haskkey attribute name: ${hashKeyAttributeName}`)
        throw (new Error(`${funcName}invalid haskkey attribute name: ${hashKeyAttributeName}`))
      }
      // get value of hashkey from itemJSON
      const itemPkValue = itemJSON[hashKeyAttributeName]
      if (!itemPkValue) {
        winston.error(`${funcName}invalid haskkey attribute value: ${itemPkValue}`)
        throw (new Error(`${funcName}invalid haskkey attribute value: ${itemPkValue}`))
      }
      // first, try to get an item
      const dataItem = await super.getItemFromTable(this.tableName, itemPkValue)
      debug(`${funcName}dataItem = ${JSON.stringify(dataItem)}`)
      if (dataItem) {
        return dataItem
      }
      // else create that item
      const data = await super.createNewItemInTable(this.tableName, itemJSON)
      debug(`${funcName}data = ${JSON.stringify(data)}`)
      return itemJSON // return item that created successfully
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // findOrCreateItem

  /**
   * updates an item by appending the list to the existing list. If there is no existing list then
   *  it simply creates emptly list first and appends the 'newList' for specified 'listAttributeName' of the item
   * If the specified item does not exist then it adds the new item to the table
   * @param {any} itemPkValue pk value of the item to update
   * @param {String} listAttributeName attribute name for which to append the list
   * @param {Array} listToAppend list to append
   */
  async updateItemByAppendingList (itemPkValue, listAttributeName, listToAppend) {
    const funcName = 'updateItemByAppendingList: '
    try {
      // validate input params
      if (itemPkValue === null || itemPkValue === undefined) {
        winston.error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`)
        throw (new Error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`))
      }
      debug(`${funcName}itemPkValue = ${itemPkValue}`)
      await ValidationUtil.isValidString([listAttributeName, this.tableName])
      await ValidationUtil.isValidObject([listToAppend])
      const updatedItem = await super.updateItemInTableByAppendingList(this.tableName, itemPkValue, listAttributeName, listToAppend)
      debug(`${funcName}updatedItem = ${JSON.stringify(updatedItem)}`)
      return updatedItem
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // updateItemByAppendingList

  /**
   * updates an item by removing elements-list from the existing list.
   * Specified item and item-attribute must exist in the table
   * @param {any} itemPkValue pk value of the item to update
   * @param {String} listAttributeName attribute name for which to remove the list
   * @param {Array} listToRemove list to remove
   */
  async updateItemByRemovingList (itemPkValue, listAttributeName, listToRemove) {
    const funcName = 'updateItemByRemovingList: '
    try {
      // validate input params
      await ValidationUtil.isValidObject([listToRemove])
      if (!(listToRemove && Array.isArray(listToRemove))) { // must be an array
        winston.error(`${funcName}invalid param: listToRemove = ${listToRemove}`)
        throw (new Error(`${funcName}invalid param: listToRemove = ${listToRemove}`))
      }
      debug(`${funcName}listToRemove = ${JSON.stringify(listToRemove)}`)
      if (itemPkValue === null || itemPkValue === undefined) {
        winston.error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`)
        throw (new Error(`${funcName}invalid value: itemPkValue = ${itemPkValue}`))
      }
      debug(`${funcName}itemPkValue = ${itemPkValue}`)
      await ValidationUtil.isValidString([listAttributeName, this.tableName])
      const updatedItem = await super.updateItemInTableByRemovingList(this.tableName, itemPkValue, listAttributeName, listToRemove)
      debug(`${funcName}updatedItem = ${JSON.stringify(updatedItem)}`)
      return updatedItem
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // updateItemByRemovingList
} // class
module.exports = {
  DynamoDBTableUtil
}
