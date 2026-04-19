import { describe, expect, test } from 'bun:test';
import { EventSchemas, validateEvent } from '../../src/metrics/events.js';

describe('EventSchemas', () => {
	test('command.invoked accepts valid payload', () => {
		const result = validateEvent('command.invoked', { command: 'define', success: true, durationMs: 42 });
		expect(result.success).toBe(true);
	});

	test('command.invoked rejects missing field', () => {
		const result = validateEvent('command.invoked', { command: 'define', success: true });
		expect(result.success).toBe(false);
	});

	test('guild.left accepts empty object', () => {
		const result = validateEvent('guild.left', {});
		expect(result.success).toBe(true);
	});

	test('unknown event name returns failure', () => {
		// @ts-expect-error — intentional bad name
		const result = validateEvent('does.not.exist', {});
		expect(result.success).toBe(false);
	});

	test('entitlement.checked enforces site enum', () => {
		const ok = validateEvent('entitlement.checked', { kind: 'premium', granted: true, site: 'wotd_setup' });
		const bad = validateEvent('entitlement.checked', { kind: 'premium', granted: true, site: 'not_a_site' });
		expect(ok.success).toBe(true);
		expect(bad.success).toBe(false);
	});

	test('EventSchemas contains all 11 catalog entries', () => {
		expect(Object.keys(EventSchemas).sort()).toEqual([
			'button.clicked',
			'command.invoked',
			'entitlement.checked',
			'entitlement.granted',
			'entitlement.revoked',
			'feedback.submitted',
			'guild.joined',
			'guild.left',
			'modal.submitted',
			'wotd.delivered',
			'wotd.quiz_attempted',
		]);
	});
});
