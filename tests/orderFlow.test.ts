import { describe, it, expect } from 'vitest';
import { canTransition, isValidStatus } from '../lib/orderFlow';

describe('orderFlow', () => {
  it('valid statuses', () => {
    expect(isValidStatus('CREATED')).toBe(true);
    expect(isValidStatus('DELIVERED')).toBe(true);
    expect(isValidStatus('UNKNOWN')).toBe(false);
  });

  it('allows valid transitions', () => {
    expect(canTransition('CREATED', 'ASSIGNED')).toBe(true);
    expect(canTransition('ASSIGNED', 'PICKED_UP')).toBe(true);
    expect(canTransition('PICKED_UP', 'DELIVERED')).toBe(false);
  });

  it('rejects invalid transitions', () => {
    expect(canTransition('DELIVERED', 'IN_TRANSIT')).toBe(false);
    expect(canTransition('CREATED', 'DELIVERED')).toBe(false);
  });
});
