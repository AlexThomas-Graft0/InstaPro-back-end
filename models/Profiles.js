const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const profileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  gender: {
    type: String
  },
  phone: {
    type: Number
  },
  bio: {
    type: String
  },
  website: {
    type: String
  },
  following: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      name: {
        type: String,
        required: true
      },
      avatar: {
        type: String,
        default: "https://static.thenounproject.com/png/8752-200.png"
      },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ],
  followers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ],
  likes: [
    {
      post: { type: Schema.Types.ObjectId, ref: "posts" },
      date: { type: Date, default: Date.now() }
    }
  ],
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports = Profile = mongoose.model("profile", profileSchema);
