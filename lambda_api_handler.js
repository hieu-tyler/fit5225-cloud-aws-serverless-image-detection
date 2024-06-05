const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const sns = new AWS.SNS();
const lambda = new AWS.Lambda();

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
  const snsTopicArn =
    "arn:aws:sns:ap-southeast-2:756624415062:PixTagNotifications";
  const IMAGE_DETECTION_LAMBDA = "pixtag-tag-grabber";

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
          body = { message: "No thumbnail_url passed as parameters" };
        }
        break;

      case "POST":
        if (event.body) {
          const requestBody =
            typeof event.body === "string"
              ? JSON.parse(event.body)
              : event.body;
          if (requestBody.tags && requestBody.url && requestBody.type) {
            const thumbnailUrls = requestBody.url;
            const type = requestBody.type; // 1 for add, 0 for remove
            const tags = requestBody.tags;
            console.log(tags);
            for (let thumbnailUrl of thumbnailUrls) {
              console.log(thumbnailUrl);
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
                const s3Url = item.s3_url;
                let currentTags = item.tags;
                console.log(currentTags);
                let updateExpression = "";
                let expressionAttributeValues = {};
                if (type === 1) {
                  // Add tags
                  tags.forEach((tag) => {
                    if (!currentTags.includes(tag)) {
                      currentTags.push(tag);
                    }
                  });
                } else if (type === 2) {
                  // Remove tags
                  currentTags = currentTags.filter(
                    (item) => !tags.includes(item)
                  );
                }
                // Update the item in DynamoDB
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
                  default: `Image ${s3Url} updated`,
                  email: `The tags for image ${s3Url} have been ${
                    type === 1 ? "added" : "removed"
                  }: ${tags.join(", ")}`,
                };

                await sns
                  .publish({
                    TopicArn: snsTopicArn,
                    Message: JSON.stringify(message),
                    MessageStructure: "json",
                    MessageAttributes: {
                      tags: {
                        DataType: "String.Array",
                        StringValue: JSON.stringify(tags),
                      },
                    },
                  })
                  .promise();
              }
            }

            body = {
              message: `Tags ${type === 1 ? "added" : "removed"} successfully`,
            };
          } else if (requestBody.image_base64) {
            const imageBase64 = requestBody.image_base64;
            const detectParams = {
              FunctionName: IMAGE_DETECTION_LAMBDA, // Replace with your image detection Lambda function name
              Payload: JSON.stringify({ image_base64: imageBase64 }),
            };
            const detectResponse = await lambda.invoke(detectParams).promise();
            const detectionResult = JSON.parse(detectResponse.Payload);

            // Handle the response from the detection Lambda function
            const parseBody = JSON.parse(detectionResult.body);

            const foundS3Thumbnails = [];

            const foundTags = parseBody.found_tags.map((tag) => tag.trim());

            // Scan DynamoDB for matching tags
            const scanParams = {
              TableName: tableName,
            };
            const dynamoResponse = await dynamo.scan(scanParams).promise();

            console.log("dbResponse: ", dynamoResponse);

            dynamoResponse.Items.forEach((item) => {
              const dynamoTags = item.tags.map((tag) => tag.replace("\r", ""));
              const s3ThumbnailUrl = item.thumbnail_url;
              console.log(dynamoTags);
              console.log(foundTags);
              if (dynamoTags && s3ThumbnailUrl) {
                const dynamoTagSet = new Set(dynamoTags);
                const foundTagSet = new Set(foundTags);
                if ([...dynamoTagSet].some((tag) => foundTagSet.has(tag))) {
                  foundS3Thumbnails.push(s3ThumbnailUrl);
                }
              }
            });
            body = foundS3Thumbnails;
          } else if (requestBody.sub_email && requestBody.tags) {
            try {
              const email = requestBody.sub_email;
              const tags = requestBody.tags;
              const filterPolicy = {
                tags: tags,
              };
              // Subscribe the email to the SNS topic
              const params = {
                Protocol: "email",
                TopicArn:
                  "arn:aws:sns:ap-southeast-2:756624415062:PixTagNotifications",
                Endpoint: email,
                Attributes: {
                  FilterPolicy: JSON.stringify(filterPolicy),
                },
              };

              await sns.subscribe(params).promise();

              body = { message: "Email subscribed successfully" };
            } catch (error) {
              console.error("Error:", error);

              body: JSON.stringify({
                message: "Error subscribing email to SNS",
              });
            }
          } else if (requestBody.tags) {
            const tags = requestBody.tags;
            console.log(tags);

            // Build the FilterExpression and ExpressionAttributeValues based on tags
            let filterExpression = tags
              .map((_, i) => `contains(tags, :tag${i})`)
              .join(" AND ");
            let expressionAttributeValues = tags.reduce((acc, tag, i) => {
              acc[`:tag${i}`] = tag[0];
              return acc;
            }, {});

            console.log(filterExpression);
            console.log(expressionAttributeValues);

            // Query DynamoDB to find rows based on the tags
            const params = {
              TableName: tableName, // Replace with your table name
              FilterExpression: filterExpression,
              ExpressionAttributeValues: expressionAttributeValues,
            };

            try {
              const response = await dynamo.scan(params).promise();
              let final_thumbnails = [];

              for (let item of response.Items) {
                let count = 0;
                let match = true;
                for (let tag of tags) {
                  const tagName = tag[0];
                  const requiredCount = tag[1];
                  const actualCount = item.tags.filter(
                    (t) => t === tagName
                  ).length;

                  if (actualCount !== requiredCount) {
                    //match = false;
                    break;
                  } else {
                    count++;
                  }
                }
                if (count == tags.length) {
                  final_thumbnails.push(item.thumbnail_url);
                }
              }

              body = final_thumbnails;
            } catch (error) {
              console.error(error);
              body = { error: "Error scanning DynamoDB table" };
            }
          } else {
            body = { error: "No tags provided in the request body" };
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
              console.log(s3Url);
              console.log("Start delete image");
              // Delete the image from the S3 image bucket
              const s3ImageParams = {
                Bucket: s3ImageBucket,
                Key: s3Url.split("/").pop(), // Extracting the file name from the URL
              };
              await s3.deleteObject(s3ImageParams).promise();

              // Delete the thumbnail from the S3 thumbnail bucket
              const s3ThumbnailParams = {
                Bucket: s3ThumbnailBucket,
                Key: thumbnailUrl.split("/").pop(), // Extracting the file name from the URL
              };
              await s3.deleteObject(s3ThumbnailParams).promise();
              // Delete the entry from DynamoDB
              const deleteParams = {
                TableName: tableName,
                Key: {
                  s3_url: s3Url,
                },
              };
              await dynamo.delete(deleteParams).promise();
            }
            // Publish message to SNS
            const message = {
              default: `Image ${thumbnailUrl} deleted`,
              email: `The image with URL ${thumbnailUrl} has been deleted.`,
            };

            await sns
              .publish({
                TopicArn: snsTopicArn,
                Message: JSON.stringify(message),
                MessageStructure: "json",
                MessageAttributes: {
                  tags: {
                    DataType: "String.Array",
                    StringValue: JSON.stringify(thumbnailUrls),
                  },
                },
              })
              .promise();
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
  return {
    statusCode,
    body,
    headers,
    headers: {
      "Access-Control-Allow-Origin": "*",

      "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH",
    },
  };
};
