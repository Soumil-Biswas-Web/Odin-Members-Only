import 'dotenv/config'; // Loads the .env file automatically

// Uncomment this to use local psql db
// import pkg from "pg";
// const { Pool } = pkg;

// const pool = new Pool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port: 5432 // The default port
// })

// // Enable query logging
// pool.on('connect', () => {
//     console.log('Connected to the PostgreSQL database');
// });

// pool.on('error', (err) => {
//     console.error('Unexpected error on idle client', err);
// });

// export {pool};

// Uncomment this to use Neon psql db

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DB_URL);

const pool = {
    query: async (text, params) => {
      return {
        rows: await sql(text, params),
      };
    },
  };
  
  const requestHandler = async (req, res) => {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(version);
  };
  
  console.log(requestHandler);
  
  export {pool};