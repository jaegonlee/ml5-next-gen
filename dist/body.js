const POSE_CONNECTIONS = [
  { start: 0, end: 1 },
  { start: 1, end: 2 },
  { start: 2, end: 3 },
  { start: 3, end: 7 },
  { start: 4, end: 5 },
  { start: 5, end: 6 },
  { start: 6, end: 8 },
  { start: 9, end: 10 },
  { start: 0, end: 4 },
  { start: 11, end: 12 },
  { start: 11, end: 13 },
  { start: 13, end: 15 },
  { start: 15, end: 17 },
  { start: 15, end: 19 },
  { start: 15, end: 21 },
  { start: 17, end: 19 },
  { start: 12, end: 14 },
  { start: 14, end: 16 },
  { start: 16, end: 18 },
  { start: 16, end: 20 },
  { start: 16, end: 22 },
  { start: 18, end: 20 },
  { start: 11, end: 23 },
  { start: 12, end: 24 },
  { start: 23, end: 24 },
  { start: 23, end: 25 },
  { start: 24, end: 26 },
  { start: 25, end: 27 },
  { start: 26, end: 28 },
  { start: 27, end: 29 },
  { start: 28, end: 30 },
  { start: 29, end: 31 },
  { start: 30, end: 32 },
  { start: 27, end: 31 },
  { start: 28, end: 32 },
];

let bodypose;
let video;
let poses = [];
let options = { flipHorizontal: false };
let particles = [];
let 몸관절 = [];
let 파티클속도 = 3;
let 파티클노이즈 = 0;
let 파티클중력 = 0;
let fw = 1;
let fh = 1;
let avatarSetting = function() {
  this.몸통너비= 0.6;
  this.몸통길이= 0.6;
  this.팔길이=0.2;
  this.다리길이= 0.2;
  this.팔굵기= 0.01;
  this.다리굵기= 0.02;
  this.머리크기= 0.2;
};

let 아바타설정 = new avatarSetting();

function preload() {
  let options = {modelType:"heavy"};
  bodypose = ml5.bodypose("BlazePose", options);
  이미지로드();
}

function 초기설정() {
  video = createCapture(VIDEO, function () {
    fw = width / video.width;
    fh = height / video.height;
  });
  video.hide();
  for (let i = 0; i < 33; i++) {
    몸관절[i] = { x: -100, y: -100 };
  }
  bodypose.detectStart(video, gotPoses);
  imageMode(CENTER);
}

function 시작() {
  if (poses.length > 0) {
    for (let i = 0; i < poses[0].keypoints.length; i++) {
      let keypoint = poses[0].keypoints[i];
      몸관절[i] = { x: keypoint.x * fw, y: keypoint.y * fh };
    }
    // noseAngle =
    //   atan2(
    //     poses[0].keypoints[6].y - poses[0].keypoints[1].y,
    //     poses[0].keypoints[6].x - poses[0].keypoints[1].x
    //   ) +
    //   PI / 2;
  }
}

function 끝() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].move();
    particles[i].draw();
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].life < 0) {
      particles.splice(i, 1);
    }
  }
}
function 파티클생성(shape, x, y) {
  particles.push(new Particle(x, y, shape));
}

let 코 = { x: 0, y: 0, width: 0, height: 0 };
let 얼굴 = { x: 0, y: 0, width: 0, height: 0 };
let 왼쪽눈 = { x: 0, y: 0, width: 0, height: 0 };
let 오른쪽눈 = { x: 0, y: 0, width: 0, height: 0 };
let 입 = { x: 0, y: 0, width: 0, height: 0 };
const NOSE = [6, 1, 94, 102, 331];
let noseAngle = 0;

// Draw keypoints for specific face element positions
function drawPartsKeypoints() {
  // If there is at least one face
  if (poses.length > 0) {
    for (let i = 0; i < poses[0].lips.length; i++) {
      let lips = poses[0].lips[i];
      fill(0, 255, 0);
      circle(lips.x * fw, lips.y * fh, 3);
    }

    for (let i = 0; i < poses[0].leftEye.length; i++) {
      let leftEye = poses[0].leftEye[i];
      fill(0, 255, 0);
      circle(leftEye.x * fw, leftEye.y * fh, 3);
    }

    for (let i = 0; i < poses[0].rightEye.length; i++) {
      let rightEye = poses[0].rightEye[i];
      fill(0, 255, 0);
      circle(rightEye.x * fw, rightEye.y * fh, 3);
    }

    for (let i = 0; i < poses[0].faceOval.length; i++) {
      let faceOval = poses[0].faceOval[i];
      fill(0, 255, 0);
      circle(faceOval.x * fw, faceOval.y * fh, 3);
    }

    for (let i = 0; i < NOSE.length; i++) {
      let index = NOSE[i];
      let point = poses[0].keypoints[index];
      fill(0, 255, 0);
      circle(point.x * fw, point.y * fh, 3);
    }
  }
}

