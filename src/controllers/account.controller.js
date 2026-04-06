const accountModel = require("../models/account.model");


async function createAccountController(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "User not Aunthenated"
    });
  }

  const account = await accountModel.create({
    user: req.user._id
  });

  res.status(201).json({
    account
  });
}
async function getUserAccount(req, res) {
  const accounts = await accountModel.find({ user: req.user._id });
  res.status(200).json({
    accounts
  });
}

async function getAccountBalance(req,res){
  const {accountId}=req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  })
  if(!account){
    return res.status(404).json({
      message: "Aount not found"
    })
  }

  const balance = await account.getBalance();
  res.status(200).json({
    accountId:account._id,
    balance: balance
  })
}
module.exports = {
  createAccountController,
  getUserAccount,
  getAccountBalance

};
