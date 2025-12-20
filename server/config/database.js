import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectdb = () => {
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {console.log("Database Connected")})
    .catch((err) => {console.log("Error While Connecting", err)});
}