const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const sns = new AWS.SNS();

exports.handler = async (event, context, callback) => {
  console.log("remaining time =", context.getRemainingTimeInMillis());
  console.log("functionName =", context.functionName);
  console.log("AWSrequestID =", context.awsRequestId);
  let body;
  let statusCode = "200";
  const headers = { "Content-Type": "application/json" };
  const tableName = "pixtag_image_info";
  const s3ImageBucket = "pixtagimageupload";
  const s3ThumbnailBucket = "pixtagthumbnailbucket";
  const snsTopicArn = 'arn:aws:sns:ap-southeast-2:756624415062:PixTagNotifications';

  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.queryStringParameters && event.queryStringParameters.thumbnail_url) {
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

      case "POST":
        if (event.body) {
          const requestBody = JSON.parse(event.body);
          if (requestBody.tags && requestBody.url && requestBody.type) {
            const thumbnailUrls = requestBody.url;
            const type = requestBody.type; // 1 for add, 0 for remove
            const tags = requestBody.tags;
            console.log(tags);

            for (let thumbnailUrl of thumbnailUrls) {
              console.log(thumbnailUrl);
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
                const s3Url = item.s3_url;
                let currentTags = item.tags;
                if (type === 1) {
                  tags.forEach((tag) => {
                    if (!currentTags.includes(tag)) {
                      currentTags.push(tag);
                    }
                  });
                } else if (type === 0) {
                  currentTags = currentTags.filter((item) => !tags.includes(item));
                }

                const updateParams = {
                  TableName: tableName,
                  Key: { s3_url: s3Url },
                  UpdateExpression: "SET tags = :tags",
                  ExpressionAttributeValues: {
                    ":tags": currentTags,
                  },
                };
                await dynamo.update(updateParams).promise();

                // Publish message to SNS
                const message = {
                  "default": `Image ${s3Url} updated`,
                  "email": `The tags for image ${s3Url} have been ${type === 1 ? 'added' : 'removed'}: ${tags.join(', ')}`
                };

                await sns.publish({
                  TopicArn: snsTopicArn,
                  Message: JSON.stringify(message),
                  MessageStructure: 'json',
                  MessageAttributes: {
                    'tags': {
                      DataType: 'String.Array',
                      StringValue: JSON.stringify(tags)
                    }
                  }
                }).promise();
              }
            }
            body = {
              message: `Tags ${type === 1 ? "added" : "removed"} successfully`,
            };
          } else if (requestBody.tags) {
            const tags = requestBody.tags;

            let filterExpression = "";
            let expressionAttributeValues = {};

            for (let i = 0; i < tags.length; i++) {
              const placeholder = `:tag${i}`;
              filterExpression += `contains(tags, ${placeholder})`;
              expressionAttributeValues[placeholder] = tags[i];

              if (i < tags.length - 1) {
                filterExpression += " AND ";
              }
            }

            const params = {
              TableName: tableName,
              ProjectionExpression: "thumbnail_url",
              FilterExpression: filterExpression,
              ExpressionAttributeValues: expressionAttributeValues,
            };

            const response = await dynamo.scan(params).promise();
            body = response.Items.map((item) => item.thumbnail_url);
          }
        } else {
          statusCode = "400";
          body = { error: "Invalid request" };
        }
        break;

      case "DELETE":
        if (event.body) {
          const requestBody = JSON.parse(event.body);
          const thumbnailUrls = requestBody.thumbnail_urls;

          for (let thumbnailUrl of thumbnailUrls) {
            console.log("thumbnailUrl");
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
              console.log(s3Url);
              console.log("Start delete image");
              const s3ImageParams = {
                Bucket: s3ImageBucket,
                Key: s3Url.split("/").pop(),
              };
              await s3.deleteObject(s3ImageParams).promise();
              console.log("end delete image");
              console.log("Start delete thumbnail");
              const s3ThumbnailParams = {
                Bucket: s3ThumbnailBucket,
                Key: thumbnailUrl.split("/").pop(),
              };
              await s3.deleteObject(s3ThumbnailParams).promise();
              console.log("end delete image");
              console.log("Start delete table entry");
              const deleteParams = {
                TableName: tableName,
                Key: {
                  s3_url: s3Url,
                },
              };
              await dynamo.delete(deleteParams).promise();
              console.log("end delete table entry");
            }

            // Publish message to SNS
            const message = {
              "default": `Image ${thumbnailUrl} deleted`,
              "email": `The image with URL ${thumbnailUrl} has been deleted.`
            };

            await sns.publish({
              TopicArn: snsTopicArn,
              Message: JSON.stringify(message),
              MessageStructure: 'json',
              MessageAttributes: {
                'tags': {
                  DataType: 'String.Array',
                  StringValue: JSON.stringify(thumbnailUrls)
                }
              }
            }).promise();
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
          const type = requestBody.type;
          const tags = requestBody.tags;

          for (let thumbnailUrl of thumbnailUrls) {
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
              const s3Url = item.s3_url;
              let currentTags = item.tags;

              if (type === 1) {
                tags.forEach((tag) => {
                  if (!currentTags.includes(tag)) {
                    currentTags.push(tag);
                  }
                });
              } else if (type === 0) {
                currentTags = currentTags.filter((t) => !tags.includes(t));
              }

              const updateParams = {
                TableName: tableName,
                Key: { s3_url: s3Url },
                UpdateExpression: "SET tags = :tags",
                ExpressionAttributeValues: {
                  ":tags": currentTags,
                },
              };
              await dynamo.update(updateParams).promise();

              // Publish message to SNS
              const message = {
                "default": `Tags for image ${s3Url} ${type === 1 ? 'added' : 'removed'}`,
                "email": `The tags for image ${s3Url} have been ${type === 1 ? 'added' : 'removed'}: ${tags.join(', ')}`
              };

              await sns.publish({
                TopicArn: snsTopicArn,
                Message: JSON.stringify(message),
                MessageStructure: 'json',
                MessageAttributes: {
                  'tags': {
                    DataType: 'String.Array',
                    StringValue: JSON.stringify(tags)
                  }
                }
              }).promise();
            }
          }
          body = {
            message: `Tags ${type === 1 ? "added" : "removed"} successfully`,
          };
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
