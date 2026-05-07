import React, { useRef, useEffect } from 'react';
import { emotionAPI } from '../utils/api';

const BackgroundEmotionTracker = ({ enabled }) => {
  const videoRef = useRef(null);
  const faceMeshRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (enabled) {
      initMediaPipe();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [enabled]);

  const initMediaPipe = async () => {
    try {
      console.log("Initializing Mood Tracking (MediaPipe)...");
      
      if (!window.isSecureContext) {
        console.error("Camera tracking requires a secure HTTPS connection.");
        return;
      }
      if (!window.FaceMesh || !window.Camera) {
        console.log("MediaPipe scripts not ready, retrying in 1s...");
        setTimeout(initMediaPipe, 1000);
        return;
      }

      // Initialize FaceMesh from the global window object (loaded via script tag)
      const faceMesh = new window.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240, frameRate: 10 } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start camera utils to feed the video frames to faceMesh
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current) {
              await faceMesh.send({image: videoRef.current});
            }
          },
          width: 320,
          height: 240
        });
        camera.start();
      }
    } catch (err) {
      console.error("Geometric tracking initialization failed:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      console.log("Stopping Geometric Tracker");
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const onResults = async (results) => {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      // console.log("No face detected");
      return;
    }

    if (processingRef.current) return;

    const landmarks = results.multiFaceLandmarks[0];
    
    // 0. Reference: Face Width (Cheek to Cheek)
    const faceLeft = landmarks[234];
    const faceRight = landmarks[454];
    const faceWidth = Math.sqrt(Math.pow(faceRight.x - faceLeft.x, 2) + Math.pow(faceRight.y - faceLeft.y, 2)) || 1;

    // 1. Mouth Stretch (Smile) - Normalized by face width
    const mouthLeft = landmarks[61];
    const mouthRight = landmarks[291];
    const rawMouthWidth = Math.sqrt(Math.pow(mouthRight.x - mouthLeft.x, 2) + Math.pow(mouthRight.y - mouthLeft.y, 2));
    const smileRatio = rawMouthWidth / faceWidth;
    
    // 2. Mouth Openness (Surprise)
    const topLip = landmarks[13];
    const bottomLip = landmarks[14];
    const rawMouthOpen = Math.sqrt(Math.pow(bottomLip.x - topLip.x, 2) + Math.pow(bottomLip.y - topLip.y, 2));
    const mouthRatio = rawMouthOpen / faceWidth;

    // 3. Eyebrow Height (Fear/Anxiety)
    const leftEyebrow = landmarks[70];
    const leftEye = landmarks[159];
    const rawEyebrowHeight = Math.sqrt(Math.pow(leftEye.x - leftEyebrow.x, 2) + Math.pow(leftEye.y - leftEyebrow.y, 2));
    const eyebrowRatio = rawEyebrowHeight / faceWidth;

    // 4. Mouth Corners Drop (Sadness)
    const mouthCenter = landmarks[0];
    const cornersY = (mouthLeft.y + mouthRight.y) / 2;
    const mouthDrop = (cornersY - mouthCenter.y) / faceWidth;

    // 5. Brow Furrow (Anger/Frustration) - Normalized distance between eyebrows
    const leftInnerBrow = landmarks[52];
    const rightInnerBrow = landmarks[282];
    const browDistance = Math.sqrt(Math.pow(rightInnerBrow.x - leftInnerBrow.x, 2) + Math.pow(rightInnerBrow.y - leftInnerBrow.y, 2)) / faceWidth;

    // LOGGING FOR CALIBRATION
    console.log(`[Tracking] Ratios -> Smile: ${smileRatio.toFixed(3)}, Mouth: ${mouthRatio.toFixed(3)}, Brows: ${eyebrowRatio.toFixed(3)}, Drop: ${mouthDrop.toFixed(3)}, BrowDist: ${browDistance.toFixed(3)}`);

    // Heuristic Logic for Emotions (REFINED NEURAL MAPPING)
    let dominant = 'Neutral';
    let intensity = 0.2;

    // 1. ANGER / FRUSTRATION (Prioritize furrowed brows and narrow distance)
    if (eyebrowRatio < 0.21 || browDistance < 0.12) {
      dominant = 'Anger';
      intensity = Math.min(1.0, (0.22 - eyebrowRatio) * 15 + (0.13 - browDistance) * 5);
    } 
    // 2. SURPRISE / FEAR (Raised brows, open mouth)
    else if (mouthRatio > 0.12 || eyebrowRatio > 0.26) {
      dominant = mouthRatio > 0.15 ? 'Surprise' : 'Fear';
      intensity = Math.min(1.0, mouthRatio * 5 + (eyebrowRatio - 0.25) * 10);
    }
    // 3. JOY (Wide mouth, relaxed brows)
    else if (smileRatio > 0.39) {
      dominant = 'Joy';
      intensity = Math.min(1.0, (smileRatio - 0.38) * 12);
    }
    // 4. SADNESS (Mouth corners down)
    else if (mouthDrop > 0.003) {
      dominant = 'Sadness';
      intensity = Math.min(1.0, mouthDrop * 50);
    }

    processingRef.current = true;
    try {
      // 1. Dispatch LOCAL event for zero-latency UI update
      const syncEvent = new CustomEvent('mood-update', {
        detail: { emotion: dominant, intensity: intensity, timestamp: new Date() }
      });
      window.dispatchEvent(syncEvent);

      // 2. Sync to backend for reports
      await emotionAPI.record({
        emotion: dominant,
        intensity: intensity,
        source: 'geometric_tracker',
        note: `S:${smileRatio.toFixed(3)} D:${mouthDrop.toFixed(3)} B:${eyebrowRatio.toFixed(3)}`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("[Neural Tracker] Sync Error:", err);
    } finally {
      setTimeout(() => { processingRef.current = false; }, 400); // 400ms for ultra-responsiveness
    }
  };

  return (
    <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
      <video ref={videoRef} muted playsInline />
    </div>
  );
};

export default BackgroundEmotionTracker;
