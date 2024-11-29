import { userModel, tokenModel } from "../model/siteModel.js";
import dotenv from "dotenv";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
dotenv.config();

const bucketName2 = process.env.BUCKET_NAME2;
const bucketRegion2 = process.env.BUCKET_REGION2;
const accessKey2 = process.env.ACCESS_KEY2;
const secretAccessKey2 = process.env.SECRET_ACCESS_KEY2;

const S32 = new S3Client({
  credentials: {
    accessKeyId: accessKey2,
    secretAccessKey: secretAccessKey2,
  },
  region: bucketRegion2,
});

class userController {
  static signup = async (req, res) => {
    const {
      name,
      surname,
      email,
      role,
      password,
      mobile,
      dob,
      room,
      apartment,
      area,
      city,
      state,
      pincode,
      country,
      ifsc,
      account,
      bank,
      imagename,
      imageurl,
    } = req.body;
    try {
      const check = await userModel.findOne({ email });

      if (check !== null) {
        res.send({ success: false });
      } else {
        const result = new userModel({
          name,
          surname,
          email,
          role,
          password,
          mobile,
          dob,
          roomno: room,
          building: apartment,
          area,
          city,
          state,
          pincode,
          country,
          ifsc,
          ac: account,
          bank,
          imagename,
          imageurl,
        });
        await result.save();
        res.json({ success: true, token: await result.generateToken() });
      }
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  static signin = async (req, res) => {
    const { signinEmail, signinPassword, token } = req.body;

    try {
      const check = await userModel.find({ email: signinEmail });

      if (check.length > 0) {
        if (
          check[0].email === signinEmail &&
          check[0].password === signinPassword
        ) {
          if (check[0].role === "admin") {
            const saveToken = new tokenModel({
              userId: check[0]._id,
              token: token,
            });
            saveToken.save();
            res.json({ success: true, check });
          }
          res.json({ success: true, check });
        } else {
          res.json({ success: "wrong" });
        }
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log("Spmething went wrong", error);
    }
  };

  static checkForAuth = async (req, res) => {
    const { id, token } = req.query;
    try {
      const result = await tokenModel.findOne({ userId: id, token: token });
      if (result !== null) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static checkAndResetAuth = async (req, res) => {
    try {
      const { id, token } = req.query;

      const existingToken = await tokenModel.findOne({
        userId: id,
        token: token,
      });

      if (existingToken) {
        existingToken.createdAt = new Date();
        await existingToken.save();
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static getUserData = async (req, res) => {
    const { id } = req.params;
    try {
      if (id !== "undefined") {
        const result = await userModel.findById(id);

        if (result.imagename !== "") {
          //logic of adding userpic to the database
          const getObjectParams = {
            Bucket: bucketName2,
            Key: result.imagename,
          };
          const command = new GetObjectCommand(getObjectParams);
          const url = await getSignedUrl(S32, command);
          result.imageURL = url;
        } else {
          result.imageURL = "";
          result.imagename = "";
          await result.save();
          res.json({ success: true, result });
          return;
        }

        if (result !== null) {
          res.json({ success: true, result });
        } else {
          res.json({ success: false });
        }
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      console.log("Something Went Wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
}

export default userController;
