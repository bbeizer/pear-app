import { useAvailabilityGrid, days, hours } from '../useAvailabilityGrid';

describe('useAvailabilityGrid', () => {
  describe('exports', () => {
    it('should export days array with correct values', () => {
      expect(days).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    });

    it('should export hours array with correct format', () => {
      expect(hours).toHaveLength(24);
      expect(hours[0]).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
      expect(hours[23]).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should export useAvailabilityGrid function', () => {
      expect(typeof useAvailabilityGrid).toBe('function');
    });
  });

  describe('hours generation', () => {
    it('should generate hours from 8:00 AM to 7:30 PM', () => {
      const firstHour = hours[0];
      const lastHour = hours[23];
      
      // First hour should be 8:00 AM
      expect(firstHour).toBe('8:00 AM');
      
      // Last hour should be 7:30 PM
      expect(lastHour).toBe('7:30 PM');
    });

    it('should have 30-minute intervals', () => {
      expect(hours[0]).toBe('8:00 AM');
      expect(hours[1]).toBe('8:30 AM');
      expect(hours[2]).toBe('9:00 AM');
    });
  });
}); 