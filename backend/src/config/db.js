import { neon } from "@neondatabase/serverless";//why is neo in braket beacuse it is a named export from the package, not the default export.

import "dotenv/config";//this will load the environment variables from the .env file into process.env


//this will create a new instance of the neon client that will be used to connect to the database
//export const sql = neon(process.env.DATABASE_URL);//this will get the database url from the environment variables and pass it to the neon client

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing in environment variables!");
}
export const sql = neon(process.env.DATABASE_URL);