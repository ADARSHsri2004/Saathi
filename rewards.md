# Rewards Workflow – Backend Sync Spec

## Types (from `types.ts`)

### BadgeCategory
- `'consistency' | 'resilience' | 'self-control' | 'growth'`

### Badge
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique badge id |
| category | BadgeCategory | consistency, resilience, self-control, growth |
| title | string | Display title |
| description | string | Short description |
| icon | string | MaterialCommunityIcons name (e.g. calendar-check, shield-check, hand-okay, trending-up) |
| unlocked | boolean | Whether user has earned it |
| progress | number | 0–1, progress toward unlock |
| unlockCondition | string | Human-readable condition text |
| motivationalLine | string | Shown in badge detail sheet |

### Reward
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique reward id |
| title | string | Display title |
| description | string | Short description |
| icon | string | MaterialCommunityIcons name (e.g. moon, leaf, account-star) |
| unlocked | boolean | Whether user has unlocked it |
| cost | number | XP cost to unlock (displayed as "X XP") |

---

## Screen: RewardsScreen

### Data the screen needs (currently mock)

| Variable | Type | Source (backend) | Used by |
|----------|------|-------------------|---------|
| streak | number | User streak (consecutive days) | HeroSection |
| level | number | User level | HeroSection, LevelProgressBar |
| xp | number | Current XP in current level | HeroSection, LevelProgressBar |
| xpToNextLevel | number | XP required to reach next level | HeroSection, LevelProgressBar |
| identityTitle | string | User identity/title (e.g. "Warrior") | HeroSection |
| amount | number | Money saved (currency amount) | MoneySavedCard |
| goal | number | Savings goal amount | MoneySavedCard |
| goalReward | string | Name of reward at goal (e.g. "New Headphones") | MoneySavedCard |
| badges | Badge[] | All badges; filtered by category per section | BadgeSection x4 |
| rewards | Reward[] | Unlockable rewards list | RewardCarousel |
| improvementPercent | number | Weekly growth % (e.g. 23) | WeeklyGrowthCard |
| message | string | Weekly growth message | WeeklyGrowthCard |

### Local UI state (no backend)

| Variable | Type | Purpose |
|----------|------|---------|
| scrollY | SharedValue<number> | Scroll offset for parallax/opacity |
| selectedBadge | Badge \| null | Badge open in bottom sheet |
| badgeSheetVisible | boolean | Badge detail sheet visibility |

### User actions

| Action | Handler | Effect |
|--------|---------|--------|
| Tap badge | handleBadgePress(badge) | Set selectedBadge, open BadgeDetailBottomSheet |
| Close sheet | handleCloseBadgeSheet | Hide sheet, clear selectedBadge after 300ms |

---

## Component props (backend must provide data for these)

### HeroSection
| Prop | Type | Required |
|------|------|----------|
| streak | number | yes |
| level | number | yes |
| xp | number | yes |
| xpToNextLevel | number | yes |
| identityTitle | string | yes |

### LevelProgressBar
| Prop | Type | Required |
|------|------|----------|
| level | number | yes |
| xp | number | yes |
| xpToNextLevel | number | yes |
| scrollY | SharedValue<number> | yes (UI) |

Derived in UI: `progress = xp / xpToNextLevel`, "X XP to Level {level + 1}".

### MoneySavedCard
| Prop | Type | Required |
|------|------|----------|
| amount | number | yes |
| goal | number | yes |
| goalReward | string | yes |
| scrollY | SharedValue<number> | yes (UI) |

Derived in UI: goal progress % = (amount / goal) * 100. Backend: amount saved, goal amount, label for goal reward.

### BadgeSection
| Prop | Type | Required |
|------|------|----------|
| title | string | yes (section title: Consistency, Resilience, Self-Control, Growth) |
| badges | Badge[] | yes |
| onBadgePress | (badge: Badge) => void | yes (UI) |
| scrollY | SharedValue<number> | yes (UI) |

