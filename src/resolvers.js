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
  }
} // exports
