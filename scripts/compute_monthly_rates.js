const fs = require('fs');
const path = require('path');

function computeMonthlyAverages(filePath) {
  const rawFull = fs.readFileSync(filePath, 'utf8').trim().split(/\r?\n/);
  if (!rawFull.length) return {};
  const headerLine = rawFull.shift();
  const headers = headerLine.split(',');
  // Try multiple heuristics for date and value columns (English or Arabic header)
  const dateCandidates = ['date','time','datetime','تاريخ'];
  const valueCandidates = ['usd','lbp','rate','سعر','صرف','dollar'];
  const norm = (s) => s.replace(/"/g,'').trim().toLowerCase();
  const dIdx = headers.findIndex(h => dateCandidates.some(c => norm(h).includes(c)));
  const vIdx = headers.findIndex(h => valueCandidates.some(c => norm(h).includes(c)) && !norm(h).includes('مصرف'));
  if (dIdx === -1 || vIdx === -1) throw new Error('Could not infer columns for ' + filePath + ' headers: ' + headers.join('|'));
  const lines = rawFull;

  const monthly = {}; // { 'YYYY-MM': { sum, count } }
  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/); // naive CSV split
    if (parts.length < Math.max(dIdx,vIdx)+1) continue;
    let dateStr = parts[dIdx].replace(/"/g,'').trim();
    const valStr = parts[vIdx].replace(/"/g,'');
    const val = parseFloat(valStr);
    if (!dateStr || isNaN(val)) continue;
    // Normalize date: handle formats like 27-07-2021 or 1/2/2022
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(dateStr)) {
      const sep = dateStr.includes('/') ? '/' : '-';
      const [d,m,y] = dateStr.split(sep);
      const yyyy = y.length === 2 ? '20'+y : y;
      const mm = m.padStart(2,'0');
      dateStr = `${yyyy}-${mm}-${d.padStart(2,'0')}`;
    }
    // Already ISO? keep
    const ym = dateStr.slice(0,7);
    if (!monthly[ym]) monthly[ym] = { sum: 0, count: 0 };
    monthly[ym].sum += val;
    monthly[ym].count += 1;
  }
  const averages = {};
  for (const ym of Object.keys(monthly)) {
    averages[ym] = Math.round(monthly[ym].sum / monthly[ym].count);
  }
  return averages;
}

const marketFile = path.join(__dirname,'..','usd-to-lbp-market-rate.csv');
const sayrafaFileOptions = ['sayrafa-until-july-2022.csv','sayrafa.csv'];
let sayrafaFile = null;
for (const f of sayrafaFileOptions) {
  const p = path.join(__dirname,'..',f);
  if (fs.existsSync(p)) { sayrafaFile = p; break; }
}
if (!sayrafaFile) throw new Error('Sayrafa CSV not found');

const marketAvgs = computeMonthlyAverages(marketFile);
const sayrafaAvgs = computeMonthlyAverages(sayrafaFile);

function pick(averages, months) {
  return months.map(m => averages[m] || null);
}

const targetMonths = ['2022-02','2022-03','2022-04','2022-05','2022-06','2022-07'];
console.log('Market averages Feb-Jul 2022:', pick(marketAvgs, targetMonths));
console.log('Sayrafa averages Feb-Jul 2022:', pick(sayrafaAvgs, targetMonths));

// Also provide Jul21-Jan22 for sanity
const phase2Months = ['2021-07','2021-08','2021-09','2021-10','2021-11','2021-12','2022-01'];
console.log('Existing Phase2 Market (Jul21-Jan22):', pick(marketAvgs, phase2Months));
console.log('Existing Phase2 Sayrafa (Jul21-Jan22):', pick(sayrafaAvgs, phase2Months));
