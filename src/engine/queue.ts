/** §1 — the Visby Queue with the Rota Rule. Stateful and serializable. */
import { INITIAL_QUEUE, type Lang } from "./languages";

export interface TieBreak<T> {
  winner: T;
  decider: Lang;
  queueBefore: Lang[];
  queueAfter: Lang[];
}

export class VisbyQueue {
  order: Lang[];

  constructor(order: Lang[] = INITIAL_QUEUE) {
    this.order = [...order];
  }

  clone(): VisbyQueue {
    return new VisbyQueue(this.order);
  }

  snapshot(): Lang[] {
    return [...this.order];
  }

  private rotate(lang: Lang) {
    this.order = this.order.filter((l) => l !== lang);
    this.order.push(lang);
  }

  /** Position of a language in the current queue (0 = front). */
  rank(lang: Lang): number {
    return this.order.indexOf(lang);
  }

  /**
   * A tie goes to the tied form supported by the language nearest the front
   * of the queue; that language then moves to the back (Rota Rule).
   */
  breakTie<T>(candidates: { form: T; supporters: Lang[] }[]): TieBreak<T> {
    const before = this.snapshot();
    for (const lang of this.order) {
      const hit = candidates.find((c) => c.supporters.includes(lang));
      if (hit) {
        this.rotate(lang);
        return { winner: hit.form, decider: lang, queueBefore: before, queueAfter: this.snapshot() };
      }
    }
    // No candidate has a supporter (should not happen) — take the first.
    return { winner: candidates[0].form, decider: this.order[0], queueBefore: before, queueAfter: this.snapshot() };
  }

  /** §3 Rule 4 — the first language in the queue that has a form at all; it moves to the back. */
  fallback(langsWithForm: Lang[]): TieBreak<Lang> | null {
    const before = this.snapshot();
    for (const lang of this.order) {
      if (langsWithForm.includes(lang)) {
        this.rotate(lang);
        return { winner: lang, decider: lang, queueBefore: before, queueAfter: this.snapshot() };
      }
    }
    return null;
  }
}
