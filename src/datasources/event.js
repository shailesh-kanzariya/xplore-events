const { RESTDataSource } = require('apollo-datasource-rest')
require('dotenv').config()
class EventAPI extends RESTDataSource {
  constructor () {
    super()
    this.baseURL = 'https://api.yelp.com/v3'
  }

  async getAllEvents ({ eventCity }) {
    console.log(`eventCity = ${eventCity}`)
    const response = await this.get('events', undefined, {
      location: 'NewYork',
      headers: {
        Authorization: String('Bearer ').concat(process.env.YELP_API_KEY)
      }
    }) // this.get
    if (Array.isArray(response.events)) {
      const evtList = response.events.map(async (event) => {
        const evt = await this.eventReducer(event)
        console.log(`evt = ${JSON.stringify(evt)}`)
        return evt
      })
      return evtList
    }
    return []
  }

  async getEventById ({ eventId }) {
    const response = await this.get('events', {
      id: eventId,
      headers: {
        Authorization: String('Bearer ').concat(process.env.YELP_API_KEY)
      }
    }) // this.get
    return this.eventReducer(response[0])
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
