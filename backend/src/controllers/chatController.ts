import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ChatController {
  static async chatWithBot(
    req: Request<{ userId: string }>,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      // 🔥 Call FastAPI chatbot
      const chatbotResponse = await axios.post(
        "http://localhost:8000/api/chatbot/ask",
        {
          user_id: userId,
          message: message,
        }
      );

      const reply = chatbotResponse.data.reply;

      // 💾 Store chat in database
      const chat = await prisma.chat.create({
        data: {
          userId,
          message,
          reply,
        },
      });

      return res.status(200).json({
        success: true,
        data: chat,
      });
    } catch (error: any) {
      console.error("Chat error:", error?.response?.data || error.message);

      return res.status(500).json({
        success: false,
        error: "Failed to get chatbot response",
      });
    }
  }
}