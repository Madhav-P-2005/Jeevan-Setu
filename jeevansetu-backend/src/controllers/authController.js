// jeevansetu-backend/src/controllers/authController.js

import User from "../models/User.js";

import generateTokens from "../utils/generateTokens.js";

import jwt from "jsonwebtoken";


// Register New User Controller 
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


// Login User Controller 
export const loginUser = async (req, res) =>{

    try {
      const { email, password } = req.body;

      // 1) Basic Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // 2) Find user by email

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // 3) Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // 4) Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);


      // 5) Set httpOnly refresh token cookie
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("refreshToken" ,refreshToken,{
        httpOnly : true,
        secure : isProd,
        sameSite : isProd ? "none" : "lax",
        maxAge : 7 * 24 * 60 * 60 * 1000,
        // path: "/api/auth",
      });


      // 6) Return safe user + accessToken 
      return res.status(200).json({
        success : true,
        data : {
            user:{
                id: user._id,
                name : user.name,
                email : user.email,
                role : user.role,
                createdAt : user.createdAt,
                updatedAt : user.updatedAt,
            },
            accessToken,
        }
      });
    }
    catch(error){
          
        return res.status(500).json({
            success : false,
            message : "Internal Server Error",
            error : error.message
        })
    }
}


// module.exports = registerUser; // You’re using ESM export already so need of this.



// Refresh Token Controller 
export const refreshAccessTokenController = async (req , res) =>{

    try{

        const token = req.cookies?.refreshToken;

        if(!token){
            return res.status(401).json({
                success : false,
                message : "Token is missing"
            })

        }


        const payload = jwt.verify(token , process.env.JWT_REFRESH_SECRET)
        
        const {accessToken , refreshToken} = generateTokens(payload.id);

        // Set rotated Refresh cookie (same options you used in register/login)

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("refreshToken" , refreshToken , {

            httpOnly : true,
            secure : isProd,
            sameSite : isProd ? "none" : "lax",
            maxAge : 7 * 24 * 60 * 60 * 1000,

            // path : "/api/auth",
        })



        

        // Return new access token only 
        return res.status(200).json({
            success : true,
            data : {
                accessToken
            }
        })
    

    }catch(error){

        return res.status(401).json({
            success : false,
            message : "Invalid or expired refresh token",
        })
    }
}




// Logout Controller 
export const LogoutUserController = async (req , res) => {

    try {
    
        const isProd = process.env.NODE_ENV === "production";

        res.clearCookie('refreshToken' , {
            httpOnly : true,
            secure : isProd,
            sameSite : isProd ? "none" : "lax",
            maxAge : 7 * 24 * 60 * 60 * 1000,
        })


        return res.status(200).json({
            success : true,
            message : "User Logged Out Successfully"
        })


    }
    catch(error){

        return res.status(500).json({
            success : false,
            message : "Unable to logout user"
        })
    }
}




// Dashboard Controller 
export const getProfileController = async (req ,res) =>{

    try{
        
         const user = await User.findById(req.userId).select("name email role bloodGroup location createdAt updatedAt donationHistory");

         if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found",
            })
         }
      
        return res.status(200).json({
            success : true,
            data : {
                user : {
                    id : user._id,
                    name : user.name,
                    email : user.email,
                    role : user.role,
                    bloodGroup : user.bloodGroup,
                    location : user.location,
                    createdAt : user.createdAt,
                    updatedAt : user.updatedAt,
                    donationHistory : user.donationHistory,
                },
            },
        });
    }
    catch(error){
          return res.status(500).json({
            success : false,
            message : "Internal Server Error",
            error : error.message
          })
    }
}