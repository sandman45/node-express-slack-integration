const awsUtil = require('../services/aws/awsUtil');
const utils = require('../utils/utils');
const dynamoDb = awsUtil.getDynamo();

let tableName = `${utils.getEnvName()}Slack`;
// this is from slack after oauth check

module.exports = {
    saveSlackRecord: (data) => {
        const partitionKey = `${data.team.id}:Team`;
        const sortKey = `CHANNEL|${data.incoming_webhook.channel_id}:Channel`;
        const params = {
            TableName: tableName,
            Item: {
              partitionKey: partitionKey,
              sortKey: sortKey,
              data,
            },
        };

        return dynamoDb.put(params).promise();
    },
    saveSlackSubscription: (teamId, channelId, groupId, data) => {
        const partitionKey = `${teamId}:Team`;
        const sortKey = `CHANNEL|${channelId}:Channel|GROUP|${groupId}`;
        const params = {
            TableName: tableName,
            Item: {
                partitionKey: partitionKey,
                sortKey: sortKey,
                data,
                groupId,
            },
        };

        return dynamoDb.put(params).promise();
    },
    getSlackRecord: (teamId, channelId) => {
        const partitionKey = `${teamId}:Team`;
        const sortKey = `CHANNEL|${channelId}:Channel`;

        const params = {
            TableName: tableName,
            KeyConditionExpression: "#partitionKey = :partitionKey AND #sortKey = :sortKey",
            ExpressionAttributeNames: {
                "#partitionKey": "partitionKey",
                "#sortKey": "sortKey",
            },
            ExpressionAttributeValues: {
                ":partitionKey": partitionKey,
                ":sortKey": sortKey
            }
        };
        return dynamoDb.query(params).promise();
    },
    getSlackSubscription(groupId) {
    return dynamoDb.query({
        TableName: tableName,
        IndexName:"groupId-index",
        KeyConditionExpression: "#groupId = :groupId",
        ExpressionAttributeNames: {
            "#groupId": "groupId",
        },
        ExpressionAttributeValues: {
            ":groupId": groupId,
        }
    }).promise();
}
};
