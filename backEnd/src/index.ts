import express, { Application, Request, Response, NextFunction } from 'express';
import { PORT } from './config';


const app: Application = express();

const port = PORT || 8080;

app.use(express.json());



app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Welcome to the API!' });
});



// jalankan server
app.listen(PORT, () => {
    console.log(`Server started on port http://localhost:${PORT}`);
});