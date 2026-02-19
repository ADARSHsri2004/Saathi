import { Request, Response } from "express";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const CHATBOT_API_URL = process.env.CHATBOT_API_URL || 'https://saathi-chatbot.onrender.com';

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

  // static async chatWithBot(
  //   req: Request<{ userId: string }>,
  //   res: Response
  // ) {
  //   try {
  //     const { userId } = req.params;
  //     const { message } = req.body;

  //     if (!message) {
  //       return res.status(400).json({
  //         success: false,
  //         error: "Message is required",
  //       });
  //     }

  //     // 🔥 Call FastAPI chatbot
  //     const chatbotResponse = await axios.post(
  //       `${ChatbotAPI}/api/chatbot/ask`,
  //       {
  //         user_id: userId,
  //         message: message,
  //       }
  //     );

  //     const reply = chatbotResponse.data.reply;

  //     // 💾 Store chat in database
  //     const chat = await prisma.chat.create({
  //       data: {
  //         userId,
  //         message,
  //         reply,
  //       },
  //     });

  //     return res.status(200).json({
  //       success: true,
  //       data: chat,
  //     });
  //   } catch (error: any) {
  //     console.error("Chat error:", error?.response?.data || error.message);

  //     return res.status(500).json({
  //       success: false,
  //       error: "Failed to get chatbot response",
  //     });
  //   }
  // }

  static async chatWithBot(
    req: Request<{ userId: string }>,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const { message } = req.body;

      console.log("going to call",CHATBOT_API_URL)

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message is required",
        });
      }

      // 1️⃣ Fetch all necessary context from Database
      const [onboarding, memory, relapses] = await Promise.all([
        prisma.onboarding.findUnique({ where: { userId } }),
        prisma.chatMemory.findUnique({ where: { userId } }),
        prisma.relapse.findMany({ 
          where: { userId }, 
          orderBy: { relapseDate: 'desc' },
          take: 5 
        }),
      ]);

      // 2️⃣ Format Relapses for the AI (Dates to strings)
      const relapseDates = relapses.map(r => 
        r.relapseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      );

      // 3️⃣ Prepare the Payload for the FastAPI Chatbot
      const chatbotPayload = {
        user_id: userId,
        message: message,
        summary: memory?.summary || "",
        user_profile: {
          addictionTypes: onboarding?.addictionTypes || [],
          whenItHappens: onboarding?.whenItHappens || [],
          feelAfter: onboarding?.feelAfter || "",
          frequency: onboarding?.frequency || "",
          frequencyQuantity: onboarding?.frequencyQuantity?.toString() || "",
          frequencyUnit: onboarding?.frequencyUnit || "",
          moneySpentPerDay: onboarding?.moneySpentPerDay?.toString() || "0",
          impactAreas: onboarding?.impactAreas || [],
          intention: onboarding?.intention || "",
          journeyStartDate: onboarding?.journeyStartDate?.toISOString() || ""
        },
        relapses: relapseDates
      };

      // 4️⃣ Call the AI Service
      const chatbotResponse = await axios.post(
        `${process.env.CHATBOT_API_URL}/api/chatbot/ask`,
        chatbotPayload
      );

      const { reply, new_summary } = chatbotResponse.data;

      // 5️⃣ Update Database (Transactionally: Store chat and Update Memory)
      const [chatRecord] = await prisma.$transaction([
        // Save the actual message and reply
        prisma.chat.create({
          data: {
            userId,
            message,
            reply,
          },
        }),
        // Upsert the new summary into ChatMemory
        prisma.chatMemory.upsert({
          where: { userId },
          update: { summary: new_summary },
          create: { userId, summary: new_summary }
        })
      ]);

      return res.status(200).json({
        success: true,
        data: chatRecord,
      });

    } catch (error: any) {
      console.error("Chat error details:", error?.response?.data || error.message);

      return res.status(500).json({
        success: false,
        error: "Failed to process chat with Saathi AI",
      });
    }
  }

}