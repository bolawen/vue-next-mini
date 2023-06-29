export interface SchedulerJob extends Function {
  id?: number;
  pre?: boolean;
  active?: boolean;
  computed?: boolean;
  allowRecurse?: boolean;
}
export type SchedulerJobs = SchedulerJob | SchedulerJob[];

let flushIndex = 0;
let postFlushIndex = 0;
let isFlushPending = false;
const queue: SchedulerJob[] = [];
const pendingPostFlushCbs: SchedulerJob[] = [];
let currentFlushPromise: Promise<any> | null = null;
let activePostFlushCbs: SchedulerJob[] | null = null;
const resolvePromise = Promise.resolve() as Promise<any>;

export function flushPostFlushCbs() {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)];
    pendingPostFlushCbs.length = 0;

    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }

    activePostFlushCbs = [...deduped];

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      activePostFlushCbs[postFlushIndex]();
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}

export function flushJobs() {
  isFlushPending = false;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      job();
    }
  } finally {
    flushIndex = 0;
    queue.length = 0;
    flushPostFlushCbs();
  }
}

export function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true;
    currentFlushPromise = resolvePromise.then(flushJobs);
  }
}

export function queuePostFlushCb(cb: SchedulerJob) {
  if (Array.isArray(cb)) {
  } else {
    pendingPostFlushCbs.push(cb);
  }
  queueFlush();
}

export function queueJob(job: SchedulerJob) {
  queue.push(job);
  queueFlush();
}
