import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI as string;
        const conn = await mongoose.connect(mongoURI);
        console.log(`MongoDB połączono: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Błąd: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};

export default connectDB;