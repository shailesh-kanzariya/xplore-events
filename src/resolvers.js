module.exports = {
  Query: {
    events: (_source, { city }, { dataSources }) =>
      dataSources.eventAPI.getAllEvents(city),
    featuredEvents: (_source, city, { dataSources }) =>
      dataSources.eventAPI.getAllFeaturedEvents(city),
    event: (_source, { id }, { dataSources }) =>
      dataSources.eventAPI.getEventById(id),
    me: (_source, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser()
  },
  Mutation: {
    login: async (_source, { email }, { dataSources }) => {
      console.log(`login: email = ${email}`)
      const userItem = await dataSources.userAPI.findOrCreateUser(email)
      if (userItem) {
        // return LoginResponse
        return Buffer.from(email).toString('base64')
      }
    },
    saveEvent: async (_source, { eventId }, { dataSources }) => {
      console.log(`saveEvent: eventId = ${eventId}`)
      const savedEventId = await dataSources.userAPI.saveEventForUser(eventId)
      console.log(`saveEvent: savedEventId = ${savedEventId}`)
      return savedEventId
    }
  },
  User: {
    savedEvents: (_source, __, { dataSources }) => {
      // #TODO: get saved eventIds for the user
      dataSources.userAPI.getSavedEventIdsByUser()
    }
  }
} // exports
/*
type User {
  id: ID!
  email: String!
  savedEvents: [Event]!
}
*/