// Draw bounding box for specific face element positions
function 얼굴그리기(func) {
  // If there is at least one face
  if (poses.length > 0) {
    noFill();
    stroke(255);

    let box = poses[0].box;
    rectMode(CENTER);
    얼굴 = {
      x: (box.xMin + box.width / 2) * fw,
      y: (box.yMin + box.height / 2) * fh,
      width: box.width * fw,
      height: (box.height / 2) * fh,
    };
    push();
    translate(
      (box.xMin + box.width / 2) * fw,
      (box.yMin + box.height / 2) * fh
    );
    rotate(noseAngle);
    func(box.width * fw, box.height * fh);
    pop();
  }
}

function 코그리기(func) {
  // If there is at least one face
  if (poses.length > 0) {
    let noseX = [];
    let noseY = [];
    for (let i = 0; i < NOSE.length; i++) {
      let index = NOSE[i];
      let point = poses[0].keypoints[index];
      noseX.push(point.x * fw);
      noseY.push(point.y * fh);
    }
    let minX = min(noseX);
    let minY = min(noseY);
    let maxX = max(noseX);
    let maxY = max(noseY);
    let w = maxX - minX;
    let h = maxY - minY;
    코 = { x: minX + w / 2, y: minY + h / 2, width: w, height: h };
    push();
    translate(minX + w / 2, minY + h / 2);
    rotate(noseAngle);
    func(w, h);
    pop();
  }
}

function 입그리기(func) {
  // If there is at least one face
  if (poses.length > 0) {
    let lipsX = [];
    let lipsY = [];
    for (let i = 0; i < poses[0].lips.length; i++) {
      let lips = poses[0].lips[i];
      lipsX.push(lips.x * fw);
      lipsY.push(lips.y * fh);
    }
    push();
    minX = min(lipsX);
    minY = min(lipsY);
    maxX = max(lipsX);
    maxY = max(lipsY);
    w = maxX - minX;
    h = maxY - minY;
    입 = { x: minX + w / 2, y: minY + h / 2, width: w, height: h };
    translate(minX + w / 2, minY + h / 2);
    rotate(noseAngle);
    func(w, h);
    // rect(0,0,w,h);
    pop();
  }
}

function 왼쪽눈그리기(func) {
  // If there is at least one face
  if (poses.length > 0) {
    let leftEyeX = [];
    let leftEyeY = [];
    for (let i = 0; i < poses[0].leftEye.length; i++) {
      let leftEye = poses[0].leftEye[i];
      leftEyeX.push(leftEye.x * fw);
      leftEyeY.push(leftEye.y * fh);
    }
    push();
    minX = min(leftEyeX);
    minY = min(leftEyeY);
    maxX = max(leftEyeX);
    maxY = max(leftEyeY);
    w = maxX - minX;
    h = maxY - minY;
    왼쪽눈 = { x: minX + w / 2, y: minY + h / 2, width: w, height: h };
    translate(minX + w / 2, minY + h / 2);
    rotate(noseAngle);
    func(w, h);
    pop();
  }
}

function 오른쪽눈그리기(func) {
  // If there is at least one face
  if (poses.length > 0) {
    let rightEyeX = [];
    let rightEyeY = [];
    for (let i = 0; i < poses[0].rightEye.length; i++) {
      let rightEye = poses[0].rightEye[i];
      rightEyeX.push(rightEye.x * fw);
      rightEyeY.push(rightEye.y * fh);
    }
    push();
    minX = min(rightEyeX);
    minY = min(rightEyeY);
    maxX = max(rightEyeX);
    maxY = max(rightEyeY);
    w = maxX - minX;
    h = maxY - minY;
    오른쪽눈 = { x: minX + w / 2, y: minY + h / 2, width: w, height: h };
    translate(minX + w / 2, minY + h / 2);
    rotate(noseAngle);
    func(w, h);
    // rect(0, 0, w, h);
    pop();
  }
}

// Callback function for when bodypose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}

// Draw keypoints for specific face element positions
function 몸관절그리기() {
  if (poses.length > 0) {
    for (let i = 0; i < poses[0].keypoints.length; i++) {
      let keypoint = poses[0].keypoints[i];
      fill(255);
      noStroke();
      circle(keypoint.x * fw, keypoint.y * fh, 6);
      // text(i,keypoint.x * fw, keypoint.y * fh + 10);
      stroke(255);
      strokeWeight(2);
      let a = POSE_CONNECTIONS[i];
      let x = poses[0].keypoints[a.start].x;
      let y = poses[0].keypoints[a.start].y;
      let x1 = poses[0].keypoints[a.end].x;
      let y1 = poses[0].keypoints[a.end].y;
      line(x, y, x1, y1);
    }
  }
}

