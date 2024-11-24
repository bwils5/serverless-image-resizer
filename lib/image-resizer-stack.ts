import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Function, Runtime, Code } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3'; // Missing import
import * as path from 'path';

export class ImageResizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for storing uploaded images
    const bucket = new Bucket(this, 'ImageUploadBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Lambda function for resizing images
    const imageResizer = new Function(this, 'ImageResizerFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'image-resizer.handler',
      code: Code.fromAsset(path.join(__dirname, '../lambda')), // Points to the lambda directory
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Grant the Lambda function permissions to read and write to the S3 bucket
    bucket.grantReadWrite(imageResizer);

    // Set up S3 to trigger the Lambda function on object creation events
    imageResizer.addEventSource(new S3EventSource(bucket, {
      events: [s3.EventType.OBJECT_CREATED],
    }));
  }
}

