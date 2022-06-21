const multer = require("multer");
const multerS3 = require("multer-s3");
var AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
});

const s3 = new AWS.S3();

const profileUploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.BUCKET,
    // acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      req.body = JSON.parse(JSON.stringify(req.body));

      console.log("file-------", file, req.body);
      cb(
        null,
        "profile/" +
          "userimg" +
          "-" +
          Date.now().toString() +
          Date.now().toString() +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1]
      );
    },
    // shouldTransform: function(req, file, cb) {
    //   cb(null, /^image/i.test(file.mimetype));
    // },
    // transforms: [
    //   {
    //     id: 'original',
    //     transform: function(req, file, cb) {
    //       //Perform desired transformations
    //       cb(
    //         null,
    //         sharp()
    //           .resize(600, 600)
    //           .max()
    //       );
    //     }
    //   }
    // ],
  }),
});

const mediaDeleteS3 = function (filename, callback) {
  console.log(filename);
  var s3 = new AWS.S3();
  var params = {
    Bucket: process.env.BUCKET,
    Key: filename,
  };
  s3.deleteObject(params, function (err, data) {
    if (data) {
      console.log("file deleted", data);
    } else {
      console.log("err in delete object", err);
      // callback(null);
    }
  });
};

module.exports = {
  profileUploadS3,
  mediaDeleteS3,
};
