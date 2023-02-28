const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    mongoose.set('strictQuery',true);
    try {
        await mongoose.connect(process.env.DATABSE_URI, {useNewUrlParser: true, useUnifiedTopology: true});
    } catch (err) {
        console.log(err)
    }
}
module.exports = connectDB;