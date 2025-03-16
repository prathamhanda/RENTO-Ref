const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI ||
        "mongodb+srv://prathamhanda10:hostelnet@roomsonrent.ic0mj.mongodb.net/roomsonrent?retryWrites=true&w=majority"
    );
    console.log(
      `MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold
    );
    console.log("Database connection successful!".green.bold);
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold);
    console.error("Full error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
