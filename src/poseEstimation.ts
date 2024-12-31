import { Holistic, POSE_LANDMARKS } from "@mediapipe/holistic";
import { Camera } from "@mediapipe/camera_utils/camera_utils.js";
import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils/drawing_utils.js";
import {
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
  FACEMESH_TESSELATION,
} from "@mediapipe/holistic";
import { animateModel } from "./animator";

const videoElement = document.getElementsByClassName(
  "input_video"
)[0] as HTMLVideoElement;

videoElement.src = "/wavinghand.mp4";
videoElement.width = 640;
videoElement.height = 480;

const guideCanvas = document.getElementsByClassName(
  "output_canvas"
)[0] as HTMLCanvasElement;
const canvasCtx = guideCanvas.getContext("2d")!;

const btn = document.getElementById("startBtn") as HTMLButtonElement;
const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  },
});

const onResults = (results: {
  faceLandmarks: any;
  za: any;
  poseLandmarks: any;
  rightHandLandmarks: any;
  leftHandLandmarks: any;
}) => {
  // Draw landmark guides
  animateModel(results, videoElement);
  removeLandmarks(results);
  drawResults(results);
};
holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: false,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  selfieMode: false,
});
holistic.onResults(results=>{console.log(results)});

const drawResults = (results: {
  faceLandmarks?: any;
  ea?: any;
  poseLandmarks: any;
  rightHandLandmarks: any;
  leftHandLandmarks: any;
  image?: any;
}) => {
  guideCanvas.width = 640;
  guideCanvas.height = 480;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    guideCanvas.width,
    guideCanvas.height
  );

  if (results.poseLandmarks) {
    if (results.rightHandLandmarks) {
      canvasCtx.strokeStyle = "white";
      connect(canvasCtx, [
        [
          results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW],
          results.rightHandLandmarks[0],
        ],
      ]);
    }
    if (results.leftHandLandmarks) {
      canvasCtx.strokeStyle = "white";
      connect(canvasCtx, [
        [
          results.poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW],
          results.leftHandLandmarks[0],
        ],
      ]);
    }
  }

  // if (results.poseLandmarks) {
  //   console.log(results.poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW])
  // }
  // Use `Mediapipe` drawing functions
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#00cff7",
    lineWidth: 1,
  });
  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: "#ff0364",
    lineWidth: 1,
    radius: 1,
  });
  // drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, {
  //   color: "#C0C0C070",
  //   lineWidth: 1,
  // });
  // if (results.faceLandmarks && results.faceLandmarks.length === 478) {
  //   //draw pupils
  //   drawLandmarks(
  //     canvasCtx,
  //     [results.faceLandmarks[468], results.faceLandmarks[468 + 5]],
  //     {
  //       color: "#ffe603",
  //       lineWidth: 1,
  //     }
  //   );
  // }
  drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
    color: "#eb1064",
    lineWidth: 1,
  });
  drawLandmarks(canvasCtx, results.leftHandLandmarks, {
    color: "#00cff7",
    lineWidth: 1,
    radius: 1,
  });
  drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, {
    color: "#22c3e3",
    lineWidth: 1,
  });
  drawLandmarks(canvasCtx, results.rightHandLandmarks, {
    color: "#ff0364",
    lineWidth: 1,
    radius: 1,
  });

  //console.log(results);
};

function removeElements(landmarks: { [x: string]: any }, elements: number[]) {
  for (const element of elements) {
    delete landmarks[element];
  }
}

function removeLandmarks(results: {
  faceLandmarks?: any;
  ea?: any;
  poseLandmarks: any;
  rightHandLandmarks?: any;
  leftHandLandmarks?: any;
}) {
  if (results.poseLandmarks) {
    removeElements(
      results.poseLandmarks,
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]
    );
  }
}

function connect(ctx: CanvasRenderingContext2D, connectors: any[][]) {
  const canvas = ctx.canvas;
  for (const connector of connectors) {
    const from = connector[0];
    const to = connector[1];
    if (from && to) {
      if (
        from.visibility &&
        to.visibility &&
        (from.visibility < 0.1 || to.visibility < 0.1)
      ) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
      ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
      ctx.stroke();
    }
  }
}
// const camera = new Camera(videoElement, {
//   onFrame: async () => {
//     await holistic.send({ image: videoElement });
//   },
//   width: 640,
//   height: 480,
// });
// camera.start();

async function startDetection() {
  if (videoElement.paused) {
    videoElement.play();
    detectFrame();
  }
}

async function detectFrame() {
  if (!videoElement.paused) {
    await holistic.send({ image: videoElement });
    requestAnimationFrame(detectFrame);
  }
}
export function initialize() {
  btn.addEventListener("click", startDetection);
}
