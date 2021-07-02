const mongoose = require("mongoose");

module.exports = {
  connect: (DB_HOST) => {
    // use mongo driver's updated URL string parser
    mongoose.set("useNewUrlParser", true);
    // set findAndModify to false so findOneAndUpdate is used instead
    mongoose.set("useFindAndModify", false);
    // use createIndex in place of ensureIndex
    mongoose.set("useCreateIndex", true);
    // Use the new server discovery and monitoring engine
    mongoose.set("useUnifiedTopology", true);
    // connect to the db
    mongoose.connect(DB_HOST);
    // log error if connection failed
    mongoose.connection.on("error", (err) => {
      console.err(err);
      console.log("MongoDB connection error. Check if MongoDB is running");
      process.exit();
    });
  },
  close: () => {
    mongoose.connection.close();
  },
};
