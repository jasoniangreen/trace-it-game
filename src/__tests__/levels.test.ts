import { describe, it, expect } from 'vitest'
import { levels } from '../data/levels'
import { verifySolution } from '../logic/validation'

describe('level data', () => {
  for (const level of levels) {
    describe(level.name, () => {
      it('has matching rows*cols total cells in solution', () => {
        expect(level.solution.length).toBe(level.rows * level.cols)
      })

      it('has all numbered cells within grid bounds', () => {
        for (const key of Object.keys(level.numbers)) {
          const [r, c] = key.split(',').map(Number)
          expect(r).toBeGreaterThanOrEqual(0)
          expect(r).toBeLessThan(level.rows)
          expect(c).toBeGreaterThanOrEqual(0)
          expect(c).toBeLessThan(level.cols)
        }
      })

      it('has all wall cells within grid bounds', () => {
        for (const [a, b] of level.walls) {
          expect(a[0]).toBeGreaterThanOrEqual(0)
          expect(a[0]).toBeLessThan(level.rows)
          expect(a[1]).toBeGreaterThanOrEqual(0)
          expect(a[1]).toBeLessThan(level.cols)
          expect(b[0]).toBeGreaterThanOrEqual(0)
          expect(b[0]).toBeLessThan(level.rows)
          expect(b[1]).toBeGreaterThanOrEqual(0)
          expect(b[1]).toBeLessThan(level.cols)
        }
      })

      it('has sequential numbers starting from 1', () => {
        const nums = Object.values(level.numbers).sort((a, b) => a - b)
        expect(nums[0]).toBe(1)
        nums.forEach((n, i) => expect(n).toBe(i + 1))
      })

      it('has a valid solution', () => {
        expect(verifySolution(level, level.solution)).toBe(true)
      })
    })
  }
})
