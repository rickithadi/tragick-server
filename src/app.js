const express = require("express");
const morgan = require("morgan");
const crypto = require("crypto");
const helmet = require("helmet");
const cors = require("cors");
const { exec } = require("child_process");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();
// const upload = multer({ dest: "uploads/" }); // Files uploaded here
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// app.use(morgan("dev"));
// app.use(helmet());
// app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.post("/image-upload", upload.single("avatar"), (req, res) => {
  console.log("file is", req.file.path);
  try {
    // const __dirname = path.resolve();
    const filePath = path.join(__dirname, "../", req.file.path);
    console.log(filePath);
    const outputFilePath = path.join(
      __dirname,
      "../uploads",
      `output_${req.file.filename}`
    );
    // Vulnerable ImageMagick `convert` command
    const IMcommand = `magick ${filePath} ${outputFilePath}`;
    exec(IMcommand, (error, stdout, stderr) => {
      console.log("running", IMcommand);
      if (error) {
        console.error(
          `Ran "${IMcommand}" \n Error: ${error.message} - ${stderr}`
        );
        return res
          .status(500)
          .send(
            `Ran "${IMcommand}" \n Server error during image processing - ${stderr}`
          );
      }
      return res
        .status(200)
        .sendFile(outputFilePath)
        // .send(
        //   `Ran "${IMcommand}" \n ${stdout} - Image processed and saved as ${outputFilePath}`
        // );
    });
  } catch (e) {
    console.log(e);
    return res.status(500).send("Server error during image processing");
  }
});

module.exports = app;
