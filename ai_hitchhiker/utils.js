// 참고링크
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/web_js#video
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker#pose_landmarker_model

let Settings = function () {
  this.관절표시 = true;
  this.격자 = false;
  this.좌우반전 = false;
  this.배경색 = [128, 128, 128, 0];
  this.배경색_투명도 = 255;
  this.정보출력 = false;
  this.멀티포즈 = false;
  this.포즈분류 = false;
  this.궤적활성화 = false;
};

let ParticleSetting = function () {
  this.활성화 = false;
  this.생성부위 = "전체";
  this.지속시간 = 1;
  this.중력 = 0;
  this.생성위치랜덤 = 0;
  this.난기류 = 0.1;
  this.생성빈도 = 1;
};

let AvatarSetting = function () {
  this.활성화 = false;
  this.머리크기 = 0.25;
  this.몸통너비 = 0.8;
  this.몸통길이 = 1;
  this.팔길이 = 0.3;
  this.다리길이 = 0.5;
  this.팔굵기 = 0.02;
  this.다리굵기 = 0.02;
};

let 기본설정 = new Settings();
let gui = new dat.GUI();
let g0 = gui.addFolder("기본설정");
g0.add(기본설정, "관절표시").listen();
g0.add(기본설정, "격자").listen();
g0.add(기본설정, "좌우반전").listen();
g0.addColor(기본설정, "배경색").listen();
g0.add(기본설정, "배경색_투명도", 0, 255).step(1).listen();
g0.add(기본설정, "정보출력").listen();
g0.add(기본설정, "포즈분류").listen();
g0.add(기본설정, "멀티포즈").listen();
g0.add(기본설정, "궤적활성화").listen();
g0.open();
let 파티클설정 = new ParticleSetting();
let g1 = gui.addFolder("파티클설정");
g1.add(파티클설정, "활성화").listen();
g1.add(파티클설정, "지속시간", 1, 60).step(0.1).listen();
g1.add(파티클설정, "중력", -1, 1).step(0.01).listen();
g1.add(파티클설정, "생성위치랜덤", 0, 50).step(1).listen();
g1.add(파티클설정, "난기류", 0, 1).step(0.01).listen();
g1.add(파티클설정, "생성빈도", 1, 60).step(1).listen();
g1.open();

let hideGUI = false;

// 자세 인식
let video;
let poseDetection;
let 관절 = [];
let 관절2 = [];
let 관절3 = [];
let 관절4 = [];
let poses = [];
let particles = [];
let trails = [];

// 자세 분류
let 분류결과 = "";
let 확률 = 0;
let brain;
let dataButton;
let dataLabel;
let buttonAIsPressed = false;
let buttonBIsPressed = false;
let buttonCIsPressed = false;
let trainButton;
let loadButton;
let saveButton;
let classificationP;
let compiled = false;
let AImages = 0;
let BImages = 0;
let CImages = 0;
let body_in = false;
let body_in_last = false;
let trained = false;
let samplesA = [];
let samplesB = [];
let samplesC = [];

function 초기설정(number = 1) {
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  for (let i = 0; i < 33; i++) {
    관절[i] = { x: -100, y: -100 };
    관절2[i] = { x: -100, y: -100 };
    관절3[i] = { x: -100, y: -100 };
    관절4[i] = { x: -100, y: -100 };
    trails[i] = new Trail(random(width), random(height), null);
  }

  ml5.setBackend("webgl");
  poseDetection = ml5.poseDetection(video, { numPoses: number }, function () {
    print("pose detection model ready");
  });
  poseDetection.on("pose", function (results) {
    poses = results;
  });

  setupAI();
  // const modelDetails = {
  //   model: 'model/model.json',
  //   metadata: 'model/model_meta.json',
  //   weights: 'model/model.weights.bin'
  // }
  // brain.load(modelDetails, function() {});

  // Save model
  //   saveBtn = select("#save");
  //   saveBtn.mousePressed(function () {
  //     brain.save();
  //   });

  //   // Load Data
  //   let loadBtn = select("#load");
  //   loadBtn.changed(function () {
  //     brain.load(loadBtn.elt.files, function () {
  //       console.log("Model Loaded!");
  //     });
  //   });
}


