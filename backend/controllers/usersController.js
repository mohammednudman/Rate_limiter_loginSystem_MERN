const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

const {
    maxConsecutiveFailsByEmailAndIP,
    maxWrongAttemptsByIPperDay,
    limiterSlowBruteByIP,
    limiterConsecutiveFailsByEmailAndIP,
    getEmailIPkey
} = require('../config/rateLimiter');


const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const duplicate = await User.findOne({email}).lean().exec();
    if (duplicate) {
        return res.status(409).json({message: 'User already exists'});
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds
    const userObject = {name, email, "password": hashedPwd};

    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({message: `New user ${email} created`});
    } else {
        res.status(400).json({message: 'Invalid user data recieved'});
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const ipAddr = req.ip;

    if (!email || !password) {
        return res.status(400).json({message: 'All fields are required'});
    }

    const hashedPwd = await bcrypt.hash(password, 10)

    // Storing users email and IP address for rate-limiting purposes
    const emailIPkey = getEmailIPkey(email, ipAddr);

    const [resEmailAndIP,resSlowByIP] = await Promise.all([limiterConsecutiveFailsByEmailAndIP.get(emailIPkey), limiterSlowBruteByIP.get(ipAddr)]);

    let retrySecs = 0;
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > maxConsecutiveFailsByEmailAndIP) {
        retrySecs = Math.round(resEmailAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.set('Retry-After', String(retrySecs));
        res.status(429).send(`Too Many Attempts. Retry after ${retrySecs} seconds.`);
    } else {
        User.findOne({email}, (err, user) => {
            if (user) {
                bcrypt.compare(password, user.password, async (err, response) => {
                    if (response) {
                        if (resEmailAndIP !== null && resEmailAndIP.consumedPoints > 0) {
                            // Reset on successful authorisation
                            await limiterConsecutiveFailsByEmailAndIP.delete(emailIPkey);
                        }
                        res.status(200).json({message: "Login Successfully"});
                    }
                    if (err) {
                        try {
                            const promises = [ await limiterSlowBruteByIP.consume(ipAddr)];
                            promises.push(await limiterConsecutiveFailsByEmailAndIP.consume(emailIPkey));
                            await Promise.all(promises)
                            res.status(401).json({message: "Invalid Credentials"});
                        } catch (rlRejected) {
                            if (rlRejected instanceof Error) {
                                throw rlRejected;
                            } else {
                                res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                                res.status(429).send('Too Many Requests');
                            }
                        }
                    }
                })

            } else {
                res.status(409).json("User not registered");
            }
        })
    }
});

module.exports = {registerUser, loginUser};