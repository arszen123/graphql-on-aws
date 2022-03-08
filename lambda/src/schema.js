const { gql } = require("apollo-server-lambda");

module.exports = gql`
schema {
  query: Query
  mutation: Mutation
}

type Query {
  # Lambda Queries
  listTodoItems(nextToken: String): ListTodoItems
  getTodoItem(id: ID!): TodoItem
}

type Mutation {
  # Lambda mutations
  createTodoItem(input: CreateTodoItemInput): TodoItem
  updateTodoItem(input: UpdateTodoItemInput): TodoItem
  deleteTodoItem(input: DeleteTodoItemInput): TodoItem
}

input CreateTodoItemInput {
  name: String!
  description: String
}

input UpdateTodoItemInput {
  id: ID!
  name: String!
  description: String
}

input DeleteTodoItemInput {
  id: ID!
}

type TodoItem {
  id: ID!
  name: String!
  description: String
}

type ListTodoItems {
  items: [TodoItem]!
  nextToken: String
}
`;