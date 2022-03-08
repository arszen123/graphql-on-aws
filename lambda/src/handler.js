const { ApolloServer } = require('apollo-server-lambda');
const todoItemResolvers = require('./resolvers');
const typeDefs = require('./schema');

const resolvers = {
  Query: {
    ...todoItemResolvers.Query
  },
  Mutation: {
    ...todoItemResolvers.Mutation
  },
};

const options = {
  typeDefs,
  resolvers,
};

if (process.env.ENVIRONMENT === 'dev') {
  options.playground = {
    endpoint: "/dev/graphql"
  }
}

const server = new ApolloServer(options);

exports.handler = server.createHandler();