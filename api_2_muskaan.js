const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  console.log("remaining time =", context.getRemainingTimeInMillis());
  console.log("functionName =", context.functionName);
  console.log("AWSrequestID =", context.awsRequestId);
  let body;
  let statusCode = "200";
  const headers = { "Content-Type": "application/json" };
  const tableName = "image_info";
  const s3ImageBucket = "ass3imageupload";
  const s3ThumbnailBucket = "ass3thumbnailbucket";

  try {
    switch (event.httpMethod) {
      case "GET":
        if (
          event.queryStringParameters &&
          event.queryStringParameters.thumbnail_url
        ) {
          let params = {
            TableName: tableName,
            ProjectionExpression: "s3_url",
            FilterExpression: "thumbnail_url = :thumbnail_url",
            ExpressionAttributeValues: {
              ":thumbnail_url": event.queryStringParameters.thumbnail_url,
            },
          };
          const response = await dynamo.scan(params).promise();
          body = response.Items.map((item) => item.s3_url);
        } else {
          body = { worked: "no" };
        }
        break;

      case "DELETE":
        if (event.body) {
          const requestBody = JSON.parse(event.body);
          const thumbnailUrls = requestBody.thumbnail_urls;

          for (let thumbnailUrl of thumbnailUrls) {
            // Query DynamoDB to get the S3 URL for each thumbnail URL
            let params = {
              TableName: tableName,
              ProjectionExpression: "s3_url",
              FilterExpression: "thumbnail_url = :thumbnail_url",
              ExpressionAttributeValues: {
                ":thumbnail_url": thumbnailUrl,
              },
            };
            const response = await dynamo.scan(params).promise();
            const items = response.Items;

            for (let item of items) {
              const s3Url = item.s3_url;

              // Delete the image from the S3 image bucket
              const s3ImageParams = {
                Bucket: s3ImageBucket,
                Key: s3Url.split('/').pop() // Extracting the file name from the URL
              };
              await s3.deleteObject(s3ImageParams).promise();

              // Delete the thumbnail from the S3 thumbnail bucket
              const s3ThumbnailParams = {
                Bucket: s3ThumbnailBucket,
                Key: thumbnailUrl.split('/').pop() // Extracting the file name from the URL
              };
              await s3.deleteObject(s3ThumbnailParams).promise();

              // Delete the entry from DynamoDB
              const deleteParams = {
                TableName: tableName,
                Key: {
                  "thumbnail_url": thumbnailUrl
                }
              };
              await dynamo.delete(deleteParams).promise();
            }
          }
          body = { message: "Images and thumbnails deleted successfully" };
        } else {
          statusCode = "400";
          body = { error: "No body provided" };
        }
        break;

      case "BULK TAG":
        if (event.body) {
          const requestBody = JSON.parse(event.body);
          const thumbnailUrls = requestBody.url;
          const type = requestBody.type; // 1 for add, 0 for remove
          const tags = requestBody.tags;

          for (let thumbnailUrl of thumbnailUrls) {
            // Query DynamoDB to get the item for each thumbnail URL
            let params = {
              TableName: tableName,
              FilterExpression: "thumbnail_url = :thumbnail_url",
              ExpressionAttributeValues: {
                ":thumbnail_url": thumbnailUrl,
              },
            };
            const response = await dynamo.scan(params).promise();
            const items = response.Items;

            for (let item of items) {
              let updateExpression = "";
              let expressionAttributeValues = {};

              if (type === 1) {
                // Add tags
                updateExpression = "ADD tags :tags";
                expressionAttributeValues[":tags"] = dynamo.createSet(tags);
              } else if (type === 0) {
                // Remove tags
                updateExpression = "DELETE tags :tags";
                expressionAttributeValues[":tags"] = dynamo.createSet(tags);
              }

              // Update the item in DynamoDB
              const updateParams = {
                TableName: tableName,
                Key: { "thumbnail_url": thumbnailUrl },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
              };
              await dynamo.update(updateParams).promise();
            }
          }
          body = { message: `Tags ${type === 1 ? "added" : "removed"} successfully` };
        } else {
          statusCode = "400";
          body = { error: "No body provided" };
        }
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
