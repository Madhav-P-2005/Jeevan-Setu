// jeevansetu-backend/src/models/User.js


import mongoose  from "mongoose";

import bcrypt  from "bcryptjs";

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

    country :{
      type : String,
      default : "",
      trim : true,
    },

    state : {
      type : String,
      default : "",
      trim : true,
    },

    city : {
      type : String,
      default : "",
      trim : true,
    },

    role: {
      type: String,
      enum: ["donor", "recipient"],
      default: "donor",
    },

    phone:{
      type : String,
      default: "",
      validate :{
         validator : (v) => v === "" || /^\d{10}$/.test(v),
          message : "Phone number must be 10 digits long",
      },
    },

    message :{
      type : String,
      default : "",
      trim : true,
    },


    available : {
      type : Boolean,
      default : true,
    },

    lastDonationAt : {
      type : Date,
      default : null,
    },

    donationHistory: 
      {
        type: [{ type :mongoose.Schema.Types.ObjectId , ref:"Donation"}],
        ref: "Donation",
        default : [],
      },
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


// Virtual To expose Formatted parts for date , time , month , year and day
UserSchema.virtual('createdAtParts').get(function () {
  if(!this.createdAt) return null;

  const d = this.createdAt;

  return {
    year  : d.getFullYear(),
    month : d.toLocaleString('en-Us' , {month : 'long'}),   // eg :- "August"
    day : d.toLocaleString('en-US', {weekday : 'long'}),   // e.g :- "Thursday"
    date : d.getDate(), 
    time : d.toLocaleTimeString('en-US' , {hour : '2-digit', minute : '2-digit'}),
  };
});


// Note :-  Virtuals are not included by default in JSON. If you want them in API responses:

UserSchema.set("toJSON" , {
    virtuals : true,
});

UserSchema.set("toObject" , {
    virtuals : true,
});


// Create and export the model
const User = mongoose.model("User", UserSchema);

export default User;