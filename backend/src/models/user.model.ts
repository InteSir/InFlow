import mongoose,{ Document,Schema}from "mongoose";

import { compareValue, hashValue } from "../utils/bcrypt";

interface UserPreferences {
    enable2FA:boolean;
    emailNotification:boolean;
    twoFactorSecret?:string;
}


const UserPreferencesSchema = new Schema<UserPreferences>({
    enable2FA:{type:Boolean,default:false},
    emailNotification:{type:Boolean,default:true},
    twoFactorSecret:{type:String,required:false}
});

export type SubscriptionPlan = "free"|"pro";
export type SubscriptionStatus = "trialing"|"active"|"canceled"|"past_due"|"inactive";

export type AuthProvider = "local" | "google";

// A Stripe Customer ID (cus_...) is a unique identifier for a user, linking their payment methods and billing info, while a Subscription ID (sub_...) is a unique identifier for a specific recurring plan assigned to that customer. These IDs are essential for managing billing, upgrades, and cancellations

export interface UserDocument extends Document{
    name:string
    email:string
    password:string | null  // null for Google-only accounts
    profilePicture:string|null
    isEmailVerified:boolean
    userPreference:UserPreferences
    createdAt:Date
    updatedAt:Date

    googleId:string | null; // Google's "sub" claim
    provider:AuthProvider;  // "local" | "google"

    //stripe + subscription fields
    stripeCustomerId?:string;
    subscriptionPlan:SubscriptionPlan;
    subscriptionStatus:SubscriptionStatus;
    subscriptionId?:string;
    trialEndsAt?:Date;   // when the 3-day trial expires
    currentPeriodEnd?:Date // when the current paid period ends

    isTrialActive:() => boolean;
    hasProAccess:()=>boolean;


    comparePassword:(password:string)=>Promise<boolean>
    omitPassword:()=>Omit<UserDocument,'password'>

}
const userSchema = new Schema<UserDocument>({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true,
        lowercase:true,
    },
    profilePicture:{
        type:String,
        default:null,
    },
    // password is no longer required at schema level — Google users
    password:{
        type:String,
        default:null,
    },
    isEmailVerified:{
        type:Boolean,
        default:false

    },
    userPreference:{
        type:UserPreferencesSchema,
        default:{},
    },
    googleId:{type:String,default:null,sparse:true},
      // sparse: true → MongoDB only indexes documents where googleId != null,
       // which avoids a unique-index collision among all the null rows.

    provider:{
        type:String,
        enum:["local","google"],
        default:"local",
    },
    stripeCustomerId:{
        type:String,
        default:null,
    },
    subscriptionPlan:{
        type:String,
        enum:["free","pro"],
        default:"free"
    },
    subscriptionStatus:{
        type:String,
        enum: ["trialing", "active", "canceled", "past_due", "inactive"],
        default: "trialing",
    },
    subscriptionId:{
        type:String,
        default:null,
    },
    trialEndsAt:{
        type:String,
        default:null,
    },
    currentPeriodEnd: { 
        type: Date,
        default: null 
    },



},{
    timestamps:true,
});

userSchema.pre("save",async function(next){
    if(this.isModified("password") && this.password){//Only hash when password changes.
        this.password = await hashValue(this.password);
    }
    next();
    
});

//Remove password before sending user data to frontend

userSchema.methods.omitPassword = function ():Omit<UserDocument,"password">{
    const userObject =  this.toObject();
    delete userObject.password;
    delete userObject.userPreference.twoFactorSecret;
    return userObject;
    
}

userSchema.methods.comparePassword = async function(password:string){
    if (!this.password) return false;
    return compareValue(password,this.password);
}


userSchema.methods.isTrialActive = function (): boolean{
    if (this.subscriptionStatus !== "trialing") return false;
    if (!this.trialEndsAt) return false;
    return new Date() < this.trialEndsAt;
};

// Does the user have full app access right now?
userSchema.methods.hasProAccess = function (): boolean {
  if (this.subscriptionStatus === "active" && this.subscriptionPlan === "pro") return true;
  return this.isTrialActive();
};


const userModel =  mongoose.model<UserDocument>("User",userSchema);
export default userModel;