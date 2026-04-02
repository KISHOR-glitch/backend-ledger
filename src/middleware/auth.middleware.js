const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blackList.model")
async function authMiddleware(req,res,next){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(401).json({
            message:"unauthorized access, token is misssing"
        })
    }
  const isBlacklisted = await tokenBlackListModel.findOne({token})

  if(isBlacklisted){
    return res.status(401).json({
        message:" token alredy blocklisted"
    })
    
  }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
         req.user = decoded  
          next()  //
        
    }
    catch(err){
        return res.status(401).json({
            message:"unauthorized access, token is invalid"
        })
    }
}

async function authSystemUserMiddleware(req,res,next){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[ 1 ]
    if(!token){
        return res.status(401).json({
            message:"unauthorized access,token is misssing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({token})

  if(isBlacklisted){
    return res.status(401).json({
        message:" token alredy blocklisted"
    })
    
  }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message:"Forbidden accces,not a system user"
            })
        }
 req.user= user;
 return next();
    }
    catch(err){
        return res.status(401).json({
            message:"Unauthorized access,token is invalid"
        })


    }
}
module.exports={
    authMiddleware,
    authSystemUserMiddleware
}