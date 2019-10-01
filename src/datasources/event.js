const { RESTDataSource } = require('apollo-datasource-rest')

class EventAPI extends RESTDataSource {
  constructor () {
    super()
    this.baseURL = 'https://api.yelp.com/v3'
  }

  async getAllEvents ({ eventCity }) {
    const response = await this.get('events', { location: eventCity })
    return Array.isArray(response)
      ? response.map(event => { this.eventReducer(event) })
      : []
  }

  async getEventById ({ eventId }) {
    const response = await this.get('events', { id: eventId })
    return this.eventReducer(response[0])
  }

  eventReducer (event) {
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      category: event.category,
      isFree: event.isFree,
      location: {
        displayAddress: event.location.displayAddress
      },
      timeStart: event.timeStart,
      timeEnd: event.timeEnd,
      ticketsUrl: event.ticketsUrl,
      attendingCount: event.attendingCount
    }
  }
} // class

module.exports = {
  EventAPI
}
