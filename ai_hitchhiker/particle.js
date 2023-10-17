class Particle {
  constructor(x, y, d) {
    this.x = x + random(-파티클설정.생성위치랜덤, 파티클설정.생성위치랜덤);
    this.y = y + random(-파티클설정.생성위치랜덤, 파티클설정.생성위치랜덤);               this.ax = 0;
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
    this.shape = d;
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
    strokeWeight(4);
    stroke(255);
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
  constructor() {
    this.leftLegPos = { x: 0, y: 0 };
    this.leftKneePos = { x: 0, y: 0 };
    this.leftArmPos = { x: 0, y: 0 };
    this.leftShoulderPos = { x: 0, y: 0 };
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
    this.shoulderAngle = Math.atan2(
      관절[12].y - 관절[11].y,
      관절[12].x - 관절[11].x
    );
    this.leftArmAngle = Math.atan2(
      관절[16].y - 관절[14].y,
      관절[16].x - 관절[14].x
    );
    this.leftShoulderAngle = Math.atan2(
      관절[14].y - 관절[12].y,
      관절[14].x - 관절[12].x
    );
    this.rightArmAngle = Math.atan2(
      관절[15].y - 관절[13].y,
      관절[15].x - 관절[13].x
    );
    this.rightShoulderAngle = Math.atan2(
      관절[13].y - 관절[11].y,
      관절[13].x - 관절[11].x
    );

    this.leftLegAngle = Math.atan2(
      관절[26].y - 관절[24].y,
      관절[26].x - 관절[24].x
    );
    this.leftKneeAngle = Math.atan2(
      관절[28].y - 관절[26].y,
      관절[28].x - 관절[26].x
    );
    this.rightLegAngle = Math.atan2(
      관절[25].y - 관절[23].y,
      관절[25].x - 관절[23].x
    );
    this.rightKneeAngle = Math.atan2(
      관절[27].y - 관절[25].y,
      관절[27].x - 관절[25].x
    );
  }

  draw(모양, pg = drawingContext) {
    this.calculateAngle();
    let upperBody = 모양.어깨너비;
    let lowerBody = 모양.엉덩이크기;
    let bodyHeight = 모양.몸높이;
    let armLength = 모양.팔길이;
    let legLength = 모양.다리길이;
    let legWidth = 모양.다리굵기;
    let armWidth = 모양.팔굵기;

    let leftShoulder = { x: (관절[12].x * 0.6 + 320 * 0.4), y: 관절[12].y };
    let rightShoulder = { x: (관절[11].x * 0.6 + 320 * 0.4), y: 관절[11].y };
    let leftHip = { x: 관절[24].x * 0.5 + 160, y: 관절[24].y * 0.9 };
    let rightHip = { x: 관절[23].x * 0.5 + 160, y: 관절[23].y * 0.9 };

    // head
    let d = dist(관절[7].x, 관절[7].y, 관절[8].x, 관절[8].y);
    ellipse(관절[0].x * 0.6 + 320 * 0.4, 관절[9].y, d, d);

    //body
    stroke(255);
    strokeWeight(legWidth * 2);
    push();
    beginShape();
    vertex(관절[0].x * 0.6 + 320 * 0.4, 관절[9].y);
    vertex(rightShoulder.x, rightShoulder.y);
    vertex(rightHip.x, rightHip.y);
    vertex(leftHip.x, leftHip.y);
    vertex(leftShoulder.x, leftShoulder.y);
    endShape(CLOSE);
    pop();
    strokeWeight(0);
    
    // arms
    push();
    translate(leftShoulder.x, leftShoulder.y);
    push();
    translate(this.leftShoulderPos.x, this.leftShoulderPos.y);
    rotate(this.leftShoulderAngle);
    ellipse(0, 0, 10, 10);
    rect(0, -armWidth, armLength, armWidth * 2);
    pop();

    let x = Math.cos(this.leftShoulderAngle) * armLength;
    let y = Math.sin(this.leftShoulderAngle) * armLength;

    push();
    translate(this.leftArmPos.x + x, this.leftArmPos.y + y);
    rotate(this.leftArmAngle);
    ellipse(0, 0, 10, 10);
    quad(0, -armWidth, armLength, -1, armLength, 1, 0, armWidth);
    pop();
    pop();

    push();
    translate(rightShoulder.x, rightShoulder.y);
    push();
    translate(this.rightShoulderPos.x, this.rightShoulderPos.y);
    rotate(this.rightShoulderAngle);
    ellipse(0, 0, 10, 10);
    rect(0, -armWidth, armLength, armWidth * 2);
    pop();

    x = Math.cos(this.rightShoulderAngle) * armLength;
    y = Math.sin(this.rightShoulderAngle) * armLength;
    push();
    translate(this.rightArmPos.x + x, this.rightArmPos.y + y);
    rotate(this.rightArmAngle);
    ellipse(0, 0, 10, 10);
    quad(0, -armWidth, armLength, -1, armLength, 1, 0, armWidth);
    pop();
    pop();
    
    // legs
    push();
    translate(leftHip.x, leftHip.y);
    push();
    translate(this.leftLegPos.x, this.leftLegPos.y);
    rotate(this.leftLegAngle);
    ellipse(0, 0, 10, 10);
    rect(0, -legWidth, legLength, legWidth * 2);
    pop();

    x = Math.cos(this.leftLegAngle) * legLength;
    y = Math.sin(this.leftLegAngle) * legLength;
    push();
    translate(this.leftKneePos.x + x, this.leftKneePos.y + y);
    rotate(this.leftKneeAngle);
    ellipse(0, 0, 10, 10);
    quad(0, -legWidth, legLength, -1, legLength, 1, 0, legWidth);
    pop();
    pop();

    push();
    translate(rightHip.x, rightHip.y);
    push();
    translate(this.rightLegPos.x, this.rightLegPos.y);
    rotate(this.rightLegAngle);
    ellipse(0, 0, 10, 10);
    rect(0, -legWidth, legLength, legWidth * 2);
    pop();

    x = Math.cos(this.rightLegAngle) * legLength;
    y = Math.sin(this.rightLegAngle) * legLength;
    push();
    translate(this.rightKneePos.x + x, this.rightKneePos.y + y);
    rotate(this.rightKneeAngle);
    ellipse(0, 0, 10, 10);
    quad(0, -legWidth, legLength, -1, legLength, 1, 0, legWidth);
    pop();
    pop();
  }

}
