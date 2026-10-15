import { describe, expect, it } from 'vitest';
import { makeRobotGeometry } from '@/lib/particle-geometry';

describe('Particle robot', () => {
  it('keeps deterministic identities and chamber-safe destinations', () => {
    const first=makeRobotGeometry(6000),second=makeRobotGeometry(6000);
    const position=first.geometry.getAttribute('position');
    expect(position.count).toBeGreaterThan(5900);
    expect(Array.from(position.array)).toEqual(Array.from(second.geometry.getAttribute('position').array));
    expect(first.geometry.getAttribute('aNormal').count).toBe(position.count);
    const cloud=first.geometry.getAttribute('aCloud');
    for(let i=0;i<cloud.count;i++) {
      expect(Math.hypot(cloud.getX(i),cloud.getZ(i))).toBeLessThan(1.61);
      expect(cloud.getY(i)).toBeGreaterThanOrEqual(.429);
      expect(cloud.getY(i)).toBeLessThan(4.33);
    }
    expect(first.network.getAttribute('position').count).toBeGreaterThan(0);
    expect(first.surface.getAttribute('color').count).toBe(first.surface.getAttribute('position').count);
    for(const model of [first,second])for(const geometry of Object.values(model))geometry.dispose();
  });
});
