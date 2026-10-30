// Throwaway: a deliberate CodeQL alert (incomplete sanitization) to check that a failing CodeQL blocks the merge (F-034).
// This PR is closed without merging.
export const strip = (html) => html.replace('<script>', '').replace('<', '&lt;');
console.log(strip(process.argv[2] ?? ''));
