# Saathi

A gentle, emotionally safe habit-awareness and recovery companion.

## Onboarding flow (current scope)

- **Screen 0 — Intro:** Welcome, app name, subtext, "Setup →"
- **Screen 1 — Basic details:** Name, age, profile photo placeholder
- **Screen 2 — Awareness & context:** Type of addiction, when it happens, how it makes you feel
- **Screen 3 — Patterns & impact:** Frequency, money spent (optional), areas of impact
- **Screen 4 — Intention & duration:** What to work on, how long, "Start my journey"
- **Complete:** Placeholder end screen

## Project structure

```
Saathi/
├── frontend/          # React Native (Expo) app
│   ├── App.tsx
│   ├── app.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── components/
│       ├── context/
│       ├── navigation/
│       ├── screens/
│       └── theme/
├── README.md
└── .gitignore
```

## Run the frontend

```bash
cd frontend
npm install
npx expo start
```

Then open in Expo Go (Android/iOS) or use a simulator. No backend; state is mocked in memory.