import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEXTBELT_URL = 'https://textbelt.com/text';

async function sendSms(phone: string, countryCode: string, message: string): Promise<boolean> {
  const apiKey = process.env.TEXTBELT_API_KEY;
  const fullNumber = countryCode === '1' ? `+1${phone}` : `+${countryCode}${phone}`;
  try {
    if (apiKey) {
      const res = await fetch(TEXTBELT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullNumber,
          message,
          key: apiKey,
        }),
      });
      return res.ok;
    }
    return true;
  } catch {
    return false;
  }
}

export class CompanionController {
  static async get(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;
      const companion = await prisma.recoveryCompanion.findUnique({
        where: { userId },
      });
      if (!companion) {
        return res.status(404).json({ success: false, error: 'No companion found' });
      }
      return res.status(200).json({
        success: true,
        data: {
          id: companion.id,
          name: companion.name,
          phone: companion.phone,
          countryCode: companion.countryCode,
          permissions: companion.permissions as string[],
          createdAt: companion.createdAt.toISOString(),
        },
      });
    } catch (err) {
      console.error('Companion get error:', err);
      return res.status(500).json({ success: false, error: 'Failed to get companion' });
    }
  }

  static async add(
    req: Request<
      { userId: string },
      {},
      { name: string; phone: string; countryCode: string; permissions: string[] }
    >,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const { name, phone, countryCode, permissions } = req.body;
      if (!name?.trim() || !phone?.trim() || !countryCode?.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Name, phone, and countryCode are required',
        });
      }
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'At least one permission is required',
        });
      }
      const existing = await prisma.recoveryCompanion.findUnique({
        where: { userId },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'User already has a companion. Remove the existing one first.',
        });
      }
      const companion = await prisma.recoveryCompanion.create({
        data: {
          userId,
          name: name.trim(),
          phone: phone.replace(/\D/g, ''),
          countryCode: countryCode.replace(/\D/g, ''),
          permissions,
        },
      });
      const message = `Saathi: ${name.trim()} has added you as their recovery companion. You'll receive updates based on the permissions they chose.`;
      await sendSms(companion.phone, companion.countryCode, message);
      return res.status(201).json({
        success: true,
        data: {
          id: companion.id,
          name: companion.name,
          phone: companion.phone,
          countryCode: companion.countryCode,
          permissions: companion.permissions as string[],
          createdAt: companion.createdAt.toISOString(),
        },
      });
    } catch (err) {
      console.error('Companion add error:', err);
      return res.status(500).json({ success: false, error: 'Failed to add companion' });
    }
  }

  static async remove(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;
      await prisma.recoveryCompanion.deleteMany({
        where: { userId },
      });
      return res.status(200).json({ success: true, data: { message: 'Companion removed' } });
    } catch (err) {
      console.error('Companion remove error:', err);
      return res.status(500).json({ success: false, error: 'Failed to remove companion' });
    }
  }
}
