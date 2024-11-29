import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    const DB_OPTIONS = {
      dbName: "BookLx",
    };
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);
    console.log("Successfully Connected");
  } catch (error) {
    console.log("Database not connected", error);
  }
};
export default connectDB;
