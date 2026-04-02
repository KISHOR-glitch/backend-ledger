const {Router}= require('express')
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router();


transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)


transactionRoutes.post("/",authMiddleware.authSystemUserMiddleware,transactionController.createTransaction)


module.exports= transactionRoutes;