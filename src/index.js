import dotenv from 'dotenv'; 
import connectDB from "./db/index.js"; 
import { app } from './app.js';

dotenv.config({
    path:'./.env'
})
const port = process.env.PORT || 3000;

connectDB().then(()=>{
    app.listen(port, ()=>{
        console.log("App is listening on port", process.env.PORT)
    })
}).catch((error)=>{
    console.log("MONGO db connection failed", error)
})




    // (async () => {
    //     try {
    //         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    //         app.on("error", (error) => {
    //             console.log(error)
    //             throw error 
    //         })

    //         app.listen(process.env.PORT,()=>{
    //             console.log('App is listening on port', process.env.PORT) 
    //         })
    //     } catch (error) {
    //         console.log(error)
    //         throw error

    //     }
    // })()