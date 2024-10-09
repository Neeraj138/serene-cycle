export const calculateCyclePhaseForToday = (
  lastPeriodDate,
  avgCycleLength,
  bleedingDays,
  date
) => {
  const lastPeriod = new Date(lastPeriodDate);
  const daysSinceLastPeriod = Math.floor(
    (date - lastPeriod) / (1000 * 60 * 60 * 24)
  );

  // Calculate the remaining days in the cycle
  const lutealPhaseLength = 14; // Constant
  const follicularPhaseLength =
    avgCycleLength - bleedingDays - lutealPhaseLength;

  if (daysSinceLastPeriod < bleedingDays) {
    return "Menstrual Phase"; // Still bleeding
  } else if (daysSinceLastPeriod < bleedingDays + follicularPhaseLength) {
    return "Follicular Phase"; // After bleeding until ovulation
  } else if (daysSinceLastPeriod < bleedingDays + follicularPhaseLength + 1) {
    return "Ovulation Phase"; // Ovulation day
  } else {
    return "Luteal Phase"; // Post-ovulation until next menstruation
  }
};

export const isFertileOnDate = (
  lastPeriodDate,
  avgCycleLength,
  bleedingDays,
  dateToCheck
) => {
  const date = new Date(dateToCheck); // The date we want to check
  const lastPeriod = new Date(lastPeriodDate); // The last period date
  const daysSinceLastPeriod = Math.floor(
    (date - lastPeriod) / (1000 * 60 * 60 * 24)
  );

  // Calculate the cycle phases
  const lutealPhaseLength = 14; // Constant luteal phase
  const follicularPhaseLength =
    avgCycleLength - bleedingDays - lutealPhaseLength;

  // Calculate ovulation day and fertile window
  const ovulationDay = bleedingDays + follicularPhaseLength;
  const fertileWindowStart = ovulationDay - 5; // 5 days before ovulation
  const fertileWindowEnd = ovulationDay + 1; // Fertility is highest up to and on ovulation day

  // Check if the date falls within the fertile window
  if (
    daysSinceLastPeriod >= fertileWindowStart &&
    daysSinceLastPeriod <= fertileWindowEnd
  ) {
    return true; // The user is likely fertile
  } else {
    return false; // The user is not in the fertile window
  }
};

export const getExpectedNextPeriod = (lastPeriodDate, avgCycleLength) => {
  let nextPeriod = new Date(lastPeriodDate)
  nextPeriod.setDate(nextPeriod.getDate() + avgCycleLength)
  return nextPeriod
}