class Particle {
  constructor(x, y, d) {
    this.x = x;
    this.y = y;
    this.ax = 0;
    this.ay = 0;
    this.gravity = 파티클중력;
    this.vx = random(-1, 1) * 파티클속도;
    this.vy = random(-1, 1) * 파티클속도;
    this.angle = 0;
    this.life = 255;
    this.shape = d;
    this.turbulence = 파티클노이즈;
  }

  move() {
    if (this.turbulence > 0) {
      this.angle =
        noise(this.x * 0.01, this.y * 0.01, frameCount * 0.03) * TWO_PI * 2;
      this.ax = Math.cos(this.angle) * 0.5;
      this.ay = Math.sin(this.angle) * 0.5;
    }
    this.ay += this.gravity;
    this.vx += this.ax;
    this.vy += this.ay;
    this.x = this.x + this.vx;
    this.y = this.y + this.vy;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      this.life = 0;
    }
  }

  draw() {
    // tint(255, this.life);
    // fill(255, this.life);
    push();
    translate(this.x, this.y);
    this.shape(this.life);
    pop();
    this.life = this.life - 5;
  }
}



class Avatar {
  constructor() {
    this.leftLegPos = { x: 0, y: 0 };
    this.leftKneePos = { x: 0, y: 0 };
    this.leftArmPos = { x: 0, y: 0 };
    this.leftShoulderPos = { x: 0, y: 0 };
    this.headAngle = 0;
    this.leftLegAngle = 0;
    this.leftArmAngle = 0;
    this.leftShoulderAngle = 0;
    this.leftKneeAngle = 0;
    this.rightLegPos = { x: 0, y: 0 };
    this.rightKneePos = { x: 0, y: 0 };
    this.rightArmPos = { x: 0, y: 0 };
    this.rightShoulderPos = { x: 0, y: 0 };
    this.rightLegAngle = 0;
    this.rightArmAngle = 0;
    this.rightShoulderAngle = 0;
    this.rightKneeAngle = 0;
  }

  calculateAngle() {
    this.headAngle = Math.atan2(
      몸관절[7].y - 몸관절[8].y,
      몸관절[7].x - 몸관절[8].x
    );
    this.shoulderAngle = Math.atan2(
      몸관절[12].y - 몸관절[11].y,
      몸관절[12].x - 몸관절[11].x
    );
    this.leftArmAngle = Math.atan2(
      몸관절[16].y - 몸관절[14].y,
      몸관절[16].x - 몸관절[14].x
    );
    this.leftShoulderAngle = Math.atan2(
      몸관절[14].y - 몸관절[12].y,
      몸관절[14].x - 몸관절[12].x
    );
    this.rightArmAngle = Math.atan2(
      몸관절[15].y - 몸관절[13].y,
      몸관절[15].x - 몸관절[13].x
    );
    this.rightShoulderAngle = Math.atan2(
      몸관절[13].y - 몸관절[11].y,
      몸관절[13].x - 몸관절[11].x
    );

    this.leftLegAngle = Math.atan2(
      몸관절[26].y - 몸관절[24].y,
      몸관절[26].x - 몸관절[24].x
    );
    this.leftKneeAngle = Math.atan2(
      몸관절[28].y - 몸관절[26].y,
      몸관절[28].x - 몸관절[26].x
    );
    this.rightLegAngle = Math.atan2(
      몸관절[25].y - 몸관절[23].y,
      몸관절[25].x - 몸관절[23].x
    );
    this.rightKneeAngle = Math.atan2(
      몸관절[27].y - 몸관절[25].y,
      몸관절[27].x - 몸관절[25].x
    );
  }