Screen filters badges by `badge.category` per section. Category → title: consistency → "Consistency", resilience → "Resilience", self-control → "Self-Control", growth → "Growth".

### BadgeCard (used inside BadgeSection)
| Prop | Type |
|------|------|
| badge | Badge |
| onPress | () => void |

### BadgeDetailBottomSheet
| Prop | Type | Required |
|------|------|----------|
| visible | boolean | yes |
| badge | Badge \| null | yes |
| onClose | () => void | yes |

Displays: badge.title, badge.description, badge.icon, badge.unlockCondition, badge.motivationalLine, and if !badge.unlocked: badge.progress (as % and progress bar).

### RewardCarousel
| Prop | Type | Required |
|------|------|----------|
| rewards | Reward[] | yes |
| scrollY | SharedValue<number> | yes (UI) |

Each reward shows: title, description, icon, cost (as "X XP"), unlocked (lock overlay if false).

### WeeklyGrowthCard
| Prop | Type | Required |
|------|------|----------|
| improvementPercent | number | yes |
| message | string | yes |
| scrollY | SharedValue<number> | yes (UI) |

Chart is decorative (last 4 weeks bars); backend only needs improvementPercent and message.

---

## Badge category → icon (frontend mapping)

Used in BadgeSection header icon only; badge.icon is per-badge from backend.

| title (category) | getCategoryIcon result |
|------------------|------------------------|
| consistency | calendar-check |
| resilience | shield-check |
| self-control | hand-okay |
| growth | trending-up |
| default | medal |

Badge icons are free-form MaterialCommunityIcons names from backend (e.g. calendar-check, shield-check, hand-okay, trending-up).

---

## Suggested backend API shape

### GET rewards (or user rewards summary)

Return one payload or separate endpoints that together provide:

```json
{
  "streak": 42,
  "level": 5,
  "xp": 1250,
  "xpToNextLevel": 1500,
  "identityTitle": "Warrior",
  "moneySaved": {
    "amount": 8500,
    "goal": 10000,
    "goalReward": "New Headphones"
  },
  "badges": [
    {
      "id": "consistency-7",
      "category": "consistency",
      "title": "Week Warrior",
      "description": "7 days of consistent progress",
      "icon": "calendar-check",
      "unlocked": true,
      "progress": 1,
      "unlockCondition": "Complete 7 consecutive days",
      "motivationalLine": "Consistency is your superpower"
    }
  ],
  "rewards": [
    {
      "id": "theme-dark",
      "title": "Dark Theme",
      "description": "Unlock premium dark mode",
      "icon": "moon",
      "unlocked": true,
      "cost": 500
    }
  ],
  "weeklyGrowth": {
    "improvementPercent": 23,
    "message": "You're building stronger habits each week"
  }
}
```

### Field constraints

- **Badge.progress**: 0–1 (0 = 0%, 1 = 100%).
- **Badge.category**: exactly one of consistency, resilience, self-control, growth.
- **Reward.cost**: integer (XP); displayed as "X XP".
- **xp**, **xpToNextLevel**, **level**: level is integer; progress in level is xp / xpToNextLevel.
- **identityTitle**: string; can be level-based or user-chosen.
- **streak**: non-negative integer (consecutive days).

---

## Summary: variables backend must provide

| Name | Type | Notes |
|------|------|-------|
| streak | number | Consecutive days |
| level | number | Current level |
| xp | number | XP in current level |
| xpToNextLevel | number | XP needed for next level |
| identityTitle | string | e.g. "Warrior" |
| amount | number | Money saved |
| goal | number | Savings goal amount |
| goalReward | string | Label for goal reward |
| badges | Badge[] | All badges with full Badge shape |
| rewards | Reward[] | All rewards with full Reward shape |
| improvementPercent | number | Weekly growth % |
| message | string | Weekly growth message |

All other variables (scrollY, selectedBadge, badgeSheetVisible, onBadgePress, onClose) are frontend-only.
