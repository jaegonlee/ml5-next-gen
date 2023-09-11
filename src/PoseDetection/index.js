// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/*
PoseDetection
https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/web_js
https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/src/blazepose_mediapipe
*/

import EventEmitter from "events";
import * as tf from "@tensorflow/tfjs";
import * as bodyPoseDetection from "@tensorflow-models/pose-detection";
import callCallback from "../utils/callcallback";
import handleArguments from "../utils/handleArguments";
import { mediaReady } from "../utils/imageUtilities";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";


class LowPassFilter {

  setAlpha(alpha) {
    if (alpha <= 0.0 || alpha > 1.0)
      console.log("alpha should be in (0.0., 1.0]");
    this.a = alpha;
  }

  constructor(alpha, initval = 0.0) {
    this.y = this.s = initval;
    this.setAlpha(alpha);
    this.initialized = false;
  }

  filter(value) {
    var result;
    if (this.initialized)
      result = this.a * value + (1.0 - this.a) * this.s;
    else {
      result = value;
      this.initialized = true;
    }
    this.y = value;
    this.s = result;
    return result;
  }

  filterWithAlpha(value, alpha) {
    this.setAlpha(alpha);
    return this.filter(value);
  }

  hasLastRawValue() {
    return this.initialized;
  }

  lastRawValue() {
    return this.y;
  }

  lastFilteredValue() {
    return this.s;
  }

  reset() {
    this.initialized = false;
  }

}

// -----------------------------------------------------------------

class OneEuroFilter {

  alpha(cutoff) {
    var te = 1.0 / this.freq;
    var tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / te);
  }

  setFrequency(f) {
    if (f <= 0) console.log("freq should be >0");
    this.freq = f;
  }

  setMinCutoff(mc) {
    if (mc <= 0) console.log("mincutoff should be >0");
    this.mincutoff = mc;
  }

  setBeta(b) {
    this.beta_ = b;
  }

  setDerivateCutoff(dc) {
    if (dc <= 0) console.log("dcutoff should be >0");
    this.dcutoff = dc;
  }

  constructor(freq, mincutoff = 1.0, beta_ = 0.0, dcutoff = 1.0) {
    this.setFrequency(freq);
    this.setMinCutoff(mincutoff);
    this.setBeta(beta_);
    this.setDerivateCutoff(dcutoff);
    this.x = new LowPassFilter(this.alpha(mincutoff));
    this.dx = new LowPassFilter(this.alpha(dcutoff));
    this.lasttime = undefined;
  }

  reset() {
    this.x.reset();
    this.dx.reset();
    this.lasttime = undefined;
  }

  filter(value, timestamp = undefined) {
    // update the sampling frequency based on timestamps
    if (this.lasttime != undefined && timestamp != undefined)
      this.freq = 1.0 / (timestamp - this.lasttime);

    this.lasttime = timestamp;
    // estimate the current variation per second 
    var dvalue = this.x.hasLastRawValue() ? (value - this.x.lastFilteredValue()) * this.freq : 0.0;
    var edvalue = this.dx.filterWithAlpha(dvalue, this.alpha(this.dcutoff));
    // use it to update the cutoff frequency
    var cutoff = this.mincutoff + this.beta_ * Math.abs(edvalue);
    // filter the given value

    return this.x.filterWithAlpha(value, this.alpha(cutoff));
  }
}


class PoseDetection extends EventEmitter {

  /**
   * Create a mediapipe blazepose model.
   * @param {HTMLVideoElement || p5.Video} video  - Optional. A HTML video element or a p5 video element.
   * @param {options} options - Optional. An object describing a model accuracy and performance.
   * @param {function} callback  Optional. A function to run once the model has been loaded.
   *    If no callback is provided, it will return a promise that will be resolved once the
   *    model has loaded.
   */
  constructor(video, options, callback) {
    super();

    this.video = video;
    this.model = null;
    this.modelReady = false;
    this.config = options;
    this.poseLandmarker;
    this.lastVideoTime = -1;
    this.result = [];
    this.POSE_CONNECTIONS = PoseLandmarker.POSE_CONNECTIONS;
    this.ready = callCallback(this.loadModel(), callback);
    this.filterX = [];
    this.filterY = [];
    this.filter =  options.filter ?? true;

    let frequency = 120; // Hz
    let mincutoff = options.cutoff ?? 12.0; // Hz
    let beta = options.beta ?? 0.03;
    let dcutoff = 1.0;

    for (let j = 0; j < this.config.numPoses; j++) {
      let fx = [];
      let fy = [];
      for (let i = 0; i < 33; i++) {
        fx.push(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
        fy.push(new OneEuroFilter(frequency, mincutoff, beta, dcutoff));
      }
      this.filterX.push(fx); 
      this.filterY.push(fy); 
    }
  }

  /**
   * Load the model and set it to this.model
   * @return {this} the detector model.
   */
  async loadModel() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const modelConfig = {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      minPoseDetectionConfidence: this.config.minPoseDetectionConfidence ?? 0.5,
      minPosePresenceConfidence: this.config.minPosePresenceConfidence ?? 0.5,
      minTrackingConfidence: this.config.minTrackingConfidence ?? 0.5,
      numPoses: this.config.numPoses ?? 1,
      outputSegmentationMasks: this.config.outputSegmentationMasks ?? false,
    }

    switch (this.config.modelType) {
      case "full":
        modelConfig.baseOptions.modelAssetPath = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";
        break;
      case "lite":
        modelConfig.baseOptions.modelAssetPath = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
        break;
      default:
        modelConfig.baseOptions.modelAssetPath = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task";
    }

    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, modelConfig);

    // Load the detector model
    // await tf.ready();
    // this.model = await bodyPoseDetection.createDetector(pipeline, modelConfig);
    this.modelReady = true;
    if (this.video) {
      this.predict();
    }

    return this;
  }

  //TODO: Add named keypoints to a MoveNet pose object

  /**
   * Given an image or video, returns an array of objects containing pose estimations
   * @param {HTMLVideoElement || p5.Video || function} inputOr - An HMTL or p5.js image, video, or canvas element to run the prediction on.
   * @param {function} cb - A callback function to handle the predictions.
   */
  async predict(inputOr, cb) {
    const { image, callback } = handleArguments(this.video, inputOr, cb);
    if (!image) {
      throw new Error("No input image found.");
    }
    // If video is provided, wait for video to be loaded
    await mediaReady(image, false);

    let startTimeMs = performance.now();

    if (image.currentTime !== this.lastVideoTime) {
      this.poseLandmarker.detectForVideo(image, startTimeMs, (result) => {
      if (this.filter) {
        let r = [];
        for (let i = 0; i < result.landmarks.length; i++) {
          let a = [];
          for (let j = 0; j < 33; j++) {
            let x = this.filterX[i][j].filter(result.landmarks[i][j].x);
            let y = this.filterY[i][j].filter(result.landmarks[i][j].y);
            a.push({ "x": x, "y": y });
          }
          r.push(a);
        }
        this.result = r;
      }
      else this.result = result.landmarks;

      });
      this.lastVideoTime = image.currentTime;
    }
    // TODO: Add named keypoints to each pose object
    this.emit("pose", this.result);

    if (this.video) {
      return tf.nextFrame().then(() => this.predict());
    }

    if (typeof callback === "function") {
      callback(this.result);
    }
    return this.result;
  }
}

const poseDetection = (...inputs) => {
  const { video, options = {}, callback } = handleArguments(...inputs);
  return new PoseDetection(video, options, callback);
};

export default poseDetection;
