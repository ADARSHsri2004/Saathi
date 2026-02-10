/**
 * Quit Smoking Tips - Random tips shown to users for motivation and guidance
 */

export const QUIT_SMOKING_TIPS = [
  {
    title: "Stay Hydrated",
    message: "Drink plenty of water. It helps flush out toxins and reduces cravings.",
  },
  {
    title: "Deep Breathing",
    message: "When a craving hits, take 10 deep breaths slowly. It mimics the smoking action and calms you down.",
  },
  {
    title: "Avoid Triggers",
    message: "Identify situations that make you want to smoke and plan ways to avoid or manage them.",
  },
  {
    title: "Stay Active",
    message: "Physical activity reduces stress and distracts you from cravings. Even a short walk helps.",
  },
  {
    title: "Delay the Urge",
    message: "Tell yourself to wait 10 minutes when a craving strikes. Often, it will pass.",
  },
  {
    title: "Celebrate Small Wins",
    message: "Every hour, every day without smoking is a victory. Acknowledge your progress.",
  },
  {
    title: "Find Your Why",
    message: "Remember your reasons for quitting. Write them down and read them when you feel weak.",
  },
  {
    title: "Chew Something",
    message: "Keep gum, carrots, or nuts handy. Chewing gives your mouth something to do.",
  },
  {
    title: "Connect with Others",
    message: "Talk to someone who supports your journey. Sharing your struggle makes it easier to bear.",
  },
  {
    title: "Visualize Success",
    message: "Picture yourself as a non-smoker living a healthier, happier life. You're becoming that person.",
  },
  {
    title: "Track Your Progress",
    message: "Keep a journal of your journey. Writing helps you process emotions and stay motivated.",
  },
  {
    title: "Reward Yourself",
    message: "Use the money you save from not smoking to treat yourself to something special.",
  },
  {
    title: "Change Your Routine",
    message: "Break patterns associated with smoking. Take a different route, change your coffee spot.",
  },
  {
    title: "Get Enough Sleep",
    message: "Being tired makes cravings harder to resist. Prioritize rest and recovery.",
  },
  {
    title: "Practice Mindfulness",
    message: "Be present with your feelings. Observe the craving without acting on it. It will pass.",
  },
  {
    title: "Remove Temptations",
    message: "Get rid of cigarettes, lighters, and ashtrays. Make it harder to give in to impulses.",
  },
  {
    title: "Eat Healthy Snacks",
    message: "Keep fruits and vegetables ready. They keep your mouth busy and improve your mood.",
  },
  {
    title: "One Day at a Time",
    message: "Don't think about forever. Just focus on not smoking today. Tomorrow will take care of itself.",
  },
  {
    title: "Learn from Slips",
    message: "If you slip up, don't give up. Analyze what triggered it and try again. Every attempt teaches you something.",
  },
  {
    title: "Feel the Benefits",
    message: "Notice how your breathing improves, how food tastes better. Your body is healing every day.",
  },
  {
    title: "Use Positive Affirmations",
    message: "Tell yourself 'I am strong', 'I am in control', 'I choose health'. Words have power.",
  },
  {
    title: "Avoid Alcohol Initially",
    message: "Alcohol lowers your inhibitions and makes cravings stronger. Take a break from drinking if needed.",
  },
  {
    title: "Keep Your Hands Busy",
    message: "Hold a stress ball, doodle, or fidget with something. It reduces the urge to hold a cigarette.",
  },
  {
    title: "Remember: Cravings Are Temporary",
    message: "No matter how strong, every craving will pass in 5-10 minutes. You just need to ride it out.",
  },
  {
    title: "Be Patient with Yourself",
    message: "Quitting is hard, and that's okay. You're doing something incredibly difficult and brave.",
  },
];

/**
 * Get a random quit smoking tip
 */
export function getRandomTip() {
  return QUIT_SMOKING_TIPS[Math.floor(Math.random() * QUIT_SMOKING_TIPS.length)];
}

/**
 * Get multiple random tips (without duplicates)
 */
export function getRandomTips(count: number) {
  const shuffled = [...QUIT_SMOKING_TIPS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
