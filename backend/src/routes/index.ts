import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { DashboardController } from '../controllers/dashboardController';
import { ChatController } from "../controllers/chatController";
const router = Router();

// Health check
router.get('/health', OnboardingController.healthCheck);

// User creation
router.post('/users', OnboardingController.createUser);

// Onboarding routes
router.get('/users/:userId/onboarding', OnboardingController.getUserOnboarding);
router.put('/users/:userId/onboarding', OnboardingController.updateOnboarding);
router.post('/users/:userId/onboarding/complete', OnboardingController.completeOnboarding);

// Dashboard routes
router.get('/users/:userId/dashboard/metrics', DashboardController.getDashboardMetrics);
router.get('/users/:userId/dashboard/projections', DashboardController.getFutureProjections);
router.post('/users/:userId/dashboard/relapse', DashboardController.recordRelapse);


router.post(
  "/users/:userId/chat",
  ChatController.chatWithBot
);


export default router;
