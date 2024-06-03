const AWS = require("aws-sdk");
const sns = new AWS.SNS();

exports.subscribeUser = async (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const email = requestBody.email;
  const tags = requestBody.tags;

  const filterPolicy = {
    tags: tags
  };

  const params = {
    Protocol: 'email',
    TopicArn: 'arn:aws:sns:ap-southeast-2:756624415062:PixTagNotifications',
    Endpoint: email,
    Attributes: {
      FilterPolicy: JSON.stringify(filterPolicy)
    }
  };

  try {
    const response = await sns.subscribe(params).promise();
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({ message: 'Subscription successful!', subscriptionArn: response.SubscriptionArn })
    });
  } catch (err) {
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    });
  }
};
