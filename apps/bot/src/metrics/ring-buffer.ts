export class RingBuffer<Item> {
	private readonly buf: (Item | undefined)[];

	private head = 0;

	private count = 0;

	public constructor(private readonly capacity: number) {
		if (capacity <= 0) throw new Error('capacity must be positive');
		this.buf = Array.from({ length: capacity });
	}

	public push(item: Item): void {
		const tail = (this.head + this.count) % this.capacity;
		this.buf[tail] = item;
		if (this.count < this.capacity) {
			this.count++;
		} else {
			this.head = (this.head + 1) % this.capacity;
		}
	}

	public drain(): Item[] {
		const out: Item[] = Array.from({ length: this.count });
		for (let idx = 0; idx < this.count; idx++) {
			out[idx] = this.buf[(this.head + idx) % this.capacity] as Item;
			this.buf[(this.head + idx) % this.capacity] = undefined;
		}

		this.head = 0;
		this.count = 0;
		return out;
	}

	public size(): number {
		return this.count;
	}
}
