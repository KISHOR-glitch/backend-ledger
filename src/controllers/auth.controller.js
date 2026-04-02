const userModel= require("../models/user.model")
const accountModel = require("../models/account.model")
const tokenBlackListModel = require("../models/blackList.model")
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service")


async function userRegisterController(req,res){
    const{email,password,name}=req.body;
    const isExists = await userModel.findOne({
        email:email
    })
    if(isExists){
        return res.status(422).json({
           message:"user alredy exists with gmail",
           status:'failed'
        } )
    }

    const user = await userModel.create({
        email,password,name
    })

    await accountModel.create({
        user: user._id,
        systemUser: true,
        status: "ACTIVE",
        currency: "INR"
    })

    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie('token',token)
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    });

  await emailService.sendRegisrationEmail(user.email,user.name);
    

}

async function userLoginController(req,res){
    const {email,password}= req.body
  const user = await userModel.findOne({email}).select('+password')

    if(!user){
        return res.staus(401).json({
            message :"email is not valid"

        })
    }
    const isValidPassword = await user.comparePassword(password)
    if(!isValidPassword){
        return res.status(401).json({
            message:"email or password is invalid"
        })
    }
   const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:"3d"})

    res.cookie('token',token)
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    });
     await emailService.sendRegisrationEmail(user.email,user.name);


}
async function userLogoutController(req,res){
    const token = req.cookies.token|| req.headers.authorization?.split(" ")[ 1 ]

    if(!token){
        return res.status(400).json({ 
            message:"user logout succefully"
        })
    }

   res.clearCookie("token")
    await tokenBlackListModel.create({
        token:token
    })

    res.status(200).json({
        message:" user logout success"
    })
}



module.exports={
    userRegisterController,
    userLoginController,
    userLogoutController
}