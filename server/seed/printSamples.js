// Quick CLI helper: prints the sample notice texts to the console so you can
// copy-paste them into the app for an instant demo — no DB connection needed.
const { generalNotice, lostAndFoundNotice } = require('./sampleNotices');

console.log('\n========== SAMPLE 1: GENERAL NOTICE ==========\n');
console.log(generalNotice);
console.log('\n========== SAMPLE 2: LOST & FOUND NOTICE ==========\n');
console.log(lostAndFoundNotice);
console.log('\nCopy either block above and paste it into the Home page textarea.\n');
