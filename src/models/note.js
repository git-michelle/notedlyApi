const mongoose = require("mongoose");

// define the note's db schema
const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  {
    // assign createdAt and updatedAt fields with a Date type
    timestamps: true,
  }
);

// define the Note model's schema
const Note = mongoose.model("Note", noteSchema);

module.exports = Note;
