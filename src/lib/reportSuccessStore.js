// Global store for the report-success confirmation dialog.
// ReportPage sets it visible on successful submit (then navigates back);
// AppLayout renders the dialog and consumes (hides) it on close.
let visible = false;
const listeners = new Set();

export function showReportSuccess() {
  visible = true;
  listeners.forEach((fn) => fn(visible));
}

export function hideReportSuccess() {
  visible = false;
  listeners.forEach((fn) => fn(visible));
}

export function subscribeReportSuccess(fn) {
  listeners.add(fn);
  fn(visible);
  return () => listeners.delete(fn);
}