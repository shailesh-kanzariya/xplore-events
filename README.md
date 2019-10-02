# Xplore Events
## What is 'Xplore Events'?
  * [Apollo](https://www.apollographql.com/) powered 
    * GraphQL APIs that allow
      * to search 'events' happening in the specified 'city' across the world and provide event-details such as
        * What is that event about?
        * When is the event (date)?
        * What is the location of the event?
        * What is the event address and many other details about the event
      * Examples: 'search events in New York', 'search events in London'
    * GraphQL APIs that allow each user
      * to save interested event for future use
      * to unsave the saved event
      * to login/logout
## Technology Stack
  * [GraphQL](https://graphql.org/)
  * [Apollo](https://www.apollographql.com/)
  * [Node.js](https://nodejs.org/en/)
  * [DynamoDB](https://aws.amazon.com/dynamodb/)
  * [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3)
## Which different 'Data Sources' are used to build Xplore Events GraphQL APIs?
  * [Yelp Fusion API](https://www.yelp.com/developers/documentation/v3)
  * [DynamoDB](https://aws.amazon.com/dynamodb/)
  * Weather API
## Data use cases for the client e.g. React-Client, iOS/Android Client etc.
  * Fetch all 'events' planned within 100 miles radius from the 'user entered location/city'
  * Fetch all 'featured events' planned within 100 miles radius from the 'user entered location/city'
  * Fetch the specific 'event' details by its 'event id'
  * Fetch 'weather forecast' for the 'event location/city'
  * Login the user
  * Allow user to save the 'event' if the user is logged in
  * Allow user to unsave the 'event' if the user is logged in
  * Allow user to get list of 'saved events' if the user is logged in
  * Logout the user
## How to deploy DynamoDB infrastructure on AWS?
  * Prerequisite
    * [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
    * AWS S3 bucket with name `xplore.events.sam.package.bucket`
  * Packaging Command
    * `sam package --output-template packaged.yaml --s3-bucket xplore.events.sam.package.bucket`
  * Deploy Command
    * `sam deploy --template-file packaged.yaml --region us-east-2 --capabilities CAPABILITY_IAM --stack-name xplore-events-stack`