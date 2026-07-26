import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    profileImage: {
      type: String,
      default: "",
    },

    savedPlaces: [
    {
        placeId: {
            type: String,
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            default: "place",
        },

        lat: {
            type: Number,
            required: true,
        },

        lon: {
            type: Number,
            required: true,
        },
    },
],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;