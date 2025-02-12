import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import adminRouter from './routes/adminRoute.js'
import doctorRouter from './routes/doctor.Route.js'
import userRouter from './routes/userRoute.js'
import resumeRouter from './routes/resumeRoute.js';

//app config
const app = express();
const port = process.env.PORT || 4000
connectDB();
connectCloudinary();

//middleware
app.use(express.json())
app.use(cors())

//api endpoints
app.use('/api/admin',adminRouter)
app.use('/api/doctor',doctorRouter)
app.use('/api/user',userRouter)
app.use('/api/resumes', resumeRouter);

app.get('/', (req, res) => {
  res.send('API WORKING');
})

app.listen(port, () => console.log('Server Started', port));

// console.log(process.env.CLOUDINARY_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_SECRET_KEY);