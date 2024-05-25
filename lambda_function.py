import json
import boto3
import os
import sys
import uuid
from urllib.parse import unquote_plus
import numpy as np
import time
import cv2
import os
#from flask import Flask, request, jsonify
#import uuid
import base64


s3_client = boto3.client('s3')
dynamodb = boto3.client('dynamodb')
TABLE_NAME = 'image_info'
s3_config_bucket = 'ass3configfiles'
labels_path = 'coco.names'
weights_path = 'yolov3-tiny.weights'
config_path = 'yolov3-tiny.cfg'

# construct the argument parse and parse the arguments
confthres = 0.3
nmsthres = 0.1

def get_labels(s3_config_bucket, labels_path):
    # Get the object from S3
    response = s3.get_object(Bucket=s3_config_bucket, Key=labels_path)
    # Read the content of the file
    content = response['Body'].read().decode('utf-8')
    # Split the content into labels
    LABELS = content.strip().split("\n")
    return LABELS

def get_weights(weights_path):
    temp_file_path = '/tmp/yolov3-tiny.weights'
    # Download the weights file from S3
    s3.download_file(s3_config_bucket, weights_path, temp_file_path)
    return temp_file_path

def get_config(config_path):
    # Temporary file path to store the downloaded file
    temp_file_path = '/tmp/yolov3-tiny.cfg'
    # Download the config file from S3
    s3.download_file(s3_config_bucket, config_path, temp_file_path)
    return temp_file_path

def load_model(configpath,weightspath):
    # load our YOLO object detector trained on COCO dataset (80 classes)
    print("[INFO] loading YOLO from disk...")
    net = cv2.dnn.readNetFromDarknet(configpath, weightspath)
    return net
    
def do_prediction(image,net,LABELS):
    (H, W) = image.shape[:2]
    # determine only the *output* layer names that we need from YOLO
    ln = net.getLayerNames()
    ln = [ln[i - 1] for i in net.getUnconnectedOutLayers()]

    # construct a blob from the input image and then perform a forward
    # pass of the YOLO object detector, giving us our bounding boxes and
    # associated probabilities
    blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416),
                                 swapRB=True, crop=False)
    net.setInput(blob)
    start = time.time()
    layerOutputs = net.forward(ln)
    #print(layerOutputs)
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
    idxs = cv2.dnn.NMSBoxes(boxes, confidences, confthres,
                            nmsthres)

    #Output according to assessment specifications
    detected_labels = []
    
    if len(idxs) > 0:
        for i in idxs.flatten():
            label = LABELS[classIDs[i]]
            detected_labels.append(label)
    
    return detected_labels
    # detection_results = []
    # detection_dict = {}
    # detection_dict["id"] = id
    # if len(idxs) > 0:
    #     for i in idxs.flatten():
    #         label = LABELS[classIDs[i]]
    #         accuracy = confidences[i]
    #         rect = {"left": boxes[i][0], "top": boxes[i][1], "width": boxes[i][2], "height": boxes[i][3]}
    #         detection_results.append({"label": label, "accuracy": accuracy, "rectangle": rect})
    #     detection_dict['objects'] = detection_results
    # else:
    #     detection_results.append({"label": "label", "accuracy": "accuracy", "rectangle": "rect"})
    #     detection_dict['objects'] = detection_results
    # return detection_dict

# Lables=get_labels(s3_config_bucket, labels_path)
# CFG=get_config(config_path)
# Weights=get_weights(weights_path)
    
def lambda_handler(event, context):
   Lables=get_labels(s3_config_bucket, labels_path)
   CFG=get_config(config_path)
   Weights=get_weights(weights_path)
   for record in event['Records']:
       bucket = record['s3']['bucket']['name']
       key = unquote_plus(record['s3']['object']['key'])
       s3_url = f"s3://{bucket}/{key}"
       print("File {0} uploaded to {1} bucket".format(key, bucket))
       image_response = s3_client.get_object(Bucket=bucket, Key=key)
       image_content = image_response['Body'].read()
       # Convert the image content to an array that OpenCV can work with
       nparr = np.frombuffer(image_content, np.uint8)
       image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
       # Convert the image from BGR to RGB
       image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
       # Load the model
       nets = load_model(CFG, Weights)
       # Perform prediction
       result = do_prediction(image, nets, Lables)
       response = dynamodb.put_item(
            TableName=TABLE_NAME,
            Item={
                's3_url': {'S': s3_url},
                'tags': {'L': [{'S': str(item)} for item in result]}
            }
        )

       
    #   csvcontent = csvfile['Body'].read().decode('utf8').splitlines()
    #   for line in csvcontent:
    #       tokens = line.strip().split(",")
    #       if len(tokens) > 2:
    #           data = {}
    #           data['id'] = {'S': str(uuid.uuid4())}
    #           data['title'] = {'S': tokens[0].strip()}
    #           data['desc'] = {'S': tokens[1].strip()}
    #           data['done'] = {'S': tokens[2].strip()}
    #           response = dynamodb.put_item(TableName=TABLE_NAME, Item=data)
   return {
       'statusCode': 200,
       'body': json.dumps('Records successfully inserted into database...')
   }

