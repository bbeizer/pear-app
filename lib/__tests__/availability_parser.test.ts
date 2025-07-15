import { parseSlotToISO } from '../../utils/availability_parser';

describe('availability_parser', () => {
  describe('parseSlotToISO', () => {
    it('should parse a valid slot correctly', () => {
      const result = parseSlotToISO('Mon_2:30 PM');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle AM times correctly', () => {
      const result = parseSlotToISO('Tue_9:00 AM');
      const date = new Date(result);
      expect(date.getHours()).toBe(9);
    });

    it('should handle PM times correctly', () => {
      const result = parseSlotToISO('Wed_3:30 PM');
      const date = new Date(result);
      expect(date.getHours()).toBe(15); // 3 PM = 15:30
    });

    it('should handle 12 PM correctly', () => {
      const result = parseSlotToISO('Thu_12:00 PM');
      const date = new Date(result);
      expect(date.getHours()).toBe(12);
    });

    it('should handle 12 AM correctly', () => {
      const result = parseSlotToISO('Fri_12:00 AM');
      const date = new Date(result);
      expect(date.getHours()).toBe(0);
    });

    it('should throw error for invalid day', () => {
      expect(() => parseSlotToISO('Invalid_2:30 PM')).toThrow('Invalid day: Invalid');
    });

    it('should handle all days of the week', () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach(day => {
        const result = parseSlotToISO(`${day}_2:30 PM`);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      });
    });
  });
}); 