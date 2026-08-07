import { sql } from "../config/db.js"; //this will import the sql instance from the db.js file that will be used to connect to the database




export async function getTransactionsByUserId(req, res) {
  const { userId } = req.params; //this will get the user ID from the request parameters
  try {
    const transactions =
      await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`; //this will get the transactions for the given user from the database
    if (transactions.length === 0) {
      //this will check if any transactions exist for the user
      return res
        .status(404)
        .json({ error: "No transactions found for this user" }); //this will send an error message as json with status code 404 (not found)
    }
    res.status(200).json(transactions); //this will send the transaction as json with status code 200 (ok)
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Internal Server Error" }); //this will send an error message as json with status code 500 (internal server error)
  }
}

export async function getTransactionSummary(req, res) {//this is the route that will be called when the user wants to check if the server is running
     const {userId} = req.params;//this will get the userId from the request parameters
    try {
       
        const balance = await sql` 
        SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}`;//this will get the summary of all transactions for the given user from the database

        const incomeResult = await sql`SELECT COALESCE(SUM(amount), 0) as income FROM transactions
        
        WHERE user_id = ${userId} AND amount > 0`;//this will get the total income for the given user from the database
        const expenseResult = await sql`SELECT COALESCE(SUM(amount), 0) as expense FROM transactions 
        WHERE user_id = ${userId} AND amount < 0`;//this will get the total expense for the given user from the database

        const summary = {
            balance: balance[0].balance,
            income: incomeResult[0].income,
            expense: expenseResult[0].expense
        };//this will create a summary object with the balance, income and expense  




        res.status(200).json(summary);//this will send the summary as json with status code 200 (ok)
    } catch (error) {
        console.error('Error fetching transaction summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });//this will send an error message as json with status code 500 (internal server error)
    }
}



export async function createTransaction (req, res)  {//this is the route that will be called when the user wants to create a new transaction
    const { user_id, title, amount, category } = req.body;//this will get the user_id, title, amount and category from the request body
    try {
        if (!user_id || !title || amount === undefined || !category) {//this will check if any of the required fields are missing
            return res.status(400).json({ error: 'Missing required fields' });//this will send an error message as json with status code 400 (bad request)
        }
        const result = 
        await sql`INSERT INTO transactions (user_id, title, amount, category) 
        VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING *`;//this will insert the new transaction into the database and return the inserted row
        res.status(201).json(result[0]);//this will send the inserted row as json with status code 201 (created)
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Internal Server Error' });//this will send an error message as json with status code 500 (internal server error)
    }
}



export async function deleteTransaction(req, res) {
  //this is the route that will be called when the user wants to delete a transaction by user ID
  const { userId } = req.params; //this will get the user ID from the request parameters
  try {
    if (isNaN(parseInt(userId))) {
      //this will check if the user ID is a number
      return res.status(400).json({ error: "Invalid user ID" }); //this will send an error message as json with status code 400 (bad request)
    }
    const result =
      await sql`DELETE FROM transactions WHERE user_id = ${userId} RETURNING *`; //this will delete the transaction with the given user ID from the database and return the deleted row
    if (result.length === 0) {
      //this will check if the transaction exists
      return res.status(404).json({ error: "Transaction not found" }); //this will send an error message as json with status code 404 (not found)
    }
    res.status(200).json({ message: "Transaction deleted successfully" }); //this will send a success message as json with status code 200 (ok)
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal Server Error" }); //this will send an error message as json with status code 500 (internal server error)
  }
}