  draw(head, arm, leg) {
    this.calculateAngle();
    // let upperBody = 모양.어깨너비;
    // let lowerBody = 모양.엉덩이크기;
    // let bodyHeight = 모양.몸높이;
    let armLength = 0;
    let legLength = 0;
    let legWidth = 0;
    let armWidth = 0;

    let lx = lerp(몸관절[12].x, 몸관절[11].x, 1.0 - 아바타설정.몸통너비);
    let rx = lerp(몸관절[12].x, 몸관절[11].x, 아바타설정.몸통너비);
    let leftShoulder = { x: lx, y: 몸관절[12].y };
    let rightShoulder = { x: rx, y: 몸관절[11].y };
    lx = lerp(몸관절[24].x, 몸관절[23].x, 1.0 - 아바타설정.몸통너비);
    rx = lerp(몸관절[24].x, 몸관절[23].x, 아바타설정.몸통너비);
    let ly = lerp(몸관절[12].y, 몸관절[24].y, 아바타설정.몸통길이);
    let ry = lerp(몸관절[11].y, 몸관절[23].y, 아바타설정.몸통길이);
    let leftHip = { x: lx, y: ly };
    let rightHip = { x: rx, y: ry };
    let d = dist(몸관절[12].x, 몸관절[12].y, 몸관절[23].x, 몸관절[23].y);
    armLength = d * 아바타설정.팔길이;
    legLength = d * 아바타설정.다리길이;
    armWidth = d * 아바타설정.팔굵기;
    legWidth = d * 아바타설정.다리굵기;

    //body
    push();
    beginShape();
    vertex(몸관절[0].x, 몸관절[0].y);
    vertex(rightShoulder.x + armWidth, rightShoulder.y);
    vertex(rightHip.x + legWidth, rightHip.y);
    vertex(leftHip.x - legWidth, leftHip.y);
    vertex(leftShoulder.x - armWidth, leftShoulder.y);
    endShape(CLOSE);
    pop();

    // arms
    // left arm
    noStroke();
    push();
    translate(leftShoulder.x, leftShoulder.y);
    push();
    translate(this.leftShoulderPos.x, this.leftShoulderPos.y);
    rotate(this.leftShoulderAngle);
    ellipse(0, 0, armWidth * 2);
    rect(0, -armWidth, armLength, armWidth * 2);
    pop();

    let x = Math.cos(this.leftShoulderAngle) * armLength;
    let y = Math.sin(this.leftShoulderAngle) * armLength;

    push();
    translate(this.leftArmPos.x + x, this.leftArmPos.y + y);
    rotate(this.leftArmAngle);
    ellipse(0, 0, armWidth * 2);
    quad(0, -armWidth, armLength, -2, armLength, 2, 0, armWidth);
    arm(armLength);
    pop();
    pop();

    // right arm
    push();
    translate(rightShoulder.x, rightShoulder.y);
    push();
    translate(this.rightShoulderPos.x, this.rightShoulderPos.y);
    rotate(this.rightShoulderAngle);
    ellipse(0, 0, armWidth * 2);
    rect(0, -armWidth, armLength, armWidth * 2);
    pop();

    x = Math.cos(this.rightShoulderAngle) * armLength;
    y = Math.sin(this.rightShoulderAngle) * armLength;
    push();
    translate(this.rightArmPos.x + x, this.rightArmPos.y + y);
    rotate(this.rightArmAngle);
    ellipse(0, 0, armWidth * 2);
    quad(0, -armWidth, armLength, -2, armLength, 2, 0, armWidth);
    pop();
    pop();

    // legs
    push();
    translate(leftHip.x, leftHip.y);
    push();
    translate(this.leftLegPos.x, this.leftLegPos.y);
    rotate(this.leftLegAngle);
    ellipse(0, 0, legWidth * 2);
    rect(0, -legWidth, legLength, legWidth * 2);
    pop();

    x = Math.cos(this.leftLegAngle) * legLength;
    y = Math.sin(this.leftLegAngle) * legLength;
    push();
    translate(this.leftKneePos.x + x, this.leftKneePos.y + y);
    rotate(this.leftKneeAngle);
    ellipse(0, 0, legWidth * 2);
    quad(0, -legWidth, legLength, -2, legLength, 2, 0, legWidth);
    leg(legLength);
    pop();
    pop();

    push();
    translate(rightHip.x, rightHip.y);
    push();
    translate(this.rightLegPos.x, this.rightLegPos.y);
    rotate(this.rightLegAngle);
    ellipse(0, 0, legWidth * 2);
    rect(0, -legWidth, legLength, legWidth * 2);
    pop();

    x = Math.cos(this.rightLegAngle) * legLength;
    y = Math.sin(this.rightLegAngle) * legLength;
    push();
    translate(this.rightKneePos.x + x, this.rightKneePos.y + y);
    rotate(this.rightKneeAngle);
    ellipse(0, 0, legWidth * 2);
    quad(0, -legWidth, legLength, -2, legLength, 2, 0, legWidth);
    pop();
    pop();

    // head
    // d = dist(몸관절[7].x, 몸관절[7].y, 몸관절[8].x, 몸관절[8].y);
    push();
    translate(몸관절[0].x, 몸관절[0].y);
    rotate(this.headAngle);
    // ellipse(0, 0, d * 아바타설정.머리크기);
    head(d * 아바타설정.머리크기);
    pop();
  }
}
