class Particle {
  constructor(x, y, d) {
    this.x = x + random(-파티클설정.생성위치랜덤, 파티클설정.생성위치랜덤);
    this.y = y + random(-파티클설정.생성위치랜덤, 파티클설정.생성위치랜덤);    
    this.ax = 0;
    this.ay = 0;
    this.gravity = 파티클설정.중력;
    this.turbulence = 파티클설정.난기류;
    this.vx = random(-1, 1) * 3;
    this.vy = random(-1, 1) * 3;
    this.angle = 0;
    this.life = 255;
    this.shape = d;
    this.decay = 파티클설정.지속시간;
  }

  move() {
    if (this.turbulence > 0) {
      this.angle =
        noise(this.x * 0.01, this.y * 0.01, frameCount * 0.03) * TWO_PI * 2;
      this.ax = cos(this.angle) * 0.5;
      this.ay = sin(this.angle) * 0.5;
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
    // fill(255, this.life);
    this.shape(this.x, this.y, this.life);
    this.life = this.life - this.decay;
  }
}


class Trail {
  constructor(x, y, d) {
    this.x = [];
    this.y = [];

    this.x[0] = x;
    this.y[0] = y;
    this.shape = function () {
      strokeWeight(1);
      stroke(255);      
    };
    this.capacity = 100;
  }

  add(pos) {
    this.x.push(pos.x);
    this.y.push(pos.y);
  }

  smooth() {
    let weight = 18;
    let scale = 1.0 / (weight + 2);
    let nPointsMinusTwo = this.x.length - 2;
    let lowerx, upperx, centerx;
    let lowery, uppery, centery;

    for (let i = 1; i < nPointsMinusTwo; i++) {
      lowerx = this.x[i - 1];
      centerx = this.x[i];
      upperx = this.x[i + 1];
      lowery = this.y[i - 1];
      centery = this.y[i];
      uppery = this.y[i + 1];

      centerx = (lowerx + weight * centerx + upperx) * scale;
      centery = (lowery + weight * centery + uppery) * scale;
      this.x[i] = centerx;
      this.y[i] = centery;
    }
  }

  reset() {
    this.x = [];
    this.y = [];
  }

  draw() {
    noFill();
    // strokeWeight(4);
    // stroke(255);
    this.shape();
    beginShape();
    for (let i = 0; i < this.x.length; i++) {
      vertex(this.x[i], this.y[i]);
    }
    endShape();
    strokeWeight(1);

    if (this.x.length > this.capacity) {
      this.x.shift();
      this.y.shift();
    }
  }
}

class Body {
  constructor(points) {
    this.x = [];
    this.y = [];
    this.vx = [];
    this.vy = [];
    this.life = 255;
    this.num = points.length;
    this.red = 255;
    this.green = 255;
    this.blue = 255;
    this.offset = random(3);
    this.size = random(3, 7);
    for (let i = 0; i < this.num; i++) {
      // print(points);
      this.x[i] = points[i].x;
      this.y[i] = points[i].y;
      this.vx[i] = random(-2, 2);
      this.vy[i] = random(-2, 2);
    }
  }

  draw() {
    for (let i = 0; i < this.num; i++) {
      let a = POSE_CONNECTIONS[i];
      if (기본설정.shadowdecay) {
        if (this.life < 150) {
          this.x[i] += this.vx[i];
          this.y[i] += this.vy[i];
        }
      }
      strokeWeight(1);
      stroke(this.red, this.green, this.blue, this.life);
      let x = this.x[a.start];
      let y = this.y[a.start];
      let x1 = this.x[a.end];
      let y1 = this.y[a.end];
      line(x, y, x1, y1);
      noStroke();
      fill(255, this.life);
      // fill(192 + Math.sin(frameCount * 0.2 + this.offset + i) * 64, this.life);
      ellipse(this.x[i], this.y[i], this.size);
    }
    this.life -= 2.0;
  }
}

class Avatar {
  constructor(joints) {
    this.joints = joints;
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
      this.joints[7].y - this.joints[8].y,
      this.joints[7].x - this.joints[8].x
    );
    this.shoulderAngle = Math.atan2(
      this.joints[12].y - this.joints[11].y,
      this.joints[12].x - this.joints[11].x
    );
    this.leftArmAngle = Math.atan2(
      this.joints[16].y - this.joints[14].y,
      this.joints[16].x - this.joints[14].x
    );
    this.leftShoulderAngle = Math.atan2(
      this.joints[14].y - this.joints[12].y,
      this.joints[14].x - this.joints[12].x
    );
    this.rightArmAngle = Math.atan2(
      this.joints[15].y - this.joints[13].y,
      this.joints[15].x - this.joints[13].x
    );
    this.rightShoulderAngle = Math.atan2(
      this.joints[13].y - this.joints[11].y,
      this.joints[13].x - this.joints[11].x
    );

    this.leftLegAngle = Math.atan2(
      this.joints[26].y - this.joints[24].y,
      this.joints[26].x - this.joints[24].x
    );
    this.leftKneeAngle = Math.atan2(
      this.joints[28].y - this.joints[26].y,
      this.joints[28].x - this.joints[26].x
    );
    this.rightLegAngle = Math.atan2(
      this.joints[25].y - this.joints[23].y,
      this.joints[25].x - this.joints[23].x
    );
    this.rightKneeAngle = Math.atan2(
      this.joints[27].y - this.joints[25].y,
      this.joints[27].x - this.joints[25].x
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

    let lx = lerp(this.joints[12].x, this.joints[11].x, 1.0 - 아바타설정.몸통너비);
    let rx = lerp(this.joints[12].x, this.joints[11].x, 아바타설정.몸통너비);    
    let leftShoulder = { x: lx, y: this.joints[12].y };
    let rightShoulder = { x: rx, y: this.joints[11].y };
    lx = lerp(this.joints[24].x, this.joints[23].x, 1.0 - 아바타설정.몸통너비);
    rx = lerp(this.joints[24].x, this.joints[23].x, 아바타설정.몸통너비);
    let ly = lerp(this.joints[12].y, this.joints[24].y, 아바타설정.몸통길이);
    let ry = lerp(this.joints[11].y, this.joints[23].y, 아바타설정.몸통길이);    
    let leftHip = { x: lx, y: ly };
    let rightHip = { x: rx, y: ry };
    let d = dist(this.joints[12].x, this.joints[12].y, this.joints[23].x, this.joints[23].y);
    armLength = d * 아바타설정.팔길이;
    legLength = d * 아바타설정.다리길이;
    armWidth = d * 아바타설정.팔굵기;
    legWidth = d * 아바타설정.다리굵기;

    //body
    push();
    beginShape();
    vertex(this.joints[0].x, this.joints[0].y);
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
    // d = dist(관절[7].x, 관절[7].y, 관절[8].x, 관절[8].y);
    push();
    translate(this.joints[0].x, this.joints[0].y);
    rotate(this.headAngle);
    // ellipse(0, 0, d * 아바타설정.머리크기);
    head(d * 아바타설정.머리크기);
    pop(); 
  }
}
