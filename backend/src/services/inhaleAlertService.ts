import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Checks if the user's average actual inhaled (cigarette/drink) is 1.5x or more than allowed for the last 7 days.
 * If so, returns an action: 'alert_companion' or 'redirect_professional'.
 *
 * - If avg actual >= 1.5 * avg allowed, returns both options in array.
 * - Otherwise, returns empty array.
 *
 * This logic can be reused in future for alerting/redirecting.
 */
export async function checkInhaleAlertOrRedirect(userId: string): Promise<Array<'alert_companion' | 'redirect_professional'>> {
  // Fetch last 7 days of inhale data (replace with real table/logic)
  // Example: dailyInhale = [{ allowed: 5, actual: 7 }, ...]
  const dailyInhale = await prisma.dailyInhale.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 7,
  });
  if (!dailyInhale.length) return [];

  const avgAllowed = dailyInhale.reduce((sum, d) => sum + d.allowed, 0) / dailyInhale.length;
  const avgActual = dailyInhale.reduce((sum, d) => sum + d.actual, 0) / dailyInhale.length;

  if (avgAllowed === 0) return [];

  if (avgActual >= 1.5 * avgAllowed) {
    // Both options: alert companion and redirect to professional
    return ['alert_companion', 'redirect_professional'];
  }
  return [];
}

/**
 * Example endpoint to use this logic (can be added to a controller or route)
 */
export async function getInhaleAlertStatus(req: Request<{ userId: string }>, res: Response) {
  try {
    const { userId } = req.params;
    const actions = await checkInhaleAlertOrRedirect(userId);
    res.status(200).json({ success: true, actions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check inhale alert/redirect' });
  }
}
