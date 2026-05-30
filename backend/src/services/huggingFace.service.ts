import axios from "axios";
import { HF_API_URL } from "../config/huggingface.config";
import { Env } from "../config/env.config";





export const extractReceiptTextHF = async (
  imageUrl: string
): Promise<any> => {

  try {

    console.log("Downloading image...");

    // Step 1: download image from Cloudinary
    const imageResponse = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    console.log("Sending to HuggingFace model...");

    // Step 2: send image binary to HF router
    const response = await axios.post(
      HF_API_URL,
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${Env.HUGGING_FACE_API}`,
          "Content-Type": "application/octet-stream",
        },
        timeout: 60000,
      }
    );

    console.log("HF response received");

    return response.data;

  } catch (error: any) {

    console.error(
      "HuggingFace error full:",
      error.response?.data || error.message
    );

    throw new Error("HuggingFace receipt scanning failed");

  }

};