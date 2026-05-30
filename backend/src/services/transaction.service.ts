import { title } from 'process';
import TransactionModel, {
  TransactionTypeEnum,
} from '../models/transaction.model';
import { calculateNextOccurrence } from '../utils/helper';
import { bulkDeleteTransactionType, CreateTransactionType, UpdateTransactionType } from '../validators/transaction.validator';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import axios from "axios";
import { genAi, genAiModel } from '../config/google-ai.config';
import { createPartFromBase64, createUserContent } from '@google/genai';
import { receiptPrompt } from '../utils/prompt';
import { extractReceiptTextHF } from './huggingFace.service';
import { parseReceiptAIResponse } from '../utils/reciept.parser';
import * as fs from "fs";


export const createTransactionService = async (
  body: CreateTransactionType,
  userId: string,
) => {
  let nextRecurringDate: Date | undefined;
  const currentDate = new Date();

  if (body.isRecurring && body.recurringInterval) {
    const calculatedDate = calculateNextOccurrence(
      body.date,
      body.recurringInterval,
    );

    nextRecurringDate =
      calculatedDate < currentDate
        ? calculateNextOccurrence(currentDate, body.recurringInterval)
        : calculatedDate;
  }
  const transaction = await TransactionModel.create({
    ...body,
    userId,
    category: body.category,
    amount: Number(body.amount),
    isRecurring: body.isRecurring || false,
    recurringInterval: body.recurringInterval || null,
    nextRecurringDate,
    lastProcessedDate: null,
  });

  return transaction;
};

export const getAllTransactionService = async (
  userId: string,
  filters: {
    keyword?: string;
    type?: keyof typeof TransactionTypeEnum;
    recurringStatus?: 'RECURRING' | 'NON_RECURRING';
  },
  pagination: { pageSize: number; pageNumber: number },
) => {
    const{keyword,type,recurringStatus} = filters;
    const filterConditions:Record<string,any>={
        userId,

    };

    if(keyword){

        filterConditions.$or = [
            {title:{$regex:keyword,$options:"i"}},
            {category:{$regex:keyword,$options:"i"}},

        ];

    }
    if(type){
        filterConditions.type = type;
    }
    if(recurringStatus){

        if(recurringStatus === "RECURRING"){
            filterConditions.isRecurring = true;
    
        }else if(recurringStatus === "NON_RECURRING"){
            filterConditions.isRecurring = false;
        }
    }

    const {pageSize,pageNumber} = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [Transactions,totalCounts] = await Promise.all([
        TransactionModel.find(filterConditions).skip(skip).limit(pageSize).sort({createdAt:-1}),
        
        TransactionModel.countDocuments(filterConditions)
    ]);

    const totalPages = Math.ceil(totalCounts/pageSize);
    return {
        Transactions,
        pagination:{
            pageSize,
            pageNumber,
            totalCounts,
            totalPages,
            skip,

        }
    }





};


export const getTransactionByIdService = async(userId:string,transactionId:string)=>{
  const transaction = await TransactionModel.findOne({_id:transactionId,userId});
  if(!transaction){
    throw new NotFoundException("Transaction Not found");


  }
  return transaction;
};

export const duplicateTransactionService = async(userId:string,transactionId:string)=>{
    const transaction = await TransactionModel.findOne({_id:transactionId,userId});
  if(!transaction){
    throw new NotFoundException("Transaction Not found");


  }
  const duplicated = await TransactionModel.create({
    ...transaction.toObject(),
    _id:undefined,
    title:`Duplicate - ${transaction.title}`,
    description:transaction.description ? `${transaction.description} (Duplicate)`:"Duplicated transaction",
    isRecurring:false,
    recurringInterval:undefined,
    nextRecurringDate:undefined,
    createdAt:undefined,
    updatedAt:undefined,
  });

  return duplicated;

}

export const updateTransactionService = async(userId:string,transactionId:string,body:UpdateTransactionType) =>{
  const existingtransaction = await TransactionModel.findOne({_id:transactionId,userId});
  if(!existingtransaction){
    throw new NotFoundException("Transaction Not found");


  };

  const now  =  new Date();
  const isRecurring  = body.isRecurring ?? existingtransaction.isRecurring

  const date  = body.date !== undefined ? new Date(body.date) : existingtransaction.date;

  const recurringInterval = body.recurringInterval || existingtransaction.recurringInterval;

  let nextRecurringDate:Date | undefined;
 

  if (isRecurring && recurringInterval) {
    const calculatedDate = calculateNextOccurrence(
      date,
      recurringInterval,
    );

    nextRecurringDate =
      calculatedDate < now
        ? calculateNextOccurrence(now,recurringInterval)
        : calculatedDate;
  }
  existingtransaction.set({
    ...(body.title && {title:body.title} ),
    ...(body.description && {description:body.description} ),
    ...(body.category && {category:body.category} ),
    ...(body.type && {type:body.type} ),
    ...(body.paymentMethod && {paymentMethod:body.paymentMethod} ),
    ...(body.amount !== undefined && {amount:Number(body.amount)} ),
    date,
    isRecurring,
    recurringInterval,
    nextRecurringDate,


  });

  await existingtransaction.save();
  return;


  

};

