// jeevansetu-backend/src/models/Donation.js


const mongoose = require("mongoose");


// Define the Schema
const DonationSchema = new mongoose.Schema({

    donor : {
        ref : "User",
        type : mongoose.Schema.Types.ObjectId,
        required  : true,
    }, 


    bloodGroup : {
        type : String,
        enum : ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required : true,
    }, 

    dateOfDonation : {

        type : Date,
        default : Date.now,
    },

    location : {
        type : String,
        required : true,
        trim : true,
    }, 


    recipient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },

    status : {
        type : String,
        enum : ["completed" , "pending", "cancelled"],
        default : "pending",
    },


    notes : {
        type : String,
        default : "",
        trim : true,
        maxlength : 1000,
    }
}, {
    timestamps : true
});


// Create and Export the Model 
const Donation = mongoose.model("Donation" , DonationSchema);

module.exports = Donation;