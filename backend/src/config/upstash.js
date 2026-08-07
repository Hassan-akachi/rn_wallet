import { Redis } from '@upstash/redis'

import { Ratelimit } from '@upstash/ratelimit'


import 'dotenv/config'//this will load the environment variables from the .env file


const ratelimit = new Ratelimit({
 redis: Redis.fromEnv({}),//this will create a new redis instance with the settings from the environment variables
limiter: Ratelimit.slidingWindow(10, "60s"), //this will create a new rate limit instance that will allow 10 requests per 60 seconds
});

export default ratelimit;//this will export the ratelimiter instance that will be used in the server.js file