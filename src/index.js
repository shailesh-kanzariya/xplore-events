const { ApolloServer } = require('apollo-server')
const typeDefs = require('./schema')
const { EventAPI } = require('./datasources/event')
const { UserAPI } = require('./datasources/user')
const resolvers = require('./resolvers')

// create Apollo server instance and configure datasources
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    eventAPI: new EventAPI(),
    userAPI: new UserAPI()
  })
}) // server

server.listen().then(({ url }) => {
  console.log(`server started at ${url}`)
})
