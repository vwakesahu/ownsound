const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const app = express();

const axios = require("axios");
const FormData = require("form-data");
dotenv.config();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const allowedIps = ["http://localhost:3000", "https://ownsound.xyz/"]; // Add your allowed IPs here

app.use(
  cors({
    // origin: true,
    origin: function (origin, callback) {
      if (allowedIps.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "FETCH"],

    credentials: true,
  })
);

// Use cookie-parser middleware
app.use(cookieParser());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({storage: storage,});


app.post(
  "/endpoint",
  upload.fields([{ name: "musicFile" }, { name: "coverImage" }]),
  async (req, res) => {
    var JWT = process.env.JWT;
    const {
      songName,
      songDescription,
      basePrice,
      royaltyPrice,
      royaltyPercentage,
      isRentingAllowed,
    } = req.body;

    const musicFile = req.files["musicFile"] ? req.files["musicFile"][0] : null;
    const coverImage = req.files["coverImage"]
      ? req.files["coverImage"][0]
      : null;

    console.log("Text Data:", {
      songName,
      songDescription,
      basePrice,
      royaltyPrice,
      royaltyPercentage,
      isRentingAllowed,
    });

    if (musicFile) {
      const formData = new FormData();
      const fileStream = fs.createReadStream(musicFile.path);
      formData.append("file", fileStream);

      const pinataMetadata = JSON.stringify({
        name: musicFile.originalname,
      });
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", pinataOptions);

      try {
        const pinataResponse = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            headers: {
              Authorization: `Bearer ${JWT}`,
              ...formData.getHeaders(),
            },
          }
        );

        const ipfsHash = pinataResponse.data.IpfsHash;

        // Generate a random key and value
        const randomKey = crypto.randomBytes(8).toString("hex");
        const randomValue = crypto.randomBytes(16).toString("hex");

        // Store the IPFS hash and random key-value in cookies
        // res.cookie("ipfsHash", ipfsHash, { httpOnly: true });
        // res.cookie(randomKey, randomValue, { httpOnly: true });

        console.log("Pinata Response:", pinataResponse.data);
        res.status(200).send({
          message: "Data received and uploaded successfully",
          // pinataResponse: pinataResponse.data,
          Key: randomKey,
          value: randomValue,
        });
      } catch (error) {
        console.error("Error uploading to Pinata:", error);
        res.status(500).send({
          message: "Failed to upload to Pinata",
          error: error.message,
        });
      }
    } else {
      res.status(400).send("No music file provided");
    }
  }
);

// Endpoint to get cookies
app.get("/get-cookies", (req, res) => {
  // Access cookies from the request
  const ipfsHash = req.cookies.ipfsHash;
  const randomKey = req.cookies.randomKey;

  // Send back the cookie values
  res.send({
    ipfsHash: ipfsHash || "No IPFS hash cookie found",
    randomKey: randomKey || "No random key cookie found",
  });
});
// app.post("/endpoint",
//   upload.fields([{ name: "musicFile", },{  name: "coverImage", },]),
//   async (req, res) => {
//     // console.log("Req Body:", req.body);
//     var  JWT = process.env.JWT;
//     const {
//       songName,
//       songDescription,
//       basePrice,
//       royaltyPrice,
//       royaltyPercentage,
//       isRentingAllowed,
//     } = req.body;

//     const musicFile = req.files["musicFile"] ? req.files["musicFile"][0] : null;
//     const coverImage = req.files["coverImage"] ? req.files["coverImage"][0] : null;

//     console.log("Text Data:", {
//       songName,
//       songDescription,
//       basePrice,
//       royaltyPrice,
//       royaltyPercentage,
//       isRentingAllowed,
//     });
//     if (musicFile) {
//       const formData = new FormData();
//       const fileStream = fs.createReadStream(musicFile.path);
//       formData.append("file", fileStream);

//       const pinataMetadata = JSON.stringify({
//         name: musicFile.originalname,
//       });
//       formData.append("pinataMetadata", pinataMetadata);

//       const pinataOptions = JSON.stringify({
//         cidVersion: 1,
//       });
//       formData.append("pinataOptions", pinataOptions);

//       try {
//         const pinataResponse = await axios.post(
//           "https://api.pinata.cloud/pinning/pinFileToIPFS",
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${JWT}`,
//               ...formData.getHeaders(),
//             },
//           }
//         );
//         console.log("Pinata Response:", pinataResponse.data);
//         res.status(200).send({
//           message: "Data received and uploaded successfully",
//           pinataResponse: pinataResponse.data,
//         });
//       } catch (error) {
//         console.error("Error uploading to Pinata:", error);
//         res.status(500).send({
//           message: "Failed to upload to Pinata",
//           error: error.message,
//         });
//       }
//     } else {
//       res.status(400).send("No music file provided");
//     }
//   }
// );

async function getHash(ipfs_url) {
  try {
    const res = await fetch(
      "https://harlequin-secure-tortoise-165.mypinata.cloud/ipfs/${ipfs_url}"
    );
    const resData = await res.text();
    console.log(resData);
  } catch (error) {
    console.log(error);
  }
}
app.get("/", (req, res) => {
  res.send("Hello World!");
  getHash(ipfs_url);
});
 const port = process.env.PORT;
//  const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  }).on("error", (err) => {
    console.error("Error starting server:", err);
  });
