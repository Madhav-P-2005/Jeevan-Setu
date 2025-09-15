// jeevansetu-backend/src/models/User.js


import mongoose  from "mongoose";

import bcrypt  from "bcryptjs";


// Define the Schema
const UserSchema = new mongoose.Schema(
  {
    // name field text
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // email field text
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    // password field text
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // security: do not return password by default
    },

    // bloodGroup field select
    bloodGroup: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    // country field text
    country: {
      type: String,
      default: "",
      trim: true,
    },

    // state field text
    state: {
      type: String,
      default: "",
      trim: true,
    },

    // city field text
    city: {
      type: String,
      default: "",
      trim: true,
    },

    // address field object (optional)
    address: {
      line1: { type: String, trim: true, default: "" },
      line2: { type: String, trim: true, default: "" },
      postalCode: {
        type: String,
        trim: true,
        default: "",
        validate: {
          validator: (v) => v === "" || /^[A-Za-z0-9\-\s]{4,10}$/.test(v),
          message: "Postal code should be 4-10 characters",
        },
      },
    },

    // role field select
    role: {
      type: String,
      enum: ["donor", "recipient"],
      default: "donor",
    },

    // phone field text
    phone: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v) => v === "" || /^\d{10}$/.test(v),
        message: "Phone number must be 10 digits long",
      },
    },

    // message field textarea
    message: {
      type: String,
      default: "",
      trim: true,
    },


    // Social Links (optional)
    social :{
      instagram : {
        type : String,
        trim: true,
        default : "",
        validate:{
          validator : (v) => v === "" || /^https?:\/\/([\w-]+\.)*instagram\.com\/.+/i.test(v),
          message: "Instagram URL must be a valid instagram.com link",
        },
      },
      x : {
        type : String,
        trim : true,
        default : "",
        validate:{
            validator: (v) => v === "" || /^https?:\/\/([\w-]+\.)*x\.com\/.+/i.test(v),
            message: "X URL must be a valid x.com link",
        },
      },
      facebook : {
        type : String,
        trim : true,
        default : "",
        validate:{
          validator : (v) => v === "" || /^https?:\/\/([\w-]+\.)*facebook\.com\/.+/i.test(v),
          message: "Facebook URL must be a valid facebook.com link",
        },
      },
    },


    // available field checkbox
    available: {
      type: Boolean,
      default: true,
    },

    // lastDonationAt field date
    lastDonationAt: {
      type: Date,
      default: null,
    },

    // donationHistory field array
    donationHistory: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donation" }],
      ref: "Donation",
      default: [],
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
      next(error); // propagate hashing errors
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
    transform: (_doc, ret) => {
      // Remove sensitive/internal fields
      delete ret.password;
      delete ret.__v;
      return ret;
    }
});

UserSchema.set("toObject" , {
    virtuals : true,
});

// Helpful indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ bloodGroup: 1, city: 1, state: 1, country: 1, available: 1 });


// Create and export the model
const User = mongoose.model("User", UserSchema);

export default User;