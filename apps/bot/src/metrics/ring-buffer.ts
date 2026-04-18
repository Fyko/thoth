export class RingBuffer<T> {
	private readonly buf: (T | undefined)[];
	private head = 0;
	private count = 0;

	constructor(private readonly capacity: number) {
		if (capacity <= 0) throw new Error('capacity must be positive');
		this.buf = new Array(capacity);
	}

	push(item: T): void {
		const tail = (this.head + this.count) % this.capacity;
		this.buf[tail] = item;
		if (this.count < this.capacity) {
			this.count++;
		} else {
			this.head = (this.head + 1) % this.capacity;
		}
	}

	drain(): T[] {
		const out: T[] = new Array(this.count);
		for (let i = 0; i < this.count; i++) {
			out[i] = this.buf[(this.head + i) % this.capacity] as T;
			this.buf[(this.head + i) % this.capacity] = undefined;
		}
		this.head = 0;
		this.count = 0;
		return out;
	}

	size(): number {
		return this.count;
	}
}
