import express from "express";

import dotenv from "dotenv";
import { sql } from "./config/db.js";//this will import the sql instance from the db.js file that will be used to connect to the database
import rateLimiterMiddleware from "./middleware/rate-limiter.js";//this will import the ratelimiter middleware from the rate-limiter.js file that will be used to limit the number of requests to the server
import transactionsRoute from "./routes/transactionsRoute.js";//this will import the transactionsRoute from the transactionsRoute.js file that will be used to handle all the routes for the transactions

dotenv.config();//this will load the environment variables from the .env file into process.env

console.log(process.env.DATABASE_URL);
const app = express();//this is the main express app that will handle all the routes and middleware


const PORT = process.env.PORT || 5001;//this will get the port from the environment variables or use 5001 as default



//middleware
app.use(rateLimiterMiddleware);//this will use the ratelimiter middleware that will limit the number of requests to the server
app.use(express.json());//this will parse the incoming request body as json and make it available in req.body


async function initDB() {//this is an async function that will connect to the database and log the result
try {
        await sql`CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
    console.log('Database initialized successfully');
}
catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);//status code 1 means failure while status code 0 means success
}
}


app.get('/api/health', (req, res) => {//this is the route that will be called when the user wants to check if the server is running
    res.status(200).json({ message: 'Server is running' });
});


app.use('/api/transactions', transactionsRoute);//this will use the transactionsRoute.js file that will handle all the routes for the transactions

initDB().then(() => {//this will call the initDB function to connect to the database and log the result
    app.listen(PORT, () => {
        console.log(`Server is running on PORT: ${PORT}`);
    });
});