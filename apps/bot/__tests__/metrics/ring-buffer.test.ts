import { describe, expect, test } from 'bun:test';
import { RingBuffer } from '../../src/metrics/ring-buffer.js';

describe('RingBuffer', () => {
	test('push/drain round-trips items', () => {
		const b = new RingBuffer<number>(3);
		b.push(1);
		b.push(2);
		b.push(3);
		expect(b.drain()).toEqual([1, 2, 3]);
		expect(b.drain()).toEqual([]);
	});

	test('overflow drops oldest, keeps newest', () => {
		const b = new RingBuffer<number>(3);
		b.push(1);
		b.push(2);
		b.push(3);
		b.push(4);
		expect(b.drain()).toEqual([2, 3, 4]);
	});

	test('size reports current count', () => {
		const b = new RingBuffer<number>(5);
		expect(b.size()).toBe(0);
		b.push(1);
		b.push(2);
		expect(b.size()).toBe(2);
	});
});
