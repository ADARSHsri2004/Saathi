
This project is organized around a root navigator that switches between onboarding and the main app flow.

```mermaid
flowchart TD
    A[Root Navigator] --> B{Onboarding complete?}

    B -- No --> C[OnboardingStack]
    B -- Yes --> D[MainStack]

    C --> C1[Intro]
    C1 --> C2[BasicDetails]
    C2 --> C3[AwarenessContext]
    C3 --> C4[PatternsImpact]
    C4 --> C5[Complete]

    D --> D1[HomeDashboard]
    D --> D2[CompanionDashboard]
    D --> D3[Games]
    D --> D4[Rewards]
    D --> D5[Profile]
    D --> D6[Settings]
    D --> D7[Assistant]
    D --> D8[Companion]
    D --> D9[AddCompanion]
    D --> D10[LocationShieldStack]
    D --> D11[FocusRecallGame]
    D --> D12[PlannerStack]
    D --> D13[DoctorInfo]
    D --> D14[Profession]

    D10 --> L1[Intro]
    L1 --> L2[Permission]
    L2 --> L3[RiskZones]
    L3 --> L4[AllSet]

    D12 --> P1[PlannerEntry]
    P1 --> P2[Assessment]
    P2 --> P3[LifestyleTriggers]
    P3 --> P4[AIProcessing]
    P4 --> P5[PlannerReveal]
```

### Navigation logic
- Root navigator decides whether user sees onboarding or app home.
- Main stack starts at:
  - CompanionDashboard if user role is companion
  - HomeDashboard otherwise
- Several feature flows are separated as nested stacks:
  - LocationShieldStack
  - PlannerStack
  - OnboardingStack

### Architectural interpretation
- App shell: root navigation
- Feature domains:
  - onboarding
  - dashboard/home
  - companion management
  - games and rewards
  - profile/settings
  - safety/location shield
  - recovery planning
  - doctor/profession info

If you want, I can also provide the same structure in a more detailed “module-wise architecture tree” including backend API and frontend folders.






## file structure


src/
│
├── screens/       → complete pages
├── components/    → reusable UI
├── navigation/    → screen navigation
├── context/       → shared state
├── hooks/         → reusable React logic
├── services/      → API/backend communication
├── utils/         → generic helper functions
│
└── App.tsx