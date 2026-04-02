const transactionModel = require("../models/transaction.model")
const ledgerModel= require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService= require("../services/email.service")
const mongoose = require("mongoose")
async function createTransaction(req,res){

    /**
     * 1. validate request
     */
      

    const {
        fromAccount,toAccount,amount,idempotencyKey
    }= req.body

    if(!fromAccount || !toAccount || !amount,!idempotencyKey){
        res.status(400).json({
            message:"FromAccount,toAccount,amount and idempotency"

        })
    }
// finding user fromaccount
    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount,

    })
    //finding toaccount
    const toUserAccount = await accountModel.findOne({
        _id:toAccount,
    })

    //if not invalid account 
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message:"inavlid fromaccount or toaccount"
        })
    }

    /**
     * 2.validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotency : idempotencyKey
    })
    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "completed"){
return res.status(200).json({
    message:"Transaction already processed",
    transaction : isTransactionAlreadyExists
})
        }
        if(isTransactionAlreadyExists.status ==="pending" ){
    return   res.status(200).json({
                message:"Transaction is stil processing"
            })
        }
        if(isTransactionAlreadyExists.status ==="failed"){
return res.status(500).json({
                message:"Transaction proccessing failed"
            })
        }
        if(isTransactionAlreadyExists.status ==="reversed"){
          return   res.status(500).json({
                message:"Transaction was reversed please try"
            })
        }

    }

    /**
     * 3. check account status
     */
    
    if(fromUserAccount.status!== "ACTIVE"|| toUserAccount.status !== "ACTIVE" ){
return res.status(400).json({
    message:" both account need to be active"

})
    }

    /**
     * derive sender balance from ledger
     */

     const balance = await fromUserAccount.getBalance()
     if(balance<amount){
        res.status(400).json({
            message:`Insufficient balance , currenct balcne is ${balance}.Requested amount is ${amount}`
        })
     }

     /**
     * create transaction
     */

     const session = await mongoose.startSession()
     session.startTransaction()

     const transaction = await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"pending"
     }], {session})

     const transactionObj = transaction[0];

     const debitLedgerEntry = await ledgerModel.create([{
        account: fromAccount,
        amount:amount,
        transaction: transactionObj._id,
        type:"DEBIT"


     }],{session})
await new Promise((resolve)=> setTimeout(resolve, 2000))  // 2 seconds only
 // ← Add () to call the function
     const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount:amount,
        transaction: transactionObj._id,
        type:"CREDIT"


     }],{session})
      
     await session.commitTransaction()
     session.endSession()


     // email notification

     await emailService.sendTransactionEmail(req.user.email,req.user.name,toAccount)

     return res.status(201).json({
        messsage:"Transaction completed succesfulyu",
        transactions: transactionObj
     })

}

async function createInitialFundsTransaction(req,res){
      const { toAccount,amount,idempotencyKey}= req.body

      if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount,amount and idempotencyKey are required"
        })
      }

      const toUserAccount = await accountModel.findOne({
        _id: toAccount,
      })
      if(!toUserAccount){
        return res.status(400).json({
            message:"invalid toAccount"
        })
      }
   //
   const fromUserAccount = await accountModel.findOne({
    systemUser: true,
    user: req.user._id
   })
   if(!fromUserAccount){
    return res.status(400).json({
        message: "system user account not found"
    })
   }

   const transaction = await transactionModel.create({
    fromAccount : fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "pending"
   });
    const debitLedgerEntry = await ledgerModel.create({
        account:toAccount,
        amount:amount,
        transaction: transaction._id,
        type: "CREDIT"
    })
    const creditLedgerEntry = await ledgerModel.create({
        account:fromUserAccount._id,
        amount:amount,
        transaction: transaction._id,
        type: "DEBIT"
    })

    transaction.status = "completed"
    await transaction.save()
     
     return res.status(201).json({
        message:"Initial funds transaction completed succesfull",
        transaction: transaction
     })
}
module.exports ={
    createTransaction,
    createInitialFundsTransaction
}
