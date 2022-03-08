const AWS = require('aws-sdk');
const uuid = require('uuid').v4;

const dbClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME;

module.exports = {
  Query: {
    listTodoItems: async (_, { nextToken }) => {
      const exclusiveStartKey = nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : undefined;

      const response = await dbClient.scan({
        TableName,
        Limit: 10,
        ExclusiveStartKey: exclusiveStartKey,
      }).promise();

      return {
        items: response.Items,
        nextToken: response.LastEvaluatedKey ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString('base64') : undefined
      };
    },
    getTodoItem: async (_, { id }) => {
      const response = await dbClient.get({
        TableName,
        Key: { id },
      }).promise();

      return response.Item;
    },
  },
  Mutation: {
    createTodoItem: async (_, { input }) => {
      const Item = {
        ...input,
        id: uuid(),
      };

      await dbClient.put({
        TableName,
        Item,
      }).promise();

      return Item;
    },
    updateTodoItem: async (_, { input: { id, name, description } }) => {
      const Item = {
        id,
        name,
        description,
      };

      await dbClient.put({
        TableName,
        Item,
        ConditionExpression: 'attribute_exists(id)',
      }).promise();

      return Item;
    },
    deleteTodoItem: async (_, { input: { id } }) => {
      const response = await dbClient.delete({
        TableName,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      }).promise();

      return response.Attributes;
    }
  }
}