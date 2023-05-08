require('dotenv').config({path: "./sample.env"});
const PORT = process.env.PORT;
const mongoose = require('mongoose');

const connectDB = async () => {
    const URI = process.env.MONGO_URI; 

    try {
       
    const client = mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
    if(client){
        console.log(`MongoDB connected successfully on ${PORT}`)
    }
    } catch (e) {
    
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }
}

module.exports = {connectDB};