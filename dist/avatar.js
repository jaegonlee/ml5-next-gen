// jshint esversion:8

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

let avatar;
let bodypose;
let video;
let poses = [];
let particles = [];
let 몸관절 = [];
let 아바타관절 = [];
let 파티클속도 = 3;
let 파티클노이즈 = 0;
let 파티클중력 = 0;
let fw = 1;
let fh = 1;
let 연결점표시 = true;
let cam;

let 왼팔길이1 = 0;
let 왼팔길이2 = 0;
let 오른팔길이1 = 0;
let 오른팔길이2 = 0;
let 어깨너비 = 100;
let 엉덩이너비 = 80;
let 몸통길이 = 120;
let 왼쪽어깨 = {};
let 오른쪽어깨 = {};
let 왼쪽다리 = {};
let 오른쪽다리 = {};
let 목길이 = 20;
let 머리크기 = 50;

function preload() {
  let options = { modelType: "full", flipHorizontal: true };
  bodypose = ml5.bodypose("BlazePose", options);
  이미지로드();
}
let 아바타설정;
let AvatarSetting = function () {
  this.머리크기 = 머리크기;
  this.어깨너비 = 어깨너비;
  this.엉덩이너비 = 엉덩이너비;
  this.몸통길이 = 몸통길이;
  this.왼팔길이1 = 왼팔길이1;
  this.왼팔길이2 = 왼팔길이2;
  this.왼다리길이1 = 왼다리길이1;
  this.왼다리길이2 = 왼다리길이2;
  this.오른팔길이1 = 오른팔길이1;
  this.오른팔길이2 = 오른팔길이2;
  this.오른다리길이1 = 오른다리길이1;
  this.오른다리길이2 = 오른다리길이2;
};
function 초기설정() {
  const gui = new dat.GUI();
  아바타설정 = new AvatarSetting();

  let g2 = gui.addFolder("아바타설정");
  g2.add(아바타설정, "머리크기", 10, 100).step(1).listen();
  g2.add(아바타설정, "어깨너비", 10, 300).step(1).listen();
  g2.add(아바타설정, "엉덩이너비", 10, 300).step(1).listen();
  g2.add(아바타설정, "몸통길이", 10, 300).step(1).listen();
  g2.add(아바타설정, "왼팔길이1", 10, 300).step(1).listen();
  g2.add(아바타설정, "왼팔길이2", 10, 300).step(1).listen();
  g2.add(아바타설정, "왼다리길이1", 10, 300).step(1).listen();
  g2.add(아바타설정, "왼다리길이2", 10, 300).step(1).listen();
  g2.add(아바타설정, "오른팔길이1", 10, 300).step(1).listen();
  g2.add(아바타설정, "오른팔길이2", 10, 300).step(1).listen();
  g2.add(아바타설정, "오른다리길이1", 10, 300).step(1).listen();
  g2.add(아바타설정, "오른다리길이2", 10, 300).step(1).listen();

  cam = createGraphics(640, 480);
  avatar = new Avatar();
  video = createCapture(VIDEO, function () {
    fw = width / video.width;
    fh = height / video.height;
  });
  video.hide();
  for (let i = 0; i < 33; i++) {
    몸관절[i] = { x: -100, y: -100 };
    아바타관절[i] = { x: -100, y: -100 };
  }
  bodypose.detectStart(video, gotPoses);
}

function gotPoses(results) {
  poses = results;
}

function 시작() {
  머리크기 = 아바타설정.머리크기;
  어깨너비 = 아바타설정.어깨너비;
  엉덩이너비 = 아바타설정.엉덩이너비;
  몸통길이 = 아바타설정.몸통길이;
  왼팔길이1 = 아바타설정.왼팔길이1;
  왼팔길이2 = 아바타설정.왼팔길이2;
  왼다리길이1 = 아바타설정.왼다리길이1;
  왼다리길이2 = 아바타설정.왼다리길이2;
  오른팔길이1 = 아바타설정.오른팔길이1;
  오른팔길이2 = 아바타설정.오른팔길이2;
  오른다리길이1 = 아바타설정.오른다리길이1;
  오른다리길이2 = 아바타설정.오른다리길이2;

  cam.background(0);
  cam.push();
  cam.translate(640, 0);
  cam.scale(-1, 1);
  cam.image(video, 0, 0);
  cam.pop();
  if (poses.length > 0) {
    몸관절 = poses[0].keypoints.map((obj) => {
      return { x: obj.x * fw, y: obj.y * fh };
    });
    avatar.calculate();
  }
}

