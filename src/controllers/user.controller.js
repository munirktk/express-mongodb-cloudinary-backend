import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { validateEmail } from "../utils/validation.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshTokens = async (userId) => {
  try {
  console.log("console on line 100", userId)

    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken();
    const refreshToken =await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

  } catch (error) { 
    throw new ApiError(500, `Something went wrong while generating token ${error}`)
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;

  // Check for required fields
  if (![userName, email, fullName, password].every(field => field.trim())) {
    throw new ApiError(400, "All fields are required");
  }
  // Validate email
  if (!validateEmail(email)) {
    throw new ApiError(400, 'Invalid email address');
  }

  // Check for existing user
  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new ApiError(409, 'User with email or username already exists');
  }

  // Upload avatar and cover image if available
  const avatarFile = req.files?.avatar?.[0];
  const coverImageFile = req.files?.coverImage?.[0];

  if (!avatarFile) {
    throw new ApiError(400, "Avatar file is required");
  }

  const [avatar, coverImage] = await Promise.all([
    uploadOnCloudinary(avatarFile.path),
    uploadOnCloudinary(coverImageFile?.path)
  ]);

  // Create user
  const newUser = await User.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  // Send response
  return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email access
  //find the user 
  //password check
  //generate tokens
  //send cookies
  const { userName, email, password } = req.body; 
  if (!(userName || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }]
  })

  if (!user) {
    throw new ApiError(404, "User does not exist")
  } 

  const isPasswordValid = await user.isPasswordCorrect(password)
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
  }
  console.log("console on line 100", user._id)

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: false,
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully"
      )
    );
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: '',
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure:false,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, loginUser, logoutUser };
