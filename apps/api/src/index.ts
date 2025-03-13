import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
/* ROUTE IMPORTS */
import courseRoutes from './routes/courseRoutes';
import transactionRoutes from './routes/transactionRoutes';
import userCourseProgressRoutes from './routes/userCourseProgressRoutes';
import { verifyToken } from './middleware/authMiddleware';

/* CONFIGURATIONS */
dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use('/courses', courseRoutes);
app.use('/transactions', verifyToken, transactionRoutes);
app.use('/users/course-progress', verifyToken, userCourseProgressRoutes);

/* SERVER */
const port = process.env.API_PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
