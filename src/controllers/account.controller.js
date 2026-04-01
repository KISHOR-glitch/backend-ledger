const accountModel = require("../models/account.model");


async function createAccountController(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "User not authenticated"
    });
  }

  const account = await accountModel.create({
    user: req.user._id
  });

  res.status(201).json({
    account
  });
}

module.exports={
    createAccountController
}
