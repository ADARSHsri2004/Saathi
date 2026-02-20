import { Request, Response } from 'express';
import { RiskZone } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface RiskZoneBody {
  id?: string;
  latitude: number;
  longitude: number;
  radius: number;
  name: string;
}

export class LocationShieldController {
  static async getZones(req: Request<{ userId: string }>, res: Response) {
    try {
      const { userId } = req.params;
      const zones = await prisma.riskZone.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json({
        success: true,
        data: zones.map((z: RiskZone) => ({
          id: z.id,
          latitude: z.latitude,
          longitude: z.longitude,
          radius: z.radius,
          name: z.name,
        })),
      });
    } catch (err) {
      console.error('LocationShield getZones error:', err);
      return res.status(500).json({ success: false, error: 'Failed to get risk zones' });
    }
  }

  static async saveZones(
    req: Request<{ userId: string }, {}, { zones: RiskZoneBody[] }>,
    res: Response
  ) {
    try {
      const { userId } = req.params;
      const { zones } = req.body;
      if (!Array.isArray(zones)) {
        return res.status(400).json({ success: false, error: 'zones must be an array' });
      }
      await prisma.riskZone.deleteMany({ where: { userId } });
      if (zones.length > 0) {
        await prisma.riskZone.createMany({
          data: zones.map((z: RiskZoneBody) => ({
            userId,
            latitude: z.latitude,
            longitude: z.longitude,
            radius: z.radius,
            name: z.name || 'Risk Zone',
          })),
        });
      }
      const updated = await prisma.riskZone.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
      return res.status(200).json({
        success: true,
        data: updated.map((z: RiskZone) => ({
          id: z.id,
          latitude: z.latitude,
          longitude: z.longitude,
          radius: z.radius,
          name: z.name,
        })),
      });
    } catch (err) {
      console.error('LocationShield saveZones error:', err);
      return res.status(500).json({ success: false, error: 'Failed to save risk zones' });
    }
  }
}
