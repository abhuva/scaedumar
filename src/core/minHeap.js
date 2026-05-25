export class MinHeap {
  constructor() {
    this.items = [];
  }

  push(node) {
    this.items.push(node);
    let i = this.items.length - 1;
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.items[p].dist <= node.dist) break;
      this.items[i] = this.items[p];
      i = p;
    }
    this.items[i] = node;
  }

  pop() {
    if (this.items.length === 0) return null;
    const root = this.items[0];
    const last = this.items.pop();
    if (this.items.length === 0 || !last) return root;
    let i = 0;
    while (true) {
      const l = i * 2 + 1;
      const r = l + 1;
      if (l >= this.items.length) break;
      let c = l;
      if (r < this.items.length && this.items[r].dist < this.items[l].dist) c = r;
      if (this.items[c].dist >= last.dist) break;
      this.items[i] = this.items[c];
      i = c;
    }
    this.items[i] = last;
    return root;
  }
}
