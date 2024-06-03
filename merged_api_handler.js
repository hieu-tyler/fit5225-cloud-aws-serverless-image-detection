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
  const tableName = "pixtag_image_info";
  const lambda = new AWS.Lambda();
  const s3ImageBucket = "pixtagimageupload";
  const s3ThumbnailBucket = "pixtagthumbnailbucket";
  
  const IMAGE_DETECTION_LAMBDA = "image_detection_lambda";

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
                  // updateExpression = "DELETE tags :tags";
                  // expressionAttributeValues[":tags"] = dynamo.createSet(tags);
                  //     tags.forEach((tag) => {
                  //   currentTags = currentTags.filter((t) => t.S == tag.S);
                  // });
                  currentTags = currentTags.filter(
                    (item) => !tags.includes(item)
                  );
                }
                console.log("currentTags");
                // Update the item in DynamoDB
                const updateParams = {
                  TableName: tableName,
                  Key: { s3_url: s3Url },
                  UpdateExpression: "SET tags = :tags",
                  ExpressionAttributeValues: {
                    ":tags": currentTags,
                  },
                  // UpdateExpression: updateExpression,
                  // ExpressionAttributeValues: expressionAttributeValues,
                };
                await dynamo.update(updateParams).promise();
              }
            }
            body = {
              message: `Tags ${type === 1 ? "added" : "removed"} successfully`,
            };
          } else if (requestBody.tags) {
            const tags = requestBody.tags;

            // Build the FilterExpression and ExpressionAttributeValues based on tags
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
            console.log(filterExpression);
            console.log(expressionAttributeValues);
            // Query DynamoDB to find rows based on the tags
            const params = {
              TableName: tableName,
              ProjectionExpression: "thumbnail_url",
              FilterExpression: filterExpression,
              ExpressionAttributeValues: expressionAttributeValues,
            };

            const response = await dynamo.scan(params).promise();
            body = response.Items.map((item) => item.thumbnail_url);
          }
        } else if (event.image_base64) {
        const imageBase64 = event.image_base64;
        const detectParams = {
          FunctionName: IMAGE_DETECTION_LAMBDA, // Replace with your image detection Lambda function name
          Payload: JSON.stringify({ image_base64: imageBase64 }),
        };
        const detectResponse = await lambda.invoke(detectParams).promise();
        const detectionResult = JSON.parse(detectResponse.Payload);

        console.log("detectionResult", detectionResult)

        // Handle the response from the detection Lambda function
        const parseBody = JSON.parse(detectionResult.body)

        console.log("parseBody: ", parseBody)

        
        const foundS3Thumbnails = [];
        
        const foundTags = parseBody.found_tags.map(tag => tag.trim());

        console.log("foundTags: ", foundTags)

        // Scan DynamoDB for matching tags
        const scanParams = {
          TableName: tableName,
        };
        const dynamoResponse = await dynamo.scan(scanParams).promise();

        console.log("dbResponse: ", dynamoResponse)

        dynamoResponse.Items.forEach((item) => {
          const dynamoTags = item.tags.map(tag => tag.replace('\r', ''));
          const s3ThumbnailUrl = item.thumbnail_url;
          console.log(dynamoTags)
          console.log(foundTags)
          if (dynamoTags && s3ThumbnailUrl) {
            const dynamoTagSet = new Set(dynamoTags);
            const foundTagSet = new Set(foundTags);
            if ([...dynamoTagSet].some(tag => foundTagSet.has(tag))) {
              foundS3Thumbnails.push(s3ThumbnailUrl);
            }
          }
        });
        body = foundS3Thumbnails;
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
              console.log("end delete image");
              console.log("Start delete thumbnail");
              // Delete the thumbnail from the S3 thumbnail bucket
              const s3ThumbnailParams = {
                Bucket: s3ThumbnailBucket,
                Key: thumbnailUrl.split("/").pop(), // Extracting the file name from the URL
              };
              await s3.deleteObject(s3ThumbnailParams).promise();
              console.log("end delete image");
              console.log("Start delete table entry");
              // Delete the entry from DynamoDB
              const deleteParams = {
                TableName: tableName,
                Key: {
                  s3_url: s3Url,
                },
              };
              await dynamo.delete(deleteParams).promise();
              console.log("end delete table entry");
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
              } else if (type === 0) {
                // Remove tags
                // updateExpression = "DELETE tags :tags";
                // expressionAttributeValues[":tags"] = dynamo.createSet(tags);
                tags.forEach((tag) => {
                  currentTags = currentTags.filter((t) => t.S !== tag.S);
                });
              }
              console.log("currentTags");
              // Update the item in DynamoDB
              const updateParams = {
                TableName: tableName,
                Key: { s3_url: s3Url },
                UpdateExpression: "SET tags = :tags",
                ExpressionAttributeValues: {
                  ":tags": currentTags,
                },
                // UpdateExpression: updateExpression,
                // ExpressionAttributeValues: expressionAttributeValues,
              };
              await dynamo.update(updateParams).promise();
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
