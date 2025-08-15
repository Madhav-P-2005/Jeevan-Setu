// jeevansetu-backend/src/utils/generateTokens.js

import jwt from "jsonwebtoken";


/**
 * Generate Access & Refresh Tokens
 * @param {String} userId - MongoDB User ID
 * @returns {Object} - { accessToken, refreshToken }
 */


// Generate Access & Refresh Tokens
const generateTokens = (userId) =>{
      
    // Access Token -> Short expiry (eg ., 1 hour)

    const accessToken = jwt.sign(
        {id : userId},

        process.env.JWT_SECRET,
        {expiresIn : "1h"}
    );



    // Refresh Token  -> Long expiry (eg ., 7 days) 

    const refreshToken = jwt.sign(
        {id : userId},
        
        process.env.JWT_REFRESH_SECRET,
        {expiresIn : "7d"}
    );


    return {accessToken , refreshToken};
}



export default generateTokens;