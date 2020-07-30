const express = require("express");
const router = express.Router();
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

const { Video } = require("../models/Video");
const { Subscriber } = require("../models/Subscriber");
const { auth } = require("../middleware/auth");

var storage = multer.diskStorage({
  //업로드 경로
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  //업로드시 파일 이름 정하기
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },

  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    //업로드 받을 파일의 형식 정하기
    if (ext !== ".mp4") {
      return cb(res.status(400).end("only mp4 is allowed"), false);
    }
    cb(null, true);
  },
});

var upload = multer({ storage: storage }).single("file");

//=================================
//             Video
//=================================

router.post("/uploadfiles", (req, res) => {
  //서버에 저장한다.
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

//썸네일 생성하고 비디오 러닝타임도 가져오기
router.post("/thumbnail", (req, res) => {
  let thumbsFilePath = "";
  let fileDuration = "";

  //비디오 정보 가져오기
  ffmpeg.ffprobe(req.body.filePath, function (err, metadata) {
    console.dir(metadata);
    console.log(metadata.format.duration);

    fileDuration = metadata.format.duration;
  });

  //썸네일 생성
  ffmpeg(req.body.filePath)
    .on("filenames", function (filenames) {
      console.log("Will generate " + filenames.join(", "));
      thumbsFilePath = "uploads/thumbnails/" + filenames[0];
    })
    .on("end", function () {
      console.log("Screenshots taken");
      return res.json({
        success: true,
        thumbsFilePath: thumbsFilePath,
        fileDuration: fileDuration,
      });
    })
    .on("error", function (err) {
      console.error(err);
      return res.json({ success: false, err });
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 3,
      folder: "uploads/thumbnails",
      size: "320x240",
      // %b input basename ( filename w/o extension )
      filename: "thumbnail-%b.png",
    });
});

//Video를 DB에서 가져와서 클라이언트에게 내보낸다.
router.get("/getVideos", (req, res) => {
  Video.find()
    //비디오객체를 조회하지만, User의 정보를 populate로 가져올 수 있다.
    .populate("writer")
    .exec((err, videos) => {
      if (err) return res.status(400).send(err);
      res.status(200).json({ success: true, videos });
    });
});

//비디오 정보를 저장한다.
router.post("/uploadVideo", (req, res) => {
  const video = new Video(req.body);

  //MongoDB 메소드
  video.save((err, video) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

//DetailVideoPage에 객체들을 DB에서 가져와서 뿌려준다.
router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId })
    .populate("writer")
    .exec((err, video) => {
      if (err) return res.status(400).send(err);
      res.status(200).json({ success: true, video });
    });
});

router.post("/getSubscriptionVideos", (req, res) => {
  //Need to find all of the Users that I am subscribing to From Subscriber Collection

  Subscriber.find({ userFrom: req.body.userFrom }).exec((err, subscribers) => {
    if (err) return res.status(400).send(err);

    let subscribedUser = [];

    //map을 사용한다.
    subscribers.map((subscriber, i) => {
      subscribedUser.push(subscriber.userTo);
    });

    //Need to Fetch all of the Videos that belong to the Users that I found in previous step.
    //여러 개를 찾을 때 MongoDB기능인 $in을 사용한다.
    Video.find({ writer: { $in: subscribedUser } })
      .populate("writer")
      .exec((err, videos) => {
        if (err) return res.status(400).send(err);
        res.status(200).json({ success: true, videos });
      });
  });
});

module.exports = router;
