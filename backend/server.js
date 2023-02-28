require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const {logger, logEvents} = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConnection');

const PORT = process.env.PORT || 3500;

// Custom middleware
app.use(logger);
connectDB();

// Middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(cors(corsOptions));

// Routes
app.use('/', require('./routes/userRoutes'));

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log("Database Connected");
    app.listen(PORT, () => {
        console.log("Server listening on port " + PORT);
    });
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