export const  deleteTransactionService = async(userId:string,transactionId:string) =>{
    const deletedtransaction = await TransactionModel.findByIdAndDelete({_id:transactionId,userId});
  if(!deletedtransaction){
    throw new NotFoundException("Transaction Not found");


  }
  return;

};

export const bulkDeleteTransactionService = async(userId:string,transactionIds:string[]) =>{

  const result =  await TransactionModel.deleteMany({
    _id:{$in:transactionIds},
    userId,
  });
  if(result.deletedCount === 0 ){
    throw new NotFoundException("No transaction found");

  }

  return {
    success:true,
    deletedCount:result.deletedCount,
  }

};

export const bulkTransactionService = async(userId:string,transactions:CreateTransactionType[]) =>{
  try{
    const bulkOps = transactions.map((tx)=>({
      insertOne:{
        document:{...tx,userId,isRecurring:false,nextRecurringDate:null,recurringInterval:null,lastProcesses:null,createdAt:new Date(),updatedAt:new Date(),}
      },
    }));
    const result = await TransactionModel.bulkWrite(bulkOps,{ordered:true});

    return{
      insertedCount:result.insertedCount,
      success:true,
    }

  }catch(error){
    throw error;

  }
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));


async function generateContentWithRetry(
  payload: any,
  retries = 3,
  waitTime = 2000
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await genAi.models.generateContent(payload);
    } catch (error: any) {
      const is429 =
        error?.status === 429 ||
        error?.message?.includes("429") ||
        error?.message?.includes("quota") ||
        error?.toString().includes("Too Many Requests");

      if (is429 && attempt < retries) {
        console.warn(
          `[Gemini SDK] Rate limit (429) hit. Attempt ${attempt}/${retries}. Retrying in ${waitTime}ms...`
        );

        await delay(waitTime);
        waitTime *= 2;
        continue;
      }

      throw error;
    }
  }
}

export const scanRecieptService = async(file?:Express.Multer.File) =>{
  if (!file) {
    throw new Error(
      "Please upload a receipt image under the key 'reciept'."
    );
  }

  const filePath = file.path;

  try {
    console.log(
      `[OCR] Step 1: Received local upload saved at: ${filePath}`
    );

    // Read local file directly and convert to base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString("base64");

    console.log(
      `[OCR] Step 2: Converted file to Base64 (Size: ${fileBuffer.length} bytes)`
    );

    const payload = {
      model: genAiModel,
      contents: [
        receiptPrompt,
        {
          inlineData: {
            data: base64String,
            mimeType: file.mimetype,
          },
        },
      ],
      config: {
        temperature: 0,
        topP: 1,
        responseMimeType: "application/json",
      },
    };

    console.log(`[OCR] Step 3: Pinging ${genAiModel}...`);

    const result = await generateContentWithRetry(payload);

    const responseText = result.text;

    if (!responseText) {
      throw new Error(
        "No text response returned from the Gemini API."
      );
    }

    const cleanedText = responseText
      .replace(/```(?:json)?\n?/g, "")
      .trim();

    if (!cleanedText) {
      throw new Error("Could not read receipt content");
    }

    const data = JSON.parse(cleanedText);

    if (!data.amount || !data.date) {
      throw new Error(
        "Receipt missing required information"
      );
    }

    return {
      title: data.title || "Receipt",
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
      paymentMethod: data.paymentMethod,
      type: data.type,
      receiptUrl: file.path,
    };
  } catch (error) {
    console.error("Scan receipt error:", error);

    throw new Error(
      "Receipt scanning service not available"
    );
  }finally{
    if(filePath && fs.existsSync(filePath)){
      try{
        fs.unlinkSync(filePath);
      }catch(cleanupError){
         console.error(`[OCR] Cleanup Error: Failed to delete local file: ${filePath}`, cleanupError);
      }
    }
  }
};

