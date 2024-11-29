import {
  bookModel,
  wishModel,
  orderModel,
  userModel,
} from "../model/siteModel.js";
import multer from "multer";
import dotenv from "dotenv";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("upload-photo");

//generate random image name
const randomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const S3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

//for uploading user detail and user pic
const storage2 = multer.memoryStorage();
const upload2 = multer({ storage: storage2 });
upload2.single("userpic");

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

//class
class siteController {
  // -----------------------for frontend--------------------

  static uploadBooks = async (req, res) => {
    try {
      upload.single("upload-photo")(req, res, async (err) => {
        if (err) {
          console.log(err);
        }
        console.log(req.body);
        console.log(req.file);
        const {
          name,
          author,
          price,
          discount,
          pages,
          country,
          description,
          category,
        } = req.body;

        const imagename = randomImageName();

        const params = {
          Bucket: bucketName,
          Key: imagename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);

        S3.send(command);
        //saving data to database
        const result = await new bookModel({
          name,
          author,
          price,
          discount,
          pages,
          country,
          description,
          category,
          imagename: imagename,
        });
        await result.save();
        res.json({ success: true, result });
        console.log(result);
      });
    } catch (error) {
      console.log(error);
    }
  };

  static uploadUserDetail = async (req, res) => {
    console.log(req.body);
    try {
      const {
        id,
        name,
        surname,
        mobile,
        dob,
        email,
        room,
        apartment,
        area,
        city,
        state,
        pincode,
        country,
        bank,
        account,
        ifsc,
      } = req.body;

      // Updating data in the database
      const result = await userModel.updateOne(
        { _id: id },
        {
          name,
          surname,
          mobile,
          dob,
          email,
          roomno: room,
          building: apartment,
          area,
          city,
          state,
          pincode,
          country,
          bank,
          ac: account,
          ifsc,
        }
      );

      res.json({ success: true, result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  static uploadUserPic = async (req, res) => {
    upload2.single("userpic")(req, res, async (err) => {
      if (err) {
        console.log(err);
      }
      try {
        console.log(req.body);
        console.log(req.file);

        const imagename = randomImageName();

        const params = {
          Bucket: bucketName2,
          Key: imagename,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        const command = new PutObjectCommand(params);

        S32.send(command);
        //saving data to database

        const result = await userModel.updateOne(
          { _id: req.body.id },
          {
            imagename: imagename,
          }
        );

        res.json({ success: true, result });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ success: false, error: "Internal Server Error" });
      }
    });
  };

  static wishlist = async (req, res) => {
    const {
      title,
      author,
      price,
      discount,
      description,
      country,
      id,
      category,
      imagename,
    } = req.body.data;

    try {
      const check = await wishModel.findOne({ id });
      if (check == null) {
        try {
          const result = new wishModel({
            title,
            author,
            price,
            discount,
            description,
            country,
            id,
            category,
            imagename,
          });
          await result.save();
          res.json({ success: true, result });
        } catch (error) {
          res.json({ success: false });
        }
      } else {
        res.json({ success: false, messge: "exists" });
      }
    } catch (err) {
      console.log("Internal server error", err);
    }
  };

  // -------------------get logic---------------

  static getStoryBooks = async (req, res) => {
    try {
      const result = await bookModel.find({ category: "Story Books" });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  static getCollegeBooks = async (req, res) => {
    try {
      const result = await bookModel.find({ category: "College Books" });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  static getHistoryBooks = async (req, res) => {
    try {
      const result = await bookModel.find({ category: "History Books" });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  static getReligiousBooks = async (req, res) => {
    try {
      const result = await bookModel.find({ category: "Religious Books" });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
  //get all books
  static getAllBooks = async (req, res) => {
    try {
      const result = await bookModel.find();
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log(error);
    }
  };

  //get cart books logic
  static getCartBooks = async (req, res) => {
    const itemIds = req.body.cartItems;
    console.log(itemIds);
    try {
      // Fetch items from the database using the provided IDs
      const result = await bookModel.find({ _id: { $in: itemIds } });

      //generate image url for each image
      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  //Wishlist books get here

  static getWishBooks = async (req, res) => {
    try {
      const result = await wishModel.find();
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  //catalogue book get here

  static catalogue = async (req, res) => {
    const { value } = req.query;
    try {
      const result = await bookModel.find({ name: value });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log("Something went wrong", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };

  static newOrder = async (req, res) => {
    const { name, add, city, state, zip, product, userId } = req.body;
    //generate orderId mannualy
    function generateOrderId() {
      const uuid = uuidv4();
      const uuidWithoutDashes = uuid.replace(/-/g, "");
      const uuidWithoutFirstDash = uuidWithoutDashes.slice(0, 10);

      return uuidWithoutFirstDash;
    }
    try {
      const result = new orderModel({
        name: name,
        address: add,
        city: city,
        state: state,
        zip: zip,
        product: product,
        ref: userId,
        orderId: generateOrderId(),
        date: new Date(),
      });
      await result.save();
      res.json({ success: true });
    } catch (error) {
      console.log("Something went wrong", error);
    }
  };

  static getOrders = async (req, res) => {
    const { id } = req.params;
    //check if the id did some order or not
    try {
      const result = await orderModel.find({ ref: id });
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };

  static getOrderProducts = async (req, res) => {
    // console.log(req.query);
    const ids = req.query.product;
    try {
      const result = await bookModel.find({ _id: { $in: ids } });
      //generate image url for each image

      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  };

  // ----------------- logic for admin panel----------------
  static deleteBook = async (req, res) => {
    const { id } = req.query;
    try {
      await bookModel.findByIdAndDelete({ _id: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  };

  static getSearchedBooks = async (req, res) => {
    const { value } = req.query;
    console.log(value);
    try {
      const regexPattern = new RegExp(
        value.trim().replace(/\s+/g, "\\s*"),
        "i"
      );
      console.log("Regex Pattern:", regexPattern);

      const result = await bookModel.find({ name: regexPattern });

      // Generate image URL for each image
      for (const book of result) {
        const getObjectParams = {
          Bucket: bucketName,
          Key: book.imagename,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3, command, { expiresIn: 3600 });
        book.imageURL = url;
      }
      res.json({ success: true, result });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false });
    }
  };

  //get all books
  static getAllUsers = async (req, res) => {
    try {
      const result = await userModel.find();
      console.log(result);

      console.log(result);
      res.json({ success: true, result });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  static deleteUser = async (req, res) => {
    const { id } = req.query;
    try {
      await userModel.findByIdAndDelete({ _id: id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  };

  static changeRole = async (req, res) => {
    const { id } = req.query;
    try {
      const result = await userModel.findById({ _id: id });
      if (result != null) {
        if (result.role == "user") {
          result.role = "admin";
        } else {
          result.role = "user";
        }
      }
      await result.save();
      res.json({ success: true, result });
    } catch (error) {
      res.json({ success: false });
    }
  };

  static addUser = async (req, res) => {
    const {
      name,
      surname,
      email,
      password,
      roles,
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
    } = req.body;
    console.log(req.body);
    try {
      const newUser = new userModel({
        name: name,
        surname: surname,
        email: email,
        password: password,
        role: roles,
        mobile: mobile,
        dob: dob,
        roomno: room,
        building: apartment,
        area: area,
        city: city,
        state: state,
        pincode: pincode,
        country: country,
        ifsc: ifsc,
        ac: account,
        bank: bank,
      });
      await newUser.save();
      console.log("Hii");

      res.json({ success: true });

      console.log("Done");
    } catch (error) {
      res.json({ success: false });
    }
  };

  static getSearchedUser = async (req, res) => {
    const { value } = req.query;
    console.log(value);
    try {
      const regexPattern = new RegExp(
        value.trim().replace(/\s+/g, "\\s*"),
        "i"
      );
      console.log("Regex Pattern:", regexPattern);

      const result = await userModel.find({ name: regexPattern });
      res.json({ success: true, result });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ success: false });
    }
  };
}

export default siteController;
