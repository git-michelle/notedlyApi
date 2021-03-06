const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  AuthenticationError,
  ForbiddenError,
} = require("apollo-server-express");
require("dotenv").config();
const mongoose = require("mongoose");

const gravatar = require("../util/gravatar");

module.exports = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to create a note.");
    }
    return await models.Note.create({
      content: args.content,
      //reference the author's mongo id
      author: mongoose.Types.ObjectId(user.id),
      favoriteCount: 0,
    });
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to delete a note!");
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError(
        "You don't have permission to delete that note."
      );
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError("You must be signed in to update a note.");
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permission to update the note");
    }

    return await models.Note.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          content,
        },
      },
      {
        new: true,
      }
    );
  },
  signUp: async (parent, { username, email, password }, { models }) => {
    //normalize email
    email = email.trim().toLowerCase();
    // hash the pw
    const hashed = await bcrypt.hash(password, 10);
    // create the gravatar url
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed,
      });

      // create and return jwt
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (err) {
      console.log(err);
      throw new Error("Error creating account");
    }
  },
  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      throw new AuthenticationError("Error signing in");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError("Error signing in");
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    // check if user has already favorited a note
    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    // if user has liked, pull them from list and reduce favorited count by 1
    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        // set new to true to return the updated doc
        { new: true }
      );
    } else {
      // if user not in already liked list, add them and increment the favoriteCount
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        { new: true }
      );
    }
  },
};
