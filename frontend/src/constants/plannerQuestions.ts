export const FTND_QUESTIONS: { question: string; options: { value: number; label: string }[] }[] = [
  {
    question: 'How soon after you wake up do you use?',
    options: [
      { value: 0, label: 'After 60 minutes' },
      { value: 1, label: '31–60 minutes' },
      { value: 2, label: '6–30 minutes' },
      { value: 3, label: 'Within 5 minutes' },
    ],
  },
  {
    question: 'Do you find it difficult to avoid in places where it\'s not allowed?',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' },
    ],
  },
  {
    question: 'Which would you hate to give up most?',
    options: [
      { value: 0, label: 'The first one in the morning' },
      { value: 1, label: 'Any other one' },
    ],
  },
  {
    question: 'How many do you use per day?',
    options: [
      { value: 0, label: '10 or fewer' },
      { value: 1, label: '11–20' },
      { value: 2, label: '21–30' },
      { value: 3, label: '31 or more' },
    ],
  },
  {
    question: 'Do you use more in the morning than the rest of the day?',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' },
    ],
  },
  {
    question: 'Do you use even when you\'re sick in bed?',
    options: [
      { value: 0, label: 'No' },
      { value: 1, label: 'Yes' },
    ],
  },
  {
    question: 'How would you describe your dependence?',
    options: [
      { value: 0, label: 'I don\'t feel dependent' },
      { value: 1, label: 'Mild' },
      { value: 2, label: 'Moderate' },
      { value: 3, label: 'Strong' },
    ],
  },
];
