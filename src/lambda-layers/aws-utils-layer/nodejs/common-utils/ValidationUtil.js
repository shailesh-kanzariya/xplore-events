const winston = require('winston')
winston.add(new winston.transports.Console()) // add console as transport target
const debug = require('debug')('ValidationUtil')
require('dotenv').config()

/**
 * ValidationUtil Class: Performs various 'data validations' i.e. is valid string type?, is valid Integer?, is valid email? etc.
 * @class  ValidationUtil
 */
class ValidationUtil extends Object {
  /**
   * validates that the each string is not 'null', not 'undefined', its type is 'string' and its length is greater than zero
   * @param {Array} strListToValidate list of string items to validate
   * @param {Boolean} [invalidateEmptyString=true] invalidate if string is empty
   */
  static async isValidString (strListToValidate, invalidateEmptyString = true) {
    const funcName = 'isValidString: '
    const invalidParamsList = []
    try {
      debug(`${funcName}strListToValidate = ${JSON.stringify(strListToValidate)}, invalidateEmptyString = ${invalidateEmptyString}`)
      if (!(strListToValidate && Array.isArray(strListToValidate))) {
        winston.error(`invalid input parameter: strListToValidate = ${JSON.stringify(strListToValidate)}`)
        throw (new Error(`invalid input parameter: strListToValidate = ${JSON.stringify(strListToValidate)}`))
      } // if
      // in case of only one item, avoid for loop
      if (strListToValidate.length === 1) {
        debug(`${funcName}strListToValidate length = 1, so not going to iterate for loop`)
        const stringElement = strListToValidate[0]
        debug(`${funcName}stringElement = ${stringElement}`)
        if (!(stringElement !== null && stringElement !== undefined && typeof stringElement === 'string')) {
          debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
          invalidParamsList.push(stringElement)
        } else if (invalidateEmptyString === true) {
          if (!String(stringElement).length > 0) {
            debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
            invalidParamsList.push(stringElement)
          } // if
        } // else if
      } else {
        // validate each string-element from the list
        for (const stringElement of strListToValidate) {
          debug(`${funcName}stringElement = ${stringElement}`)
          if (!(stringElement !== null && stringElement !== undefined && typeof stringElement === 'string')) {
            debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
            invalidParamsList.push(stringElement)
          } else if (invalidateEmptyString === true) {
            if (!String(stringElement).length > 0) {
              debug(`${funcName}pushing invalid param stringElement = ${stringElement}`)
              invalidParamsList.push(stringElement)
            } // if
          } // else if
        } // for of
      } // else
      if (invalidParamsList.length > 0) {
        debug(`${funcName}invalidParamsList = ${JSON.stringify(invalidParamsList)}`)
        throw (new Error(`invalid data, invalidParamsList = ${JSON.stringify(invalidParamsList)}`))
      } // if
      return strListToValidate
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // function isValidString

  /**
   * validates that the each object is not 'null' and not 'undefined'
   * @param {Array} objListToValidate
   */
  static async isValidObject (objListToValidate) {
    const funcName = 'objListToValidate: '
    const invalidParamsList = []
    try {
      debug(`${funcName}objListToValidate = ${JSON.stringify(objListToValidate)}`)
      if (!(objListToValidate && Array.isArray(objListToValidate))) {
        winston.error(`invalid input parameter: objListToValidate = ${JSON.stringify(objListToValidate)}`)
        throw (new Error(`invalid input parameter: objListToValidate = ${JSON.stringify(objListToValidate)}`))
      } // if
      // in case of only one item, avoid for loop
      if (objListToValidate.length === 1) {
        debug(`${funcName}objListToValidate length = 1, so not going to iterate for loop`)
        const obj = objListToValidate[0]
        debug(`${funcName}obj = ${JSON.stringify(obj)}`)
        if (!(obj !== null && obj !== undefined && typeof obj === 'object')) {
          debug(`${funcName}pushing invalid param obj = ${obj}`)
          invalidParamsList.push(obj)
        } // if
      } else {
        // validate each object from the list
        for (const obj of objListToValidate) {
          debug(`${funcName}obj = ${JSON.stringify(obj)}`)
          if (!(obj !== null && obj !== undefined && typeof obj === 'object')) {
            debug(`${funcName}pushing invalid param obj = ${obj}`)
            invalidParamsList.push(obj)
          } // if
        } // for of
      } // else
      if (invalidParamsList.length > 0) {
        debug(`${funcName}invalidParamsList = ${JSON.stringify(invalidParamsList)}`)
        throw (new Error(`invalid data, invalidParamsList = ${JSON.stringify(invalidParamsList)}`))
      } // if
      return objListToValidate
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // function

  /**
   * validates that value of parameter is of valid Boolean type (true or false) and it is not null, undefined
   * @param {Boolean} inParamValue parameter value to check
   */
  static async isValidBoolean (inParamValue) {
    const funcName = 'isValidBoolean: '
    try {
      if (!(inParamValue !== null && inParamValue !== undefined && typeof inParamValue === 'boolean')) {
        debug(`${funcName}invalid data type, inParamValue = ${inParamValue}`)
        throw (new Error(`invalid data type, inParamValue = ${inParamValue}`))
      } // if
      debug(`${funcName}inParamValue = ${inParamValue}`)
      return inParamValue
    } catch (error) {
      winston.error(`${funcName}error = ${error}`)
      throw (error)
    }
  } // function
} // class

module.exports = {
  ValidationUtil
}