function drawGrid(grids = 10) {
  strokeWeight(1);
  for (let t = 0; t <= width; t += grids) {
    if (t % 100 == 0) stroke(255);
    else stroke(255, 100);
    line(t, 0, t, height);
  }
  for (let o = 0; o <= height; o += grids) {
    if (o % 100 == 0) stroke(255);
    else stroke(255, 100);
    line(0, o, width, o);
  }
}

function 시작() {
  // 사람이 나갔다가 들어오는 경우 체크
  if (trained) {
    if (poses.length > 0) {
      body_in = true;
    } else body_in = false;

    if (body_in != body_in_last) {
      classify();
    }
    body_in_last = body_in;
  }

  기본설정.배경색[3] = 기본설정.배경색_투명도;
  tint(기본설정.배경색);
  if (기본설정.좌우반전) {
    translate(width, 0);
    scale(-1, 1);
  }

  imageMode(CORNER);
  image(video, 0, 0, width, height);
  imageMode(CENTER);
  noTint();

  getBodyPoints(true);

  if (기본설정.격자) drawGrid();

  // if (buttonAIsPressed) {
  //   if (poses.length > 0) {
  //     if (frameCount % 6 == 0) {
  //       let inputs = getInputs();
  //       brain.addData(inputs, ["A"]);
  //       select("#amountOfAImages").html((AImages += 1));
  //     }
  //   }
  // }
}

function 끝() {
  if (기본설정.궤적활성화) {
    for (let i = 0; i < trails.length; i++) {
      trails[i].draw();
    }
  }

  if (poses.length == 0 || !기본설정.궤적활성화) {
    for (let i = 0; i < trails.length; i++) {
      trails[i].reset();
    }
  }

  if (파티클설정.활성화) {
    for (let i = 0; i < particles.length; i++) {
      particles[i].move();
      particles[i].draw();
    }

    for (let i = 0; i < particles.length; i++) {
      if (particles[i].life < 0) {
        particles.splice(i, 1);
      }
    }
  }
}

function 그리기(func) {
  func();
}

function 궤적생성(d, index) {
  trails[index].add(관절[index]);
  trails[index].smooth();
  trails[index].shape = d;
}

function 파티클생성(design, index) {
  if (frameCount % 파티클설정.생성빈도 == 0) {
    let b = new Particle(관절[index].x, 관절[index].y, design);
    particles.push(b);
  }
}

function 파티클추가생성(design, x, y) {
  if (frameCount % 파티클설정.생성빈도 == 0) {
    let b = new Particle(x, y, design);
    particles.push(b);
  }
}

function getBodyPoints(debug = true) {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < 33; j++) {
      const keypoint = pose[j];
      let x = pose[j].x * width;
      let y = pose[j].y * height;
      관절[j] = { x: x, y: y };
      if (기본설정.관절표시) {
        let index = poseDetection.POSE_CONNECTIONS[j];
        const partA = pose[index.start];
        const partB = pose[index.end];
        stroke(255);
        strokeWeight(1);
        line(
          partA.x * width,
          partA.y * height,
          partB.x * width,
          partB.y * height
        );
        fill(255);
        noStroke();
        x = keypoint.x * width;
        y = keypoint.y * height;
        ellipse(x, y, 6, 6);
      }
    }
  }
}



// 자세 학습 부분

