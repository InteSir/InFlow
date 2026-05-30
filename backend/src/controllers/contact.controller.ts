// controllers/contact.controller.ts

import { Request, Response } from "express";
import { sendContactMessage } from "../services/contact.services";


export const contactController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const result = await sendContactMessage({
      name,
      email,
      message,
    });

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    console.log(result);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};