const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event, context, callback) => {
    console.log("remaining time =", context.getRemainingTimeInMillis());
    console.log("functionName =", context.functionName);
    console.log("AWSrequestID =", context.awsRequestId);
    let body;
    let statusCode = "200";
    const headers = { "Content-Type": "application/json" };
    const tableName = "image_info";
    try {
        switch (event.httpMethod) {
            case "GET":
                if (
                    event.queryStringParameters &&
                    event.queryStringParameters.tags
                ) {
                    let tags = [];
                    let tagCounts = {};
                    let filterExpressions = [];
                    let expressionAttributeValues = {};

                    for (let key in event.queryStringParameters) {
                        if (key.startsWith("tag")) {
                            let [tagName, minCount] = event.queryStringParameters[key].split(',');
                            let tagKey = `:${tagName}`;
                            tags.push(tagName);
                            tagCounts[tagName] = parseInt(minCount, 10);

                            filterExpressions.push(`contains(tags, ${tagKey})`);
                            expressionAttributeValues[tagKey] = tagName;
                        }
                    }

                    let params = {
                        TableName: tableName,
                        ProjectionExpression: "s3_url, tags",
                        FilterExpression: filterExpressions.join(' AND '),
                        ExpressionAttributeValues: expressionAttributeValues,
                    };

                    const response = await dynamo.scan(params).promise();

                    let filteredItems = response.Items.filter(item => {
                        let tagCountMap = {};
                        item.tags.L.forEach(tag => {
                            tagCountMap[tag.S] = (tagCountMap[tag.S] || 0) + 1;
                        });
                        return Object.keys(tagCounts).every(tag => tagCountMap[tag] >= tagCounts[tag]);
                    });

                    let body = filteredItems.map((item) => item.s3_url.S);
                }
                else body = { error: "No tags provided" };
                break;
            default:
                throw new Error(`Unsupported method "${event.httpMethod}"`);
        }
    } catch (err) {
        statusCode = "400";
        body = err.message;
    } finally {
        body = JSON.stringify(body);
    }
    return { statusCode, body, headers };
};