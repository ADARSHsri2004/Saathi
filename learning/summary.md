# Project Summary for React Native Interview

Saathi is a mobile health and recovery app built for users dealing with addiction recovery, with a companion-based support model. The app helps users complete onboarding, track recovery progress, access AI-generated plans, monitor risky behaviors, and stay connected with a companion or support system.

### What I built
- Onboarding flow for patient and companion roles
- Personalized recovery dashboard with progress and metrics
- AI-powered recovery plan generation and updates
- Rewards and motivation features
- Companion support features and shared patient tracking
- Location Shield feature to define risky places and trigger alerts when a user gets close
- Local persistence for user state and onboarding flow

### Tech stack
- React Native with Expo
- TypeScript
- React Navigation
- AsyncStorage for local persistence
- expo-location and expo-notifications for geo-aware safety alerts
- Backend: Node.js, Express, Prisma, PostgreSQL
- REST API integration using central API service layer

### React Native-specific strengths
- Built modular screens, services, and context providers for maintainable app structure
- Navigation things
- Managed app state with React Context for onboarding and user session data
- Implemented permission handling for location access and runtime notifications
- Added native map rendering with a fallback map strategy for Android
- Created background monitoring logic to detect proximity to risk zones
- Centralized API logic to keep networking clean and reusable
- Designed user flows for onboarding, hydration, and persistence across app restarts

### Why this project is strong for discussion
This project shows that I can work across:
- UI and business logic
- Navigation and activity, thread state passing to differnet component
- device permissions and native integrations
- API integration and backend collaboration
- state management and persistence
- user-centered product thinking with real-world safety features

### Short interview answer
“I built Saathi as a recovery-focused mobile app in React Native, combining onboarding, personalized tracking dashboard, AI recovery planning and assistant, and a safety feature that monitors risky locations using device GPS. The app uses context-based state management, local storage, and a backend API layer for data sync. A key challenge was integrating location permissions, background monitoring, and map-based user interactions while keeping the app reliable and user-friendly. This project demonstrates my ability to build practical, production-style React Native features with real-world device integration.”

### Quick talking points to mention
- “I handled native device features like location and notifications.”
- “I structured the app with reusable services and context.”
- “I worked with both frontend and backend data flows.”
- “I solved real-world UX challenges like onboarding persistence and permission gating.”
- “I implemented a complete user journey from onboarding to monitoring, tracking and assistant support.”


Saathi was a collaborative hackathon project, and we worked together across the frontend and backend rather than having completely isolated responsibilities. My primary involvement was on the React Native side. I worked on the application flow, navigation, Context-based state management, AsyncStorage persistence, API integration, and device-related features such as location and notifications. I also worked with the team while integrating and debugging different parts of the application.

One of the interesting parts was the Location Shield feature, where we used device location to identify when a user was approaching a configured risky area and then integrated that with the notification flow. The project gave me experience working with React Native beyond just UI development — particularly state management, persistence, permissions, native capabilities, and frontend-backend integration.

### Architecture

We separated the React Native application into screens, reusable components, navigation, context providers and service layers.
Screens were responsible primarily for composing the UI, while reusable components handled common UI elements. We used context providers for state that needed to be shared across multiple screens, such as onboarding or authentication-related information. API communication was separated into service functions instead of putting all networking logic directly into screens. This made the application easier to maintain and allowed us to keep the UI layer separate from backend communication.

For background location, the important distinction is that location tracking cannot depend on a screen remaining mounted. The operating system needs to provide background execution and location updates, and React Native/Expo can expose those native capabilities to JavaScript. The implementation also needs to account for permissions, battery consumption, lifecycle and Android's background execution restrictions

Background location requires appropriate runtime permissions and platform-specific configuration. The application should request only the minimum permission necessary and clearly explain to the user why location is required.
