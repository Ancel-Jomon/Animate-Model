import * as THREE from "three";
import { model } from "./main";
import * as kalidokit from "kalidokit";
import { poseBones } from "./bones";

var currentVrm = model;

const rigRotation = (
  name: string,
  rotation = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {
    return;
  }
  const Part = currentVrm.getObjectByName(name);
  if (!Part) {
    return;
  }

  let euler = new THREE.Euler(
    rotation.x * dampener,
    rotation.y * dampener,
    rotation.z * dampener
  );
  let quaternion = new THREE.Quaternion().setFromEuler(euler);
  Part.quaternion.slerp(quaternion, lerpAmount); // interpolate
};

// Animate Position Helper Function
const rigPosition = (
  name: string,
  position = { x: 0, y: 0, z: 0 },
  dampener = 1,
  lerpAmount = 0.3
) => {
  if (!currentVrm) {
    return;
  }
  const Part = currentVrm.getObjectByName(name);
  if (!Part) {
    return;
  }
  let vector = new THREE.Vector3(
    position.x * dampener,
    position.y * dampener,
    position.z * dampener
  );
  Part.position.lerp(vector, lerpAmount); // interpolate
};

export const animateModel = (
  results: {
    faceLandmarks: any;
    za: any;
    poseLandmarks: any;
    rightHandLandmarks: any;
    leftHandLandmarks: any;
  },
  videoElement: HTMLVideoElement
) => {
  console.log("animate called");
  if (!model) {
    return;
  }
  // Take the results from `Holistic` and animate character based on its Face, Pose, and Hand Keypoints.
  var riggedPose: kalidokit.TPose | undefined,
    riggedLeftHand: any,
    riggedRightHand: any,
    riggedFace: kalidokit.TFace | undefined;

  const faceLandmarks = results.faceLandmarks;
  // Pose 3D Landmarks are with respect to Hip distance in meters
  const pose3DLandmarks = results.za;
  // Pose 2D landmarks are with respect to videoWidth and videoHeight
  const pose2DLandmarks = results.poseLandmarks;
  // Be careful, hand landmarks may be reversed
  const leftHandLandmarks = results.rightHandLandmarks;
  const rightHandLandmarks = results.leftHandLandmarks;

  // Animate Face
  // if (faceLandmarks) {
  //  riggedFace = kalidokit.Face.solve(faceLandmarks,{
  //     runtime:"mediapipe",
  //     video:videoElement
  //  });

  // }
  if (faceLandmarks) {
    riggedFace = kalidokit.Face.solve(faceLandmarks, {
      runtime: "mediapipe",
      video: videoElement,
    });
    if (riggedFace) {
      rigRotation(poseBones.neck, riggedFace.head, 0.7);
    }
  }

  // Animate Pose
  if (pose2DLandmarks && pose3DLandmarks) {
    console.log("poselandmarks");
    riggedPose = kalidokit.Pose.solve(pose3DLandmarks, pose2DLandmarks, {
      runtime: "mediapipe",
      video: videoElement,
    });

    if (riggedPose) {
      rigRotation(poseBones.hip, riggedPose.Hips.rotation, 0.7);
      rigPosition(
        poseBones.hip,
        {
          x: -riggedPose.Hips.position.x, // Reverse direction
          y: riggedPose.Hips.position.y + 1, // Add a bit of height
          z: -riggedPose.Hips.position.z, // Reverse direction
        },
        1,
        0.07
      );

      //rigRotation("Chest", riggedPose.Spine, 0.25, .3);
      rigRotation(poseBones.spine2, riggedPose.Spine, 0.45, 0.3);

      rigRotation(poseBones.rightUpperArm, riggedPose.RightUpperArm, 1, 0.3);
      rigRotation(poseBones.rightLowerArm, riggedPose.RightLowerArm, 1, 0.3);
      rigRotation(poseBones.leftUpperArm, riggedPose.LeftUpperArm, 1, 0.3);
      rigRotation(poseBones.leftLowerarm, riggedPose.LeftLowerArm, 1, 0.3);

      rigRotation(poseBones.leftUpperLeg, riggedPose.LeftUpperLeg, 1, 0.3);
      rigRotation(poseBones.leftLowerLeg, riggedPose.LeftLowerLeg, 1, 0.3);
      rigRotation(poseBones.rightUpperLeg, riggedPose.RightUpperLeg, 1, 0.3);
      rigRotation(poseBones.rightLowerLeg, riggedPose.RightLowerLeg, 1, 0.3);
    }
  }
};
