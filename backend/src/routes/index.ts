import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';

const router = Router();

// Health check
router.get('/health', OnboardingController.healthCheck);

// User creation
router.post('/users', OnboardingController.createUser);

// Onboarding routes
router.get('/users/:userId/onboarding', OnboardingController.getUserOnboarding);
router.put('/users/:userId/onboarding', OnboardingController.updateOnboarding);
router.post('/users/:userId/onboarding/complete', OnboardingController.completeOnboarding);

export default router;
