import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import httpStatus from 'http-status';

const app: Application = express();

//* Using Cors
app.use(cors());

//* Parse Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//* User routes
app.use('/api/v1', routes);

//* GET method route
app.get('/', async (req: Request, res: Response) => {
  res.send(
    `<h1 style="color:#1F4D90;font-size:2rem;text-align:center;background:#0D1117;height:100vh;">Hello from server! :-)</h1>`
  );
});

//* Resource not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'API not route found!',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API route not found!',
      },
    ],
  });
  next();
});

// //* Global Error Handler
app.use(globalErrorHandler);

export default app;
