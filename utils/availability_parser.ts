export function parseSlotToISO(slot: string): string {
    const [dayStr, timeStr] = slot.split('_');
    const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    const targetWeekday = weekdayMap[dayStr];
    if (targetWeekday === undefined) {
        throw new Error(`Invalid day: ${dayStr}`);
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayWeekday = today.getDay();
    const daysAhead = (targetWeekday - todayWeekday + 7) % 7;

    const [time, meridian] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysAhead);
    targetDate.setHours(hour, minute, 0, 0);

    return targetDate.toISOString();
}
