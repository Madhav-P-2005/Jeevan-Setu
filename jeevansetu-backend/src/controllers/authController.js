// jeevansetu-backend/src/controllers/authController.js

import User from "../models/User.js";

import generateTokens from "../utils/generateTokens.js";


export const registerUser = async (req , res) => {

    try { 
 
        const {name , email , password , role , bloodGroup, location } = req.body;


        // 1) Basic Validation
        if(!name || !email || !password){
            return res.status(400).json({
                success : false,
                message : "Name , email , and password are required"
            });
        }
        if(password.length < 6){
            return res.status(400).json({
                success : false,
                message : "Password must be at least 6 characters long",
            })
        }

        // 1b) bloodGroup validation (enum)
        const allowedGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
        if(!bloodGroup || !allowedGroups.includes(bloodGroup)){
            return res.status(400).json({
                success: false,
                message: "Valid bloodGroup is required (A+, A-, B+, B-, AB+, AB-, O+, O-)"
            });
        }



        // 2) Check duplicate 
        if(await User.exists({email})){
            return res.status(409).json({
                success : false,
                message : "User already exists",
            })
        }
       

        // 3) Create User (model pre-save will hash password)
        const user = await User.create({
            name,
            email,
            password,
            role,
            bloodGroup,
            location,
        })


        // 4) Generate tokens 
        const {accessToken , refreshToken} = generateTokens(user._id);


        // 5) Set httpOnly refresh token cookie
        const isProd = process.env.NODE_ENV === "production";
        res.cookie("refreshToken" , refreshToken, {
            httpOnly : true,
            secure : isProd,
            sameSite : isProd ? "none" : "lax",  // 'none' only if you serve over HTTPS cross-site
            maxAge : 7 * 24 * 60 * 60 * 1000,   // 7 days

            // path :- "/api/auth",  // Optional scoping 
        });


        // 6) Return safe  user + accessToken 
        return  res.status(201).json({
            success : true,
            data : {
                user : {
                    id  : user._id,
                    name : user.name,
                    email : user.email,
                    role : user.role,
                    createdAt : user.createdAt,
                    updatedAt : user.updatedAt,
                },
                accessToken,
            },
        });
    }
    catch (error){
         
        // Central error shape 
        return res.status(500).json({
            success : false,
            message : "Internal Server Error",
        });
    }
};



export const loginUser = async (req, res) =>{

    try {

        const {email , password} = req.body;


        // 1) Basic Validation
        if(!email || !password){
            return res.status(400).json({
                success : false,
                message : "Please provide email and password"
            })
        }

        
        // 2) Find user by email

        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success : false ,
                message : "Invalid credentials"
            })
        }


        // 3) Generate tokens 
        const {accessToken , refreshToken} = generateTokens(user._id);

        




    }
    catch(error){

    }
}


// module.exports = registerUser; // You’re using ESM export already so need of this.