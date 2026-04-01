const mongoose = require("mongoose")
 
const transactionSchema = new mongoose.Schema({
    fromAccount :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"transaction must ne associated with a from account"],
        index:true,
    }
    ,
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "account",
        required:[true,"transaction must be associated with a to account"],
        index:true
    },
    status:{
        type:String,
        enum:{
            values:["pending","completed","failed","reveresed"],

        },
        default :"pending"

    },
    amount:{
        type:Number,
        required:[true,"account is requierd for creating a transaction "]
    },
    idempotencyKey:{
       type:String,
       required : [ true,"Idempotency Key is requied for creating a transaction"] ,
       index:true,
       unique: true
    }

    },{
        timestamps:true
    }
)
const transactionModel = mongoose.model("transaction",transactionSchema)
module.exports = transactionModel;