import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ChatController {
  static async getChatHistory(
    req: Request<{ userId: string }>,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const chats = await prisma.chat.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        select: { id: true, message: true, reply: true, createdAt: true },
      });
      return res.status(200).json({
        success: true,
        data: chats,
      });
    } catch (error: unknown) {
      console.error("Chat history error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get chat history",
      });
    }
  }

  static async getAssistantContext(
    req: Request<{ userId: string }>,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true },
      });
      if (!user) {
        return res.status(404).json({ success: false, error: "User not found" });
      }
      const onboarding = await prisma.onboarding.findUnique({
        where: { userId },
      });
      const relapses = await prisma.relapse.findMany({
        where: { userId },
        orderBy: { relapseDate: "desc" },
      });
      const lastRelapse = relapses[0] ?? null;
      const journeyStart = onboarding?.journeyStartDate ?? onboarding?.completedAt;
      let streak = 0;
      let riskLevel: "calm" | "high_risk" | "achievement" = "calm";
      if (journeyStart) {
        const lastReset = lastRelapse ? lastRelapse.relapseDate : journeyStart;
        const daysSince = (Date.now() - lastReset.getTime()) / (1000 * 60 * 60 * 24);
        streak = Math.floor(daysSince);
        if (streak >= 7) riskLevel = "achievement";
        else if (lastRelapse && daysSince < 1) riskLevel = "high_risk";
      }
      const greetingHint =
        riskLevel === "high_risk"
          ? "proactive"
          : riskLevel === "achievement"
            ? "congratulatory"
            : "default";
      return res.status(200).json({
        success: true,
        data: {
          displayName: user.displayName || "there",
          streak,
          riskLevel,
          greetingHint,
        },
      });
    } catch (error: unknown) {
      console.error("Assistant context error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to get assistant context",
      });
    }
  }

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