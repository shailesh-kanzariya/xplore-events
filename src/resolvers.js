module.exports = {
  Query: {
    events: (_, { city }, { dataSources }) =>
      dataSources.eventAPI.getAllEvents(city),
    event: (_, { id }, { dataSources }) =>
      dataSources.eventAPI.getEventById(id),
    me: (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser()
  }
} // exports
