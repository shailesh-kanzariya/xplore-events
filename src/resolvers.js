// resolver (parent, args, context, info)
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
      if (savedEventId) {
        return savedEventId
      }
      return 'Error: error occured when saving the event'
    },
    unsaveEvent: async (_source, { eventId }, { dataSources }) => {
      console.log(`unsaveEvent: eventId = ${eventId}`)
      const savedEventId = await dataSources.userAPI.unSaveEventForUser(eventId)
      console.log(`unsaveEvent: savedEventId = ${savedEventId}`)
      if (savedEventId) {
        return savedEventId
      }
      return 'Error: error occured when unsaving the event'
    }
  },
  User: {
    savedEvents: async (parent, args, { dataSources }) => {
      console.log('User: savedEvents called.....')
      console.log(`User: parent = ${JSON.stringify(parent)}`)
      const eventIdList = parent.SavedEventId
      console.log(`User: eventIdList = ${JSON.stringify(eventIdList)}`)
      // get eventDetails for each eventId
      const eventsList = []
      for (const eventId of eventIdList) {
        console.log(`User: eventId = ${eventId}`)
        const evt = await dataSources.eventAPI.getEventById(eventId)
        eventsList.push(evt)
      } // for
      console.log(`User: eventsList = ${JSON.stringify(eventsList)}`)
      return eventsList
    } // savedEvents
  }
} // exports
/*
type User {
  email: String!
  savedEvents: [Event]!
}
*/
