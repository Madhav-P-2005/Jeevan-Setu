// jeevansetu-backend/src/models/Request.js


const mongoose = require("mongoose");


// Define the Schema
const RequestSchema = new mongoose.Schema({

    requestedBy : {
        type : mongoose.Schema.Types.ObjectId,

        ref : "User",

        required : true,

        trim : true,
    },


    bloodGroup : {
        type : String,
        enum : ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
        required : true
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

    }, 


    urgencyLevel : {
        type : String,

        enum : ["low" , "medium" , "high"],

        default : "medium",
    },


    status : {

        type : String,

        enum : ["open" , "matched" , "fulfilled" , "cancelled"],

        default : "open",
    }, 

    matchedDonor : {
        type  : mongoose.Schema.Types.ObjectId,

        ref : "User",

        default : null,
    }
}, {
    timestamps : true
});





// Create and Export Model


const Request = mongoose.model("Request", RequestSchema);


module.exports = Request;