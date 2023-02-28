const redis = require('redis');
const {RateLimiterRedis} = require('rate-limiter-flexible');
const asyncRedis = require('async-redis');
const {logEvents} = require("../middleware/logEvents");

const redisClient = redis.createClient(process.env.REDIS_URL,{
    enable_offline_queue: false,
});

redisClient.on('error', err=>{
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'redisErrLog.log')
    return new Error();
})

const maxWrongAttemptsByIPperDay = 5;
const maxConsecutiveFailsByEmailAndIP = 5;

const limiterSlowBruteByIP = new RateLimiterRedis({
   storeClient: redisClient,
   keyPrefix: 'login_fail_ip_per_day',
   points: maxWrongAttemptsByIPperDay,
   duration: 60 * 60 * 24 * 24, // Store number for 90 days since first fail
   blockDuration: 60 * 60 * 24, // Block the ip for 1 day, if 5 wrong attempts
});

const limiterConsecutiveFailsByEmailAndIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByEmailAndIP,
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60 * 24, // Block for 24 hour
});

const getEmailIPkey = (email, ip) => `${email}_${ip}`;

module.exports = {
    maxConsecutiveFailsByEmailAndIP,
    maxWrongAttemptsByIPperDay,
    limiterSlowBruteByIP,
    limiterConsecutiveFailsByEmailAndIP,
    getEmailIPkey,
};