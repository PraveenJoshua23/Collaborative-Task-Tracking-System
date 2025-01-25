import express from 'express';
import connectDB from './utils/db.js';

const app = express();
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