function 아바타그리기() {
  if (poses.length > 0) {
    avatar.drawBody();
    avatar.drawRightLeg();
    avatar.drawLeftLeg();
    avatar.drawHead();
    avatar.drawRightArm();
    avatar.drawLeftArm();
  }
}

function 몸통그리기() {
  avatar.drawBody();
}

function 왼다리그리기() {
  avatar.drawRightLeg();
}

function 오른다리그리기() {
  avatar.drawLeftLeg();
}

function 왼팔그리기() {
  avatar.drawRightArm();
}

function 오른팔그리기() {
  avatar.drawLeftArm();
}

function 머리그리기() {
  avatar.drawHead();
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

function 파티클생성(x, y, shape) {
  particles.push(new Particle(x, y, shape));
}

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

function 아바타관절그리기() {
  if (poses.length > 0) {
    for (let i = 0; i < 13; i++) {
      noStroke();
      fill(255);
      ellipse(아바타관절[i].x, 아바타관절[i].y, 20, 20);
    }
  }
}

function 몸관절그리기() {
  if (poses.length > 0) {
    for (let i = 0; i < poses[0].keypoints.length; i++) {
      let keypoint = poses[0].keypoints[i];
      fill(255);
      noStroke();
      circle(keypoint.x * fw, keypoint.y * fh, 6);
      stroke(255);
      strokeWeight(2);
      let a = POSE_CONNECTIONS[i];
      let x = poses[0].keypoints[a.start].x * fw;
      let y = poses[0].keypoints[a.start].y * fh;
      let x1 = poses[0].keypoints[a.end].x * fw;
      let y1 = poses[0].keypoints[a.end].y * fh;
      line(x, y, x1, y1);
    }
  }
}

function basicShape(alpha) {
  ellipse(0, 0, 10, 10);
}

class Particle {
  constructor(x, y, d = basicShape) {
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
    this.hipAngle = 0;
    this.centerX = 0;
    this.centerY = 0;
    this.bodyWidth = 0;
    this.bodyHeight = 0;
  }

  calculate() {
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
    this.hipAngle = Math.atan2(
      몸관절[23].y - 몸관절[24].y,
      몸관절[23].x - 몸관절[24].x
    );
    this.centerX = (몸관절[23].x + 몸관절[24].x) / 2;
    this.centerY = (몸관절[23].y + 몸관절[24].y) / 2;

    let x = this.centerX + Math.cos(this.hipAngle) * (엉덩이너비 / 2);
    let y = this.centerY + Math.sin(this.hipAngle) * (엉덩이너비 / 2);
    아바타관절[8] = { x: x, y: y };
    x = this.centerX - Math.cos(this.hipAngle) * (엉덩이너비 / 2);
    y = this.centerY - Math.sin(this.hipAngle) * (엉덩이너비 / 2);
    아바타관절[7] = { x: x, y: y };

    let x1 = this.centerX + Math.cos(this.hipAngle - PI / 2) * 몸통길이;
    let y1 = this.centerY + Math.sin(this.hipAngle - PI / 2) * 몸통길이;

    x =
      this.centerX +
      Math.cos(this.hipAngle - PI / 2) * (몸통길이 + 목길이 + 머리크기 / 2);
    y =
      this.centerY +
      Math.sin(this.hipAngle - PI / 2) * (몸통길이 + 목길이 + 머리크기 / 2);
    아바타관절[0] = { x: x, y: y };

    x = x1 + Math.cos(this.hipAngle) * (어깨너비 / 2);
    y = y1 + Math.sin(this.hipAngle) * (어깨너비 / 2);
    아바타관절[2] = { x: x, y: y };
    x = 아바타관절[2].x + Math.cos(this.rightShoulderAngle) * 오른팔길이1;
    y = 아바타관절[2].y + Math.sin(this.rightShoulderAngle) * 오른팔길이1;
    아바타관절[4] = { x: x, y: y };
    x = 아바타관절[4].x + Math.cos(this.rightArmAngle) * 오른팔길이2;
    y = 아바타관절[4].y + Math.sin(this.rightArmAngle) * 오른팔길이2;
    아바타관절[6] = { x: x, y: y };

    x = 아바타관절[8].x + Math.cos(this.rightLegAngle) * 오른다리길이1;
    y = 아바타관절[8].y + Math.sin(this.rightLegAngle) * 오른다리길이1;
    아바타관절[10] = { x: x, y: y };
    x = 아바타관절[10].x + Math.cos(this.rightKneeAngle) * 오른다리길이2;
    y = 아바타관절[10].y + Math.sin(this.rightKneeAngle) * 오른다리길이2;
    아바타관절[12] = { x: x, y: y };

    x = x1 - Math.cos(this.hipAngle) * (어깨너비 / 2);
    y = y1 - Math.sin(this.hipAngle) * (어깨너비 / 2);
    아바타관절[1] = { x: x, y: y };
    x = 아바타관절[1].x + Math.cos(this.leftShoulderAngle) * 왼팔길이1;
    y = 아바타관절[1].y + Math.sin(this.leftShoulderAngle) * 왼팔길이1;
    아바타관절[3] = { x: x, y: y };
    x = 아바타관절[3].x + Math.cos(this.leftArmAngle) * 왼팔길이2;
    y = 아바타관절[3].y + Math.sin(this.leftArmAngle) * 왼팔길이2;
    아바타관절[5] = { x: x, y: y };

    x = 아바타관절[7].x + Math.cos(this.leftLegAngle) * 왼다리길이1;
    y = 아바타관절[7].y + Math.sin(this.leftLegAngle) * 왼다리길이1;
    아바타관절[9] = { x: x, y: y };
    x = 아바타관절[9].x + Math.cos(this.leftKneeAngle) * 왼다리길이2;
    y = 아바타관절[9].y + Math.sin(this.leftKneeAngle) * 왼다리길이2;
    아바타관절[11] = { x: x, y: y };
  }

  drawBody() {
    push();
    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    몸통();
    pop();
  }

  drawLeftLeg() {
    push();
    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    translate(-엉덩이너비 / 2, 0);
    push();
    rotate(this.leftLegAngle - PI / 2 - this.hipAngle);
    오른다리1();
    if (연결점표시) drawJoint();
    translate(0, 오른다리길이1); 
    rotate(this.leftKneeAngle - this.leftLegAngle);
    오른다리2();
    drawJoint();
    pop();
    pop();
  }

  drawRightLeg() {
    push();
    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    translate(엉덩이너비 / 2, 0);
    push();
    rotate(this.rightLegAngle - PI / 2 - this.hipAngle);
    왼다리1();
    if (연결점표시) drawJoint();
    translate(0, 왼다리길이1);

    rotate(this.rightKneeAngle - this.rightLegAngle);
    왼다리2();
    if (연결점표시) drawJoint();
    pop();
    pop();
  }

  drawLeftArm() {
    noStroke();
    push();
    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    translate(-어깨너비 / 2, -몸통길이);
    push();
    rotate(this.leftShoulderAngle - PI / 2);
    왼팔1();
    if (연결점표시) drawJoint();
    translate(0, 왼팔길이1);
    rotate(this.leftArmAngle - this.leftShoulderAngle);
    왼팔2();
    if (연결점표시) drawJoint();
    pop();
    pop();
  }

  drawRightArm() {
    push();

    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    translate(어깨너비 / 2, -몸통길이);
    push();
    translate(this.rightShoulderPos.x, this.rightShoulderPos.y);
    rotate(this.rightShoulderAngle - PI / 2);
    오른팔1();
    if (연결점표시) drawJoint();
    translate(0, 오른팔길이1);
    rotate(this.rightArmAngle - this.rightShoulderAngle);
    오른팔2();
    if (연결점표시) drawJoint();
    pop();
    pop();
  }

  drawHead() {
    push();
    translate(this.centerX, this.centerY);
    rotate(this.hipAngle);
    translate(0, -몸통길이 - 목길이);
    rotate(this.headAngle);
    머리();
    if (연결점표시) drawJoint();
    pop();
  }
}

function drawJoint() {
  fill(255, 0, 0);
  ellipse(0, 0, 6, 6);
}

let 분류결과 = "없음";
let 확률 = 0;
let model;
let maxPredictions;
let net;
let body = 0;

async function AI설정() {
    ml5.setBackend('webgl');

  await initPrediction();
  // net = await tmPose.load();
  console.log("자세 모델을 불러왔습니다.");
  window.requestAnimationFrame(anim);
}

async function initPrediction() {
  let e = 모델주소 + "model.json";
  let t = 모델주소 + "metadata.json";
  model = await tmPose.load(e, t);
  maxPredictions = model.getTotalClasses();
}

async function anim(e) {
  await predict();
  // await getPoses();
  window.requestAnimationFrame(anim);
}

async function predict() {
  if (video && video.elt && video.loadedmetadata && model) {
    let { pose, posenetOutput } = await model.estimatePose(video.elt);
    const prediction = await model.predict(posenetOutput);
    // print(prediction);
    let r;
    for (let p of prediction) {
      if (!r) {
        r = p;
      } else {
        if (p.probability > r.probability) {
          r = p;
        }
      }
    }
    분류결과 = r.className;
    확률 = round(r.probability * 100);
    // drawPose(pose);
  }
}
