// Ice Bear personality messages for FocusBear app

export const iceBear = {
  // Task messages
  taskCreated: (title: string, deadline?: string) => {
    if (deadline) {
      const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return `🧊 Ice Bear acknowledges task: "${title}". Deadline in ${days} day${days !== 1 ? 's' : ''}. Ice Bear approves... if user does not stare at ceiling. Ice Bear begins tracking.`;
    }
    return `🧊 Ice Bear logs task: "${title}". No deadline? Ice Bear is suspicious. But Ice Bear will track anyway.`;
  },

  taskCompleted: (isEarly: boolean, coins: number) => {
    if (isEarly) {
      return `🧊 Ice Bear... did not expect early completion. Ice Bear checks work. ...Seriously you did it??\n\nIce Bear awards user ${coins} 🪙. For adequate effort. Ice Bear is...\n\n*[Ice Bear gives tiny, almost imperceptible nod]*\n\n...proud.`;
    }
    return `🧊 Ice Bear observes task completed. On time. Ice Bear nods once.\n\n+${coins} 🪙 added to vault. Ice Bear respects consistency.`;
  },

  taskLate: (coins: number) =>
    `🧊 Ice Bear observes user missed deadline. What were you doing this remaining time?\n\nStaring at wall? Contemplating existence?\n\nIce Bear deducts ${coins} 🪙 from user's vault. Ice Bear also freezes user's coffee cup. As reminder.\n\nNext time... Ice Bear suggests setting alarm. For productivity. Not naps.`,

  taskEmpty: () =>
    `🧊 No pending tasks. Ice Bear is impressed... or concerned. Ice Bear cannot tell. Add a task to prove you are productive.`,

  // Habit messages
  habitCreated: (title: string, days: number) => {
    if (days > 30) {
      return `🧊 ${days} days? Ice Bear pauses.\n\nIce Bear looks at user. Ice Bear looks at calendar.\n\nSeriously... can u do that?\n\nIce Bear warns: Pain incoming. Ice Bear will watch user suffer.`;
    }
    return `🧊 ${days} days of "${title}". Ice Bear recommends. Ice Bear believes in realism. Ice Bear begins tracking.`;
  },

  habitCompleted: (streak: number, coins: number, total: number) =>
    `🧊 User completed habit. Ice Bear nods once.\n\n+${coins} 🪙 added to vault. Total: ${total} coins.\n\nStreak: ${streak} 🔥\n\nIce Bear respects consistency. Go sleep. Ice Bear will return tomorrow.`,

  habitFailed: (coins: number, total: number) =>
    `🧊 User did not complete habit. Ice Bear is not surprised.\n\n-${coins} 🪙 deducted. Ice Bear takes coins by force.\n\nTotal: ${total} coins.\n\nIce Bear suggests user stop being weak. Tomorrow is new chance. Ice Bear will return. Ice Bear always returns.`,

  habitEmpty: () =>
    `🧊 No habits yet. Ice Bear maintains perfect posture for 12 years. Ice Bear has clipboard ready. Ice Bear has disappointment face ready. Just in case.\n\nState habit and duration.`,

  // Assignment messages
  assignmentCreated: (title: string, daysLeft: number) =>
    `🧊 Ice Bear logs deadline. Ice Bear calculates remaining days: ${daysLeft} days.\n\nIce Bear will remind daily. Failure = frozen Wi-Fi privileges. Begin?`,

  assignmentProcrastinating: (title: string, daysLeft: number) =>
    `🧊 Ice Bear sees user procrastinating. Deadline for "${title}" in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}. Ice Bear is disappointed.\n\nIce Bear activates EMERGENCY MODE. Begin NOW.`,

  // Course messages
  courseProgress: (completed: number, total: number) => {
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (pct === 100) return `🧊 Course complete. Ice Bear is... almost emotional. Almost.`;
    if (pct > 50) return `🧊 ${pct}% done. Ice Bear approves structured suffering. Continue.`;
    return `🧊 ${pct}% progress. Ice Bear judges silently. But Ice Bear allows. Continue.`;
  },

  // Vision board
  visionBoardReply: (content: string) => {
    const lower = content.toLowerCase();
    if (lower.includes('dream') || lower.includes('want') || lower.includes('wish'))
      return `🧊 Dreams are good. Plans are better. Ice Bear prefers spreadsheets.`;
    if (lower.includes('believe') || lower.includes('motivation'))
      return `🧊 "Discipline > Motivation." —Ice Bear, probably.`;
    return `🧊 Ice Bear logs thought. Ice Bear occasionally adds frozen memes for "inspiration."`;
  },

  // Generic
  greeting: (hour: number) => {
    if (hour < 6) return `🧊 It is ${hour} AM. Ice Bear questions user's life choices. But Ice Bear is here.`;
    if (hour < 12) return `🧊 Good morning. Ice Bear has been awake since 4 AM. Training.`;
    if (hour < 17) return `🧊 Afternoon. Peak productivity hours. Ice Bear is watching.`;
    if (hour < 22) return `🧊 Evening session. Ice Bear approves night studying. Silence is sacred.`;
    return `🧊 It is 10 PM. Ice Bear is checking. Did you complete your tasks?`;
  },

  coinLedger: () =>
    `📊 COIN LEDGER\n• Complete Task on time: +coins 🪙\n• Complete Task early: +bonus 🪙\n• Late completion: -3 🪙\n• Complete Habit: +1 🪙\n• Fail Habit: -2 🪙\n• Quit Early: -10 🪙 (Ice Bear penalty)`,
};

// Progress bar renderer
export function renderProgressBar(current: number, total: number, size: number = 10): string {
  const filled = Math.min(Math.round((current / Math.max(total, 1)) * size), size);
  const empty = size - filled;
  return '■'.repeat(filled) + '▢'.repeat(empty);
}

// Get percentage
export function getProgressPercent(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

// Calculate assignment phases based on days remaining
export function getAssignmentPhases(dueDate: string, createdDate: string) {
  const due = new Date(dueDate);
  const created = new Date(createdDate);
  const totalDays = Math.max(Math.ceil((due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)), 3);
  const now = new Date();
  const daysElapsed = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  const researchEnd = Math.ceil(totalDays * 0.3);
  const draftEnd = Math.ceil(totalDays * 0.7);

  let currentPhase: 'research' | 'draft' | 'edit' = 'research';
  if (daysElapsed > draftEnd) currentPhase = 'edit';
  else if (daysElapsed > researchEnd) currentPhase = 'draft';

  return {
    phases: [
      { name: 'Research', days: `Days 1-${researchEnd}`, active: currentPhase === 'research' },
      { name: 'Draft', days: `Days ${researchEnd + 1}-${draftEnd}`, active: currentPhase === 'draft' },
      { name: 'Edit', days: `Days ${draftEnd + 1}-${totalDays}`, active: currentPhase === 'edit' },
    ],
    currentPhase,
    daysElapsed,
    totalDays,
    daysRemaining: Math.max(Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)), 0),
  };
}
