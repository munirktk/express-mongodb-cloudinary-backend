import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {

    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        })
        //file has been ploaded successfully
        console.log("file uploaded on cloudinary : ",response.url);
        //remove file from local
        // fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        //remove the locally save file temporary file as the upload operation got failed
        fs.unlinkSync(localFilePath)
        console.log("error in uploading file on cloudinary : ", error);
    }
}

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    { public_id: "olympic_flag" },
    function (error, result) { console.log(result); });