function setupAI() {
  classificationP = createP(
    "이미지를 저장하여 자세를 학습학거나 학습된 모델파일을 불러오세요"
  );
  classificationP.position(20, 0);
  classificationP.style("color", "#fff");
  classificationP.style("font-size", "20px");
  classificationP.style("text-shadow", "0px 0px 2px #000");

  // Create the model
  let options = {
    task: "classification",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);

  buttonA = select("#AButton");
  buttonA.mousePressed(function () {
    buttonAIsPressed = true;
    if (poses.length > 0) {
      let inputs = getInputs();
      samplesA.push(inputs);
      // brain.addData(inputs, ["A"]);
      select("#amountOfAImages").html((AImages += 1));
    }
  });

  clearAButton = select("#clearAButton");
  clearAButton.mousePressed(function () {
    buttonAIsPressed = true;
    AImages = 0;
    select("#amountOfAImages").html(AImages);
  });

  buttonB = select("#BButton");
  buttonB.mousePressed(function () {
    if (poses.length > 0) {
      let inputs = getInputs();
      samplesB.push(inputs);
      // brain.addData(inputs, ["B"]);
      select("#amountOfBImages").html((BImages += 1));
    }
  });

  clearBButton = select("#clearBButton");
  clearBButton.mousePressed(function () {
    buttonBIsPressed = true;
    BImages = 0;
    select("#amountOfBImages").html(BImages);
  });

  buttonC = select("#CButton");
  buttonC.mousePressed(function () {
    if (poses.length > 0) {
      let inputs = getInputs();
      samplesC.push(inputs);
      // brain.addData(inputs, ["C"]);
      select("#amountOfCImages").html((CImages += 1));
    }
  });

  clearCButton = select("#clearCButton");
  clearCButton.mousePressed(function () {
    buttonCIsPressed = true;
    CImages = 0;
    select("#amountOfCImages").html(CImages);
  });

  // Train Button
  train = select("#train");
  train.mousePressed(trainModel);

  // Clear Button
  buttonPredict = select("#clear");
  buttonPredict.mousePressed(function () {
    let options = {
      task: "classification",
      debug: true,
    };
    brain = ml5.neuralNetwork(options);
    AImages = 0;
    BImages = 0;
    CImages = 0;
    select("#amountOfAImages").html(AImages);
    select("#amountOfBImages").html(BImages);
    select("#amountOfCImages").html(CImages);
  });

  // Save model
  saveBtn = select("#save");
  saveBtn.mousePressed(function () {
    brain.save();
  });

  // Load model
  loadBtn = select("#load");
  loadBtn.changed(function () {
    brain.load(loadBtn.elt.files, function () {
      select("#modelStatus").html("학습된 모델을 불러왔습니다.");
      trained = true;
      classify();
    });
    // const modelDetails = {
    //   model: "model/model.json",
    //   metadata: "model/model_meta.json",
    //   weights: "model/model.weights.bin",
    // };
    // brain.load(modelDetails, loaded);
  });

  select("#info").position(20, 490);
}

function loaded() {
  print("load");
  classify();
}

// Train the model
function trainModel() {
  if (samplesA.length > 0 && samplesB.length > 0 && samplesC.length) {
    for (let i = 0; i < samplesA.length; i++) {
      brain.addData(samplesA[i], ["A"]);
    }
    for (let i = 0; i < samplesB.length; i++) {
      brain.addData(samplesB[i], ["B"]);
    }
    for (let i = 0; i < samplesC.length; i++) {
      brain.addData(samplesC[i], ["C"]);
    }

    brain.normalizeData();
    let options = {
      epochs: 50,
    };
    brain.train(options, finishedTraining);
  }
}

// Begin prediction
function finishedTraining() {
  trained = true;
  classify();
}

// Classify
function classify() {
  if (poses.length > 0) {
    let inputs = getInputs();
    brain.classify(inputs, gotResults);
  }
}

function gotResults(results, error) {
  classificationP.html(
    `분류결과: ${results[0].label}, 확률: ${floor(
      results[0].confidence * 100
    )}%`
  );
  분류결과 = results[0].label;
  확률 = results[0].confidence;
  // Classify again
  classify();
}

function getInputs() {
  if (poses.length > 0) {
    let keypoints = poses[0];
    let inputs = [];
    for (let i = 0; i < keypoints.length; i++) {
      inputs.push(keypoints[i].x);
      inputs.push(keypoints[i].y);
    }
    return inputs;
  }
}

//  Add a training example
// function addExample() {
//   if (poses.length > 0) {
//     let inputs = getInputs();
//     let target = dataLabel.value();
//     if (target == "A") select("#amountOfAImages").html((numOfClassA += 1));
//     if (target == "B") select("#amountOfBImages").html((numOfClassB += 1));
//     // select("#"+target).html();
//     brain.addData(inputs, [target]);
//   }
// }
