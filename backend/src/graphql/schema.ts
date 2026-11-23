export const typeDefs = `#graphql
  type Location { id: ID!, name: String!, description: String, latitude: Float!, longitude: Float! }
  type Query {
    health: String!
    locations: [Location!]!
    locationsInBBox(minLongitude: Float!, minLatitude: Float!, maxLongitude: Float!, maxLatitude: Float!): [Location!]!
  }
`;
