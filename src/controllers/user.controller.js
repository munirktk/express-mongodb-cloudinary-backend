import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateEmail } from "../utils/validation.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";  
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  console.log("userName", userName, "email", email);
  if ([userName, email, fullName, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // email validation check
  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid email address');
  }

  const existedUser = User.findOne({
    $or : [{ userName },{ email }]
  })
  if (existedUser) {
    throw new ApiError(409, 'User with email or user name already exist');
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("avatarLocalPath",avatarLocalPath);
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("coverImageLocalPath",coverImageLocalPath);

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
  }

 await User.create({
    userName : userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  })
 const createdUser = await User.findById(User._id).select(
  "-password -refreshToken"
 )

 if(!createdUser){
  throw new ApiError(500, "Something went wrong while regestring a user")
 }

 return res.status(201).json(
  new ApiResponse(200,createdUser,"User registered successfully")
 ); 
});

export { registerUser };
