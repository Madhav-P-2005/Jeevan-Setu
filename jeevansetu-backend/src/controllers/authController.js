// jeevansetu-backend/src/controllers/authController.js

import User from "../models/User.js";

import generateTokens from "../utils/generateTokens.js";

import jwt from "jsonwebtoken";


// Register New User Controller 
export const registerUser = async (req , res) => {

    try { 
 
        const {name , email , password , role , bloodGroup, available , country, phone , city , state , message , lastDonationAt, addressLine1, addressLine2, postalCode , address, instagram , x , facebook } = req.body;

        // Normalize and trim inputs
        const emailNorm = (email || "").toLowerCase().trim();
        const nameTrim = (name || "").trim();
        const cityTrim = (city || "").trim();
        const addressLine1Trim = (addressLine1 || "").trim();
        const addressLine2Trim = (addressLine2 || "").trim();
        const postalCodeTrim = (postalCode || "").trim();
        const addressTrim = (address || "").trim();
        const instagramTrim = (instagram || "").trim();
        const xTrim = (x || "").trim();
        const facebookTrim = (facebook || "").trim();
        const stateTrim = (state || "").trim();
        const countryTrim = (country || "").trim(); 
        const messageTrim = (message || "").trim();
        const phoneTrim = (phone || "").trim();
        const roleNorm = (role || "donor").trim();


        // 1) Basic Validation
        if(!nameTrim || !emailNorm || !password){
            return res.status(400).json({
                success : false,
                message : "Name , email , and password are required"
            });
        };
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

        // 1c) role validation (enum)
        const allowedRoles = ["donor", "recipient"];
        if (roleNorm && !allowedRoles.includes(roleNorm)) {
            return res.status(400).json({
                success: false,
                message: "Valid role is required (donor, recipient)",
            });
        }

        // 1d) lastDonationAt validation (optional)
        let lastDonationAtDate = null;
        if (lastDonationAt) {
            const d = new Date(lastDonationAt);
            if (isNaN(d.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid lastDonationAt date",
                });
            }
            lastDonationAtDate = d;
        }



        // 2) Check duplicate 
        if(await User.exists({ email: emailNorm })){
            return res.status(409).json({
                success : false,
                message : "User already exists",
            })
        }
       

        // 3) Create User (model pre-save will hash password)
        const user = await User.create({
            name: nameTrim,
            email: emailNorm,
            password,
            role: roleNorm,
            bloodGroup,
            available,
            country: countryTrim,
            phone: phoneTrim,
            city: cityTrim,
            state: stateTrim,
            message: messageTrim,
            address : {
                line1 : addressTrim || addressLine1Trim,
                line2 : addressLine2Trim,
                postalCode : postalCodeTrim,
            },
            social:{
                instagram : instagramTrim,
                x : xTrim,
                facebook : facebookTrim,
            },
            lastDonationAt: lastDonationAtDate,
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
                    bloodGroup : user.bloodGroup,
                    available : user.available,
                    country : user.country,
                    phone : user.phone,
                    city : user.city,
                    state : user.state,
                    message : user.message,
                    address : user.address,
                    social : user.social,
                    lastDonationAt : user.lastDonationAt,
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
            error: error.message,
        });
    }
};


// Login User Controller 
export const loginUser = async (req, res) =>{

    try {
      const { email, password } = req.body;

      const emailNorm = (email || "").toLowerCase().trim();

      // 1) Basic Validation
      if (!emailNorm || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
      }

      // 2) Find user by email

      const user = await User.findOne({ email: emailNorm }).select("+password");
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
                bloodGroup : user.bloodGroup,
                available : user.available,
                country : user.country,
                phone : user.phone,
                city : user.city,
                state : user.state,
                message : user.message,
                address : user.address,
                social : user.social,
                lastDonationAt : user.lastDonationAt,
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
            success: true,
            data: {
                accessToken
            }
        })

    }
    catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        })
    }
}




// Logout Controller 
export const LogoutUserController = async (req, res) => {

    try {

        const isProd = process.env.NODE_ENV === "production";

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })


        return res.status(200).json({
            success: true,
            message: "User Logged Out Successfully"
        })


    }
    catch (error) {

        return res.status(500).json({
            success: false,
            message: "Unable to logout user"
        })
    }
};

// Update Profile Controller (partial updates)
export const updateProfileController = async (req, res) => {
  try {
    const {
      name,
      phone,
      city,
      state,
      country,
      message,
      available,
      bloodGroup,
      // address can be provided as a single string
      address,
      // or legacy fields
      addressLine1,
      addressLine2,
      postalCode,
      // social
      instagram,
      x,
      facebook,
    } = req.body;

    const allowedGroups = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
    const update = { $set: {} };

    // helper
    const setIfString = (path, val) => {
      if (typeof val === "string") update.$set[path] = val.trim();
    };

    // Personal details
    setIfString("name", name);
    setIfString("phone", phone);
    setIfString("city", city);
    setIfString("state", state);
    setIfString("country", country);
    setIfString("message", message);
    if (typeof available === "boolean") update.$set.available = available;
    if (typeof bloodGroup === "string" && allowedGroups.includes(bloodGroup)) {
      update.$set.bloodGroup = bloodGroup;
    }

    // Address: map single string to address.line1; keep legacy fields
    setIfString("address.line1", address);
    setIfString("address.line1", addressLine1);
    setIfString("address.line2", addressLine2);
    setIfString("address.postalCode", postalCode);

    // Social links
    setIfString("social.instagram", instagram);
    setIfString("social.x", x);
    setIfString("social.facebook", facebook);

    if (Object.keys(update.$set).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid update fields provided",
      });
    }

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
      fields:
        "name email role bloodGroup city state country phone message available lastDonationAt createdAt updatedAt donationHistory address social",
    }).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
          available: user.available,
          country: user.country,
          phone: user.phone,
          city: user.city,
          state: user.state,
          message: user.message,
          address: user.address,
          social: user.social,
          lastDonationAt: user.lastDonationAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          donationHistory: user.donationHistory,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Dashboard Controller 
export const getProfileController = async (req, res) => {

    try {

        const user = await User.findById(req.userId)
            .select("name email role bloodGroup city state country phone message available lastDonationAt createdAt updatedAt donationHistory address social")
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            })
        }

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    bloodGroup: user.bloodGroup,
                    available: user.available,
                    country: user.country,
                    phone: user.phone,
                    city: user.city,
                    state: user.state,
                    message: user.message,
                    address: user.address,
                    social: user.social,
                    lastDonationAt: user.lastDonationAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    donationHistory: user.donationHistory,
                },
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}