import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';
import { DashboardController } from '../controllers/dashboardController';
import { ChatController } from "../controllers/chatController";
import { RewardsController } from '../controllers/rewardsController';
import { CompanionController } from '../controllers/companionController';
import { PlanController } from '../controllers/planController';
import { LocationShieldController } from '../controllers/locationShieldController';
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


router.get("/users/:userId/chat/history", ChatController.getChatHistory);
router.get("/users/:userId/assistant/context", ChatController.getAssistantContext);
router.post(
  "/users/:userId/chat",
  ChatController.chatWithBot
);

router.get('/users/:userId/rewards', RewardsController.getRewards);

router.get('/users/:userId/companion', CompanionController.get);
router.post('/users/:userId/companion', CompanionController.add);
router.delete('/users/:userId/companion', CompanionController.remove);
router.get('/companion/patient/:patientId/dashboard', CompanionController.getPatientDashboard);

// Recovery Plan routes
router.post('/users/:userId/plan/generate', PlanController.generatePlan);
router.get('/users/:userId/plan', PlanController.getPlan);
router.post('/users/:userId/plan/update', PlanController.updatePlan);
router.post('/users/:userId/plan/advance-day', PlanController.advanceDay);

// Location Shield routes
router.get('/users/:userId/location-shield/zones', LocationShieldController.getZones);
router.put('/users/:userId/location-shield/zones', LocationShieldController.saveZones);

export default router;
