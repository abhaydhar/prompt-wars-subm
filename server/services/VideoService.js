import { VideoIntelligenceServiceClient } from '@google-cloud/video-intelligence';
import { Storage } from '@google-cloud/storage';
import path from 'path';

const client = new VideoIntelligenceServiceClient();
const storage = new Storage();

// Bucket for temporary video storage (required for Video Intelligence API)
// Default to the service project ID or an environment variable
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || `${process.env.GOOGLE_CLOUD_PROJECT}-temp-videos`;

/**
 * Analyzes video content using Google Cloud Video Intelligence API
 * Performs Label Detection and Shot Change Detection
 */
export const analyzeVideo = async (file) => {
  try {
    const fileName = `temp-${Date.now()}-${file.originalname}`;
    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;

    console.log(`[VideoService] Uploading file to ${gcsUri}...`);
    const bucket = storage.bucket(BUCKET_NAME);
    
    // Create bucket if it doesn't exist
    const [exists] = await bucket.exists();
    if (!exists) {
      await storage.createBucket(BUCKET_NAME);
    }

    const gcsFile = bucket.file(fileName);
    await gcsFile.save(file.buffer);

    const request = {
      inputUri: gcsUri,
      features: ['LABEL_DETECTION', 'SHOT_CHANGE_DETECTION'],
    };

    console.log(`[VideoService] Annotating video...`);
    const [operation] = await client.annotateVideo(request);
    const [operationResult] = await operation.promise();

    // Clean up temporary file
    await gcsFile.delete().catch(console.error);

    const annotations = operationResult.annotationResults[0];
    
    return {
      shots: (annotations.shotAnnotations || []).map((shot, i) => ({
        index: i + 1,
        start: shot.startTimeOffset.seconds || 0,
        end: shot.endTimeOffset.seconds || 0
      })),
      labels: (annotations.segmentLabelAnnotations || []).map(label => ({
        description: label.entity.description,
        segments: (label.segments || []).map(seg => ({
          start: seg.segment.startTimeOffset.seconds || 0,
          end: seg.segment.endTimeOffset.seconds || 0,
          confidence: seg.confidence
        }))
      }))
    };
  } catch (err) {
    console.error('[VideoService] Error:', err);
    throw err;
  }
};
