import ratelimit from "../config/upstash.js";//this will import the ratelimiter instance from the upstash.js file that will be used to limit the number of requests to the server

const rateLimiterMiddleware = async (req, res, next) => {//this is the middleware that will be used to limit the number of requests to the server
  try {
    //const ip = req.ip;//this will get the ip address of the user making the request
   
    const { success } = await ratelimit.limit('my-rate-limit-key');//this will check if the user has exceeded the rate limit
    
    if (!success) {//this will check if the user has exceeded the rate limit
      return res.status(429).json({ error: "Too many requests", message: "You have exceeded the rate limit." });//this will send an error message as json with status code 429 (too many requests)
    }
   
    next();//this will call the next middleware in the stack
 
} catch (error) {
    console.error("Error in rate limiter middleware:", error);
    res.status(500).json({ error: "Internal Server Error" });//this will send an error message as json with status code 500 (internal server error)
  }
};

export default rateLimiterMiddleware;//this will export the ratelimiter middleware that will be used in the server.js file