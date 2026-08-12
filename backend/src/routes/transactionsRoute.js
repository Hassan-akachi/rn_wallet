import express from "express";
import {
  getTransactionsByUserId,
  createTransaction,
  getTransactionSummary,
  deleteTransaction,
} from "../controllers/transactionsController.js"; //this will import the getTransactionsByUserId function from the transactionsController.js file that will be used to get the transactions for the given user from the database

const router = express.Router(); //this will create a new router instance that will be used to define the routes for the transactions

router.post("/", createTransaction); //this is the route that will be called when the user wants to create a new transaction

router.get("/:userId", async (req, res) => {
  //this is the route that will be called when the user wants to get a transaction by user ID
  getTransactionsByUserId(req, res); //this will call the getTransactionsByUserId function that will get the transactions for the given user from the database
});

router.delete("/:id", deleteTransaction); //this is the route that will be called when the user wants to delete a transaction by user ID

router.get("/summary/:userId", getTransactionSummary); //this is the route that will be called when the user wants to get a transaction summary by user ID);

export default router; //this will export the router instance that will be used in the server.js file
