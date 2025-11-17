// jeevansetu-backend/src/models/Request.js

import mongoose from "mongoose";
import {
    BLOOD_GROUPS,
    REQUEST_STATUS_VALUES,
    REQUEST_URGENCY_LEVELS,
} from "../constants/domain.js";


// Define the Schema
const RequestSchema = new mongoose.Schema({

    requestedBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },

    patientName : {
        type : String,
        required : true,
        trim : true,
        maxlength : 120,
    },

    hospitalName : {
        type : String,
        trim : true,
        default : "",
        maxlength : 160,
    },

    contactPhone : {
        type : String,
        trim : true,
        default : "",
        maxlength : 20,
        validate : {
            validator : (v) => !v || /^\+?[0-9\-()\s]{7,20}$/.test(v),
            message : "Please provide a valid contact number",
        }
    },

    neededBy : {
        type : Date,
        required : true,
    },

    bloodGroup : {
        type : String,
        enum : BLOOD_GROUPS,
        required : true,
    },

    quantityRequired : {
        type : Number,
        required : true,    // stored in ml
        min : 100,
    },

    location : {
       type : String,
       required : true,
       trim : true,
       maxlength : 200,
    }, 

    geo : {
        lat : {
            type : Number,
            min : -90,
            max : 90,
        },
        lng : {
            type : Number,
            min : -180,
            max : 180,
        }
    },

    urgencyLevel : {
        type : String,
        enum : REQUEST_URGENCY_LEVELS,
        default : "medium",
    },

    status : {
        type : String,
        enum : REQUEST_STATUS_VALUES,
        default : "open",
    }, 

    matchedDonor : {
        type  : mongoose.Schema.Types.ObjectId,
        ref : "User",
        default : null,
    },

    matchedOn : {
        type : Date,
        default : null,
    },

    fulfilledOn : {
        type : Date,
        default : null,
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


RequestSchema.index({ bloodGroup : 1, location : 1, status : 1 });
RequestSchema.index({ neededBy : 1 });
RequestSchema.index({ urgencyLevel : 1, status : 1 });





// Create and Export Model


const Request = mongoose.model("Request", RequestSchema);

export default Request;