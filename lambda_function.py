import json
import boto3
from urllib.parse import unquote_plus
import numpy as np
import time
import cv2
from io import BytesIO

# Configuration variable
s3_client = boto3.client("s3")
dynamodb = boto3.client("dynamodb")
sns_client = boto3.client("sns")
TABLE_NAME = "pixtag_image_info"
s3_config_bucket = "pixtagconfigfiles"
s3_thumbnail_bucket = "pixtagthumbnailbucket"
labels_path = "coco.names"
weights_path = "yolov3-tiny.weights"
config_path = "yolov3-tiny.cfg"
sns_topic_arn = "arn:aws:sns:ap-southeast-2:756624415062:PixTagNotifications"

# Construct the argument parse and parse the arguments
confthres = 0.6
nmsthres = 0.1

def get_labels(s3_config_bucket, labels_path):
    # Get the object from S3
    response = s3_client.get_object(Bucket=s3_config_bucket, Key=labels_path)
    # Read the content of the file
    content = response["Body"].read().decode("utf-8")
    # Split the content into labels
    LABELS = content.strip().split("\n")
    return LABELS


def get_weights(weights_path):
    temp_file_path = "/tmp/yolov3-tiny.weights"
    # Download the weights file from S3
    s3_client.download_file(s3_config_bucket, weights_path, temp_file_path)
    return temp_file_path


def get_config(config_path):
    # Temporary file path to store the downloaded file
    temp_file_path = "/tmp/yolov3-tiny.cfg"
    # Download the config file from S3
    s3_client.download_file(s3_config_bucket, config_path, temp_file_path)
    return temp_file_path


def load_model(configpath, weightspath):
    # load our YOLO object detector trained on COCO dataset (80 classes)
    print("[INFO] loading YOLO from disk...")
    net = cv2.dnn.readNetFromDarknet(configpath, weightspath)
    return net


def do_prediction(image, net, LABELS):
    (H, W) = image.shape[:2]
    # determine only the *output* layer names that we need from YOLO
    ln = net.getLayerNames()
    ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]

    # construct a blob from the input image and then perform a forward
    # pass of the YOLO object detector, giving us our bounding boxes and
    # associated probabilities
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416), swapRB=True, crop=False)
    net.setInput(blob)
    start = time.time()
    layerOutputs = net.forward(ln)
    # print(layerOutputs)
    end = time.time()

    # show timing information on YOLO
    print("[INFO] YOLO took {:.6f} seconds".format(end - start))

    # initialize our lists of detected bounding boxes, confidences, and
    # class IDs, respectively
    boxes = []
    confidences = []
    classIDs = []

    # loop over each of the layer outputs
    for output in layerOutputs:
        # loop over each of the detections
        for detection in output:
            # extract the class ID and confidence (i.e., probability) of
            # the current object detection
            scores = detection[5:]
            # print(scores)
            classID = np.argmax(scores)
            # print(classID)
            confidence = scores[classID]

            # filter out weak predictions by ensuring the detected
            # probability is greater than the minimum probability
            if confidence > confthres:
                # scale the bounding box coordinates back relative to the
                # size of the image, keeping in mind that YOLO actually
                # returns the center (x, y)-coordinates of the bounding
                # box followed by the boxes' width and height
                box = detection[0:4] * np.array([W, H, W, H])
                (centerX, centerY, width, height) = box.astype("int")

                # use the center (x, y)-coordinates to derive the top and
                # and left corner of the bounding box
                x = int(centerX - (width / 2))
                y = int(centerY - (height / 2))

                # update our list of bounding box coordinates, confidences,
                # and class IDs
                boxes.append([x, y, int(width), int(height)])

                confidences.append(float(confidence))
                classIDs.append(classID)

    # apply non-maxima suppression to suppress weak, overlapping bounding boxes
    idxs = cv2.dnn.NMSBoxes(boxes, confidences, confthres, nmsthres)

    # Output according to assessment specifications
    detected_labels = []

    if len(idxs) > 0:
        for i in idxs.flatten():
            label = LABELS[classIDs[i]]
            detected_labels.append(label)

    return detected_labels

def create_thumbnail(image, thumbnail_size=(150, 150)):
    """Create thumbnail from the provided image


    Args:
        image (list): 2 dimension image
        thumbnail_size (tuple, optional): The thumbnail size for web application. Defaults to (150, 150).

    Returns:
        image(list): thumbnail with rescale from image
    """
    # Get the dimensions of the image
    original_height, original_width = image.shape[:2]
    # Calculate the aspect ratio
    aspect_ratio = original_width / original_height
    # Determine the new dimensions based on the desired thumbnail size while maintaining the aspect ratio
    if original_width > original_height:
        new_width = thumbnail_size[0]
        new_height = int(new_width / aspect_ratio)
    else:
        new_height = thumbnail_size[1]
        new_width = int(new_height * aspect_ratio)

    # Resize the image
    thumbnail = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return thumbnail


def lambda_handler(event, context):
    """Lambda Handler

    Args:
        event (Event): event from lambda function
        context (Context): extra context passed by lambda function

    Returns:
        _type_: _description_
    """
    Lables = get_labels(s3_config_bucket, labels_path)
    CFG = get_config(config_path)
    Weights = get_weights(weights_path)
    for record in event["Records"]:
        # Prepare buket name, key and s3 URL
        bucket = record["s3"]["bucket"]["name"]
        key = unquote_plus(record["s3"]["object"]["key"])
        s3_url = f"https://{bucket}.s3.ap-southeast-2.amazonaws.com/{key}"

        print("File {0} uploaded to {1} bucket".format(key, bucket))
        
        # Get the image content
        image_response = s3_client.get_object(Bucket=bucket, Key=key)
        image_content = image_response["Body"].read()

        # Convert the image content to an array that OpenCV can work with
        nparr = np.frombuffer(image_content, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Create thumbnail
        thumbnail = create_thumbnail(image)
        _, buffer = cv2.imencode(".jpg", thumbnail)
        io_buffer = BytesIO(buffer)
        thumbnail_key = key.split(".")[0] + "_thumbnail.jpg"
        
        # Upload the image to DynamoDB
        s3_client.upload_fileobj(io_buffer, s3_thumbnail_bucket, thumbnail_key)
        thumbnail_url = (
            f"https://{s3_thumbnail_bucket}.s3.ap-southeast-2.amazonaws.com/{thumbnail_key}"
        )
        print(f"Thumbnail uploaded to s3://{s3_thumbnail_bucket}/{thumbnail_key}")

        # Convert the image from BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Load the model
        nets = load_model(CFG, Weights)
        
        # Perform prediction
        result = do_prediction(image, nets, Lables)
        response = dynamodb.put_item(
            TableName=TABLE_NAME,
            Item={
                "s3_url": {"S": s3_url},
                #"tags": {"SS": [str(item) for item in result]},
                "tags": {"L": [{'S': str(item)} for item in result]},
                "thumbnail_url": {"S": thumbnail_url},
            },
        )
        message = {
    "default": f"Image {s3_url} added",
    "email": f"Image {s3_url} has been added with tags {', '.join(result)}"
}
        sns_response = sns_client.publish(
    TopicArn=sns_topic_arn,
    Message=json.dumps(message),
    Subject="New Image Uploaded with Tags",
    MessageStructure='json',
    MessageAttributes={
        'tags': {
            'DataType': 'String.Array',
            'StringValue': json.dumps(result)
        }
    }
)

       

    return {
        "statusCode": 200,
        "body": json.dumps("Records successfully inserted into database..."),
    }
