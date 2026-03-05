import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

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


export {
  registerUser,
  existedUser,
  createdUser,
}