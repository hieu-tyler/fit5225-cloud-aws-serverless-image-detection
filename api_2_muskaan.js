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
  const s3ThumbnailBucket = "ass3thumbnailbucketpixtag";

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
