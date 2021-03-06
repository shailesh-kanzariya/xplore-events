require('dotenv').config()
const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const { EventAPI } = require('./datasources/event')
const { UserAPI } = require('./datasources/user')
const resolvers = require('./resolvers')
const isEmail = require('isemail')
// constants
const TEST_USER_EMAIL = 'john.dpe@xploreevents.com'

// create Apollo server instance and configure datasources
const server = new ApolloServer({
  context: async ({ req }) => {
    const authVal = (req.headers && req.headers.authorization) || ''
    const email = Buffer.from(authVal, 'base64').toString('ascii')
    console.log(`context func: email = ${email}`)
    if (!isEmail.validate(email)) {
      console.log('context func: invalid email, so returing user = null')
      return { user: null }
    }
    if (email !== TEST_USER_EMAIL) {
      console.log(`context: ${email} invalid user, only test user allowed.....`)
      return null
    }
    const userAPI = new UserAPI()
    // init the userAPI
    await userAPI.init()
    const userItem = await userAPI.findOrCreateUser(email)
    console.log(`context func: userItem  = ${JSON.stringify(userItem)}`)
    if (userItem) {
      return { user: userItem }
    }
    return null
  },
  typeDefs,
  resolvers,
  dataSources: () => {
    console.log('initializing datasources...')
    return {
      eventAPI: new EventAPI(),
      userAPI: new UserAPI()
    }
  }
}) // server

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`server started at ${url}`)
})
