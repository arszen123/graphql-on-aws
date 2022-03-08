const uuid = require('uuid').v4;
const AWS = require('aws-sdk');

const dbClient = new AWS.DynamoDB.DocumentClient();
const TableName = process.env.TABLE_NAME;

const resolvers = {
  listTodoItemsWithLambda: async ({ nextToken }) => {
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
  getTodoItemWithLambda: async ({ id }) => {
    const response = await dbClient.get({
      TableName,
      Key: { id },
    }).promise();

    return response.Item;
  },
  createTodoItemWithLambda: async ({ input }) => {
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
  updateTodoItemWithLambda: async ({ input: { id, name, description } }) => {
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
  deleteTodoItemWithLambda: async ({ input: { id } }) => {
    const response = await dbClient.delete({
      TableName,
      Key: { id },
      ReturnValues: 'ALL_OLD',
    }).promise();

    return response.Attributes;
  }
}

module.exports.handler = ({ field, arguments }) => {
  const resolver = resolvers[field];

  if (!resolver) {
    throw new Error(`Resolver not found: ${field}`);
  }

  return resolver(arguments);
};
