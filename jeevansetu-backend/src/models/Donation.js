// jeevansetu-backend/src/models/Donation.js

import mongoose from "mongoose";
import {
    BLOOD_GROUPS,
    DONATION_STATUS_VALUES,
} from "../constants/domain.js";


// Define the Schema
const DonationSchema = new mongoose.Schema({

    donor : {
        ref : "User",
        type : mongoose.Schema.Types.ObjectId,
        required  : true,
    }, 

    request : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Request",
        default : null,
    },

    recipient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },

    bloodGroup : {
        type : String,
        enum : BLOOD_GROUPS,
        required : true,
    }, 

    quantityDonated : {
        type : Number,
        min : 100,
        default : null,
    },

    dateOfDonation : {
        type : Date,
        default : Date.now,
    },

    location : {
        type : String,
        required : true,
        trim : true,
        maxlength : 200,
    }, 

    handledBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null,
    },

    status : {
        type : String,
        enum : DONATION_STATUS_VALUES,
        default : "pending",
    },

    notes : {
        type : String,
        default : "",
        trim : true,
        maxlength : 1000,
    },

    followUpNotes : {
        type : String,
        default : "",
        trim : true,
        maxlength : 1000,
    }
}, {
    timestamps : true
});


DonationSchema.index({ donor : 1, status : 1, dateOfDonation : -1 });
DonationSchema.index({ bloodGroup : 1, location : 1, status : 1 });
DonationSchema.index({ recipient : 1, dateOfDonation : -1 });


// Create and Export the Model 
const Donation = mongoose.model("Donation", DonationSchema);

export default Donation;