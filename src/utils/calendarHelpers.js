export const addDays = (d,n)=>{const x=new Date(d); x.setDate(x.getDate()+n); return x;};
export const addMonths = (d,n)=>{const x=new Date(d); x.setMonth(x.getMonth()+n); return x;};
export const SOD = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const startOfWeek = d=>{const x=SOD(d); const dow=x.getDay(); return addDays(x,-dow);};
export const endOfWeek = d=> addDays(startOfWeek(d),6);
export const startOfMonth= d=> new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = d=> new Date(d.getFullYear(), d.getMonth()+1, 0);
export const timeToMinutes = hhmm => { const [h,m]=(hhmm||'0:0').split(':').map(v=>parseInt(v||0,10)); return h*60+m; };
// --- UPDATED: 12-Hour Format with AM/PM ---
export const hhmm = (d) => {
  if (!d) return '';
  // Ensure d is a Date object
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';

  let h = dateObj.getHours();
  const m = dateObj.getMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12; 
  const strM = m < 10 ? '0' + m : m;

  return `${h}:${strM}${ampm}`;
};
export const overlaps = (a,b)=>{ if(!a||!b) return false; const as=+new Date(a.start), ae=+new Date(a.end), bs=+new Date(b.start), be=+new Date(b.end); return as<be && ae>bs; };
export const monthNames=["January","February","March","April","May","June","July","August","September","October","November","December"];