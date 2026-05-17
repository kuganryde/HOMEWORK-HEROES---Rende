export const checkUsageLimit = (): boolean => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem('ai_usage') || '{"count": 0, "date": ""}');
  if (usage.date !== today) {
    usage.count = 0;
    usage.date = today;
  }
  return usage.count >= 3;
};

export const incrementUsage = (): void => {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem('ai_usage') || '{"count": 0, "date": ""}');
  if (usage.date !== today) {
    usage.count = 0;
    usage.date = today;
  }
  usage.count++;
  localStorage.setItem('ai_usage', JSON.stringify(usage));
};
