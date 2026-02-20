import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

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

  static async getPatientDashboard(req: Request<{ patientId: string }>, res: Response) {
    try {
      const { patientId } = req.params;
      // Note: allow fetching patient dashboard by patientId.
      // Previously this validated that a RecoveryCompanion record existed for the patient
      // which prevented companions from viewing a patient's progress by simply providing
      // the patient ID. To support the companion onboarding flow (paste patient ID
      // and immediately view progress) we fetch patient data directly. Ensure
      // the patient exists below and return 404 if not.

      // Get patient's onboarding and relapse data
      const patientUser = await prisma.user.findUnique({
        where: { id: patientId },
      });

      if (!patientUser) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found',
        });
      }

      const onboarding = await prisma.onboarding.findUnique({
        where: { userId: patientId },
      });

      if (!onboarding) {
        return res.status(404).json({
          success: false,
          error: 'Patient onboarding data not found',
        });
      }

      const relapses = await prisma.relapse.findMany({
        where: { userId: patientId },
        orderBy: { relapseDate: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: {
          patient: {
            id: patientUser?.id,
            displayName: patientUser?.displayName,
          },
          onboarding: {
            addictionTypes: onboarding.addictionTypes,
            intention: onboarding.intention,
            duration: onboarding.duration,
            journeyStartDate: onboarding.journeyStartDate?.toISOString(),
            completedAt: onboarding.completedAt?.toISOString(),
          },
          relapseInfo: {
            totalRelapses: relapses.length,
            lastRelapseDate: relapses[0]?.relapseDate.toISOString() || null,
            currentStreakDays: relapses.length > 0
              ? Math.floor((new Date().getTime() - relapses[0].relapseDate.getTime()) / (1000 * 60 * 60 * 24))
              : Math.floor((new Date().getTime() - (onboarding.journeyStartDate || onboarding.completedAt)!.getTime()) / (1000 * 60 * 60 * 24)),
          },
        },
      });
    } catch (err) {
      console.error('Get patient dashboard error:', err);
      return res.status(500).json({ success: false, error: 'Failed to get patient dashboard' });
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
