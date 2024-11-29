import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./db/connectDB.js";
import web from "./routes/web.js";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
const port = process.env.PORT || 4000;
const DATABASE_URL = process.env.DATABASE_URL;

//give json data in response
app.use(express.json());

//set ejs engine
// app.set("view engine", "ejs");

//making file static
app.use(express.static("frontend"));

//use cors to sen req in same network
app.use(cors());

//parse body
app.use(bodyParser.json());

//Load Routes
app.use("/", web);

//connect Database
connectDB(DATABASE_URL);

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
