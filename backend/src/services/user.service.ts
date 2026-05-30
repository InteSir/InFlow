import userModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async(userId:string)=>{
    const user = await userModel.findById(userId);
    return user?.omitPassword();
};

export const updateUserService = async(userId:string,body:UpdateUserType,profilePic?:Express.Multer.File)=>{

    const user = await userModel.findById(userId);
    if(!user) throw new NotFoundException("User nor found");

    if(profilePic){
        user.profilePicture = profilePic.path
    }
    user.set({
        name:body.name,

    });

    await user.save();

    return user?.omitPassword();



};