const { RESTDataSource } = require('apollo-datasource-rest')
require('dotenv').config()
// constants
const YELP_API_BASE_URL = 'https://api.yelp.com/v3'

class EventAPI extends RESTDataSource {
  constructor () {
    super()
    this.baseURL = YELP_API_BASE_URL
  }

  // intercept fetch request to set Auth header
  willSendRequest (request) {
    request.headers.set('Authorization', String('Bearer ').concat(process.env.YELP_API_KEY))
  }

  async getAllEvents (city) {
    console.log(`city = ${city}`)
    const response = await this.get('events', { location: city }) // this.get
    if (Array.isArray(response.events)) {
      const evtList = response.events.map(async (event) => {
        const evt = this.eventReducer(event)
        console.log(`evt = ${JSON.stringify(evt)}`)
        return evt
      })
      return evtList
    }
    return []
  }

  async getAllFeaturedEvents (city) {
    console.log(`city = ${city}`)
    const response = await this.get('events/featured', { location: city }) // this.get
    if (Array.isArray(response.events)) {
      const evtList = response.events.map(async (event) => {
        const evt = this.eventReducer(event)
        console.log(`evt = ${JSON.stringify(evt)}`)
        return evt
      })
      return evtList
    }
    return []
  }

  async getEventById (eventId) {
    console.log(`eventId = ${eventId}`)
    const event = await this.get(`events/${eventId}`) // this.get
    return this.eventReducer(event)
  }

  eventReducer (event) {
    const evt = {
      id: event.id,
      name: event.name,
      description: event.description,
      category: event.category,
      isFree: event.is_free,
      location: {
        displayAddress: event.location.display_address[0]
      },
      timeStart: event.time_start,
      timeEnd: event.time_end,
      ticketsUrl: event.tickets_url,
      attendingCount: event.attending_count
    }
    return evt
  }
} // class

module.exports = {
  EventAPI
}
