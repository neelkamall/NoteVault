import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generaterefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler( async(req, res) => {

  res.status(200).json({
    message: "aeronics"
  })
// get user details from frotend
// validation - not empty 
// check if user already exists: username, email
// create user object - create entry in db
// remove passwordd and refresh token field from response
// check for user creation 
// return response

  const {fullName, email, password} = req.body
  console.log("email:", email);

  if (
    [fullName, email, password].some((field) => field?.trim() === "")
  ){
    throw new ApiError(400, "All fields are complusory")
  }
  const existedUser = await User.findOne({email})

  if(existedUser){
    throw new ApiError(409, "User already existed")
  }

  const user = await User.create({
    fullName,
    password,
    email,    
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registed Successfully")
  )

})

const loginUser = asyncHandler(async (req, res) => {
  // req -> data
  // email
  // find the user
  // password check
  // access and refresh token
  // send cookie

  const {email, password} = req.body
  console.log(email);

  if (!email){
    throw new ApiError(400, "email is required")
  }

  const user = await User.findOne({email})

  if (!user){
    throw new ApiError(404, "User does not exist")
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if (!isPasswordValid){
    throw new ApiError(401, "Invalid user credentials")
  }
  
  const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

  const loggedInUser = await user.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "user logged In Successfully"
    )
  )

})

const logoutUser = asyncHandler(async(req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )
  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (incomingRefreshToken){
    throw new ApiError(401, "unathorized request")
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    )
  
    const user = await User.findById(decodedToken?._id)
    if (!user){
      throw new ApiError(401, "Invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
    }
    
    const options ={
      httpOnly: true,
      secure: true
    }
  
    const {accessToken, newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh Token")
  }

})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
}