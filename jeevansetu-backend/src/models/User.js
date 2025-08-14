// jeevansetu-backend/src/models/User.js


const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");


// Define the Schema
const UserSchema = new mongoose.Schema(
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
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    location: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["donor", "recipient"],
      default: "donor",
    },

    donationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
    ],
  },

  {
    timestamps: true, // Auto create createdAt and updatedAt
  }
);



// Pre-save middleware to hash password 
UserSchema.pre('save', async function(next){
  // pre :-  It lets you hook into lifecycle events of a document, such as 'save', 'validate', 'remove', etc.


  try{

  // If password is not modified, skip the middleware
  if (!this.isModified("password")) return next();
  // this →   Refers to the current document being saved (given by Mongoose).
  // .isModified() → Predefined method from Mongoose that checks if a particular field (here, "password") has been changed.


  // Hash the password with salt rounds = 10
  this.password = await bcrypt.hash(this.password, 10);

  next();   // Continue saving
  }catch(error){
      next(); // next →  Predefined callback provided by Mongoose middleware to signal
  }

});



// Method to check password validity 
UserSchema.methods.comparePassword = async function
(candidatePassword){
    return await bcrypt.compare(candidatePassword , this.password);
}

// UserSchema.methods  :- Predefined by Mongoose . Lets you define custom instance methods for documents.


// Create and export the model
const User = mongoose.model("User", UserSchema);

module.exports = User;