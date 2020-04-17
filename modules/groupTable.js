const awsUtil = require('../services/aws/awsUtil');
const utils = require('../utils/utils');
const dynamoDb = awsUtil.getDynamo();

let tableName = `${utils.getEnvName()}Groups`;

module.exports = {
    getGroup: (id) => {
        const params = {
            TableName: tableName,
            KeyConditionExpression: "#id = :id",
            ExpressionAttributeNames: {
                "#id": "id"
            },
            ExpressionAttributeValues: {
                ":id": id,
            }
        };
        return dynamoDb.query(params).promise();
    }
};
