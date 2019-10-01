module.exports = {
  Query: {
    events: (_, { city }, { dataSources }) =>
      dataSources.eventAPI.getAllEvents(city),
    featuredEvents: (_, { city }, { dataSources }) =>
      dataSources.eventAPI.getAllFeaturedEvents(city),
    event: (_, { id }, { dataSources }) =>
      dataSources.eventAPI.getEventById(id),
    me: (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser()
  }
} // exports
