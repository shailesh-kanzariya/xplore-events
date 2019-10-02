const { gql } = require('apollo-server')

const typeDefs = gql`
  # define all data fetching operations in Query
  type Query {
    events(city: String!): [Event]!
    featuredEvents(city: String!): [Event]!
    event(id:String!): Event
    # Queries for the current user
    me: User
  }
  # define Event object
  type Event {
    id: String!
    name: String!
    description: String!
    category: String!
    isFree: Boolean!
    location: Location!
    timeStart: String!
    timeEnd: String!
    ticketsUrl: String
    attendingCount: Int!
  }
  # define event Location
  type Location {
    displayAddress: String!
  }
  # define User
  type User {
    email: ID!
    savedEvents: [Event]!
  }
  # define mutation response interface
  interface MutationResponse {
    # http status code
    code: String!
    # operation result success or fail
    success: Boolean!
    # informative message
    message: String
  }
  # define supported mutations
  type Mutation {
    saveEvent(eventId: String!): SaveEventResponse!
    unsaveEvent(eventId: String!): UnsaveEventResponse!
    login(email: String!): String! # login token
  }
  # define all mutation responses
  type SaveEventResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String
    event: Event!
  }
  type UnsaveEventResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String
    event: Event!
  }
  type LoginResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String
    token: String!
  }
`

module.exports = typeDefs
