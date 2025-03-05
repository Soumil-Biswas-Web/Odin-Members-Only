import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { indexRouter } from './routes/indexRouter.js';
import { authRouter } from './routes/authRouter.js';
import { addRouter } from './routes/addRouter.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Allow requests from specific origin
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Check if origin contains "localhost"
        if (/^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        } else {
          return callback(new Error('Not allowed by CORS'));
        }},
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true // If sending cookies or authorization headers
}));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/add", addRouter);

// Every thrown error in the application or the previous middleware function calling `next` with an error as an argument will eventually go to this middleware function
app.use((err, req, res, next) => {
    console.error(err);
    // We can now specify the `err.statusCode` that exists in our custom error class and if it does not exist it's probably an internal server error
    res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})

/* 
Make new database in DB

One for TABLE users (username, first_name, last_name, password, isMember, isAdmin)

password should be in bcrypt. But implement without bcrypt for now

Check Odin's page on authentication for reference

Make Login and Sign Up pages. Check if they can send over data properly

*/

/* 

Make new TABLE FOR messages (user, message, timestamp)

this db stores messages written by users

Make a page to create new posts. See if they get stored properly

*/

/*

users should only be able to enter the membership group if they enter a secret password

after login, if the secret is entered, their isMember status is set to true

*/

/**
 * Finally, create a page that fetches and displays all the messages in a wall.
 * 
 */

