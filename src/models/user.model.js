const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = mongoose.Schema({
    email:{
        type:String,
        required :[true,"Email is required for creating a user"],
        trim:true,
        lowercase:true,
        match :[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,"invalid email addresss"],
        unique:[true,"email alredy existed"]
    },
    name :{
        type:String,
        required :[ true,"name is requierd for creating an account"]
    },
    password:{
        type:String,
        required:[true,"password is requierd for creating an accound"],
        minlength :[6,"passworedd should contain more than 6 charcter"],
        select : false
    },
    systemUser:{
        type:Boolean,
        default: false,
        immutable:true,
        select:false
    }
})

userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return 
    }
    const hash = await bcrypt.hash(this.password,10)
    this.password = hash;
   
})

userSchema.methods.comparePassword = async function(password){
return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model("user",userSchema)

module.exports = userModel


