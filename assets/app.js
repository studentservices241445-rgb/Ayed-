// assets/app.js (Course)
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const DATA = window.COURSE_DATA;

  function toast(msg){
    const el=$('#toast'); if(!el) return;
    el.textContent=msg; el.classList.add('show');
    clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2800);
  }

  function initDrawer(){
    const drawer=$('#drawer'), btn=$('#menuBtn'), close=$('#drawerClose');
    if(!drawer||!btn) return;
    btn.addEventListener('click', ()=>drawer.classList.toggle('open'));
    close && close.addEventListener('click', ()=>drawer.classList.remove('open'));
    drawer.addEventListener('click',(e)=>{ if(e.target===drawer) drawer.classList.remove('open'); });
    $$('#drawer a').forEach(a=>a.addEventListener('click', ()=>drawer.classList.remove('open')));
    document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') drawer.classList.remove('open'); });
  }
  function fmtCurrency(v){ return `${v} ${DATA.pricing.currency}`; }

  // Honest per-user countdown: 7 days from first visit
  function initCountdown(){
    const box=$('#countdown'); if(!box) return;
    const days=DATA.discount?.days||7;
    const key='ayed_discount_start_v1';
    let start=Number(localStorage.getItem(key)||0);
    if(!start){ start=Date.now(); localStorage.setItem(key,String(start)); }
    const end=start + days*24*3600*1000;
    const priceNow=$('#priceNow'), old=$('#oldPrice'), note=$('#discountNote');

    function tick(){
      const ms=Math.max(0,end-Date.now());
      const s=Math.ceil(ms/1000);
      const d=Math.floor(s/86400);
      const h=Math.floor((s%86400)/3600);
      const m=Math.floor((s%3600)/60);
      box.textContent=`${d}ي ${h}س ${m}د`;
      if(ms<=0){
        if(priceNow) priceNow.textContent = fmtCurrency(DATA.pricing.oldPrice);
        if(old) old.textContent='';
        if(note) note.textContent='انتهى الخصم لهذا العرض.';
        clearInterval(box._t);
      }
    }
    tick();
    box._t=setInterval(tick, 20000);
  }

  function initPricing(){
    const priceNow=$('#priceNow'), old=$('#oldPrice'), seats=$('#seatsLeft'), seatsNote=$('#seatsNote');
    if(priceNow) priceNow.textContent=fmtCurrency(DATA.pricing.price);
    if(old) old.textContent=fmtCurrency(DATA.pricing.oldPrice);
    if(seats) seats.textContent=String(DATA.seats?.seatsLeft ?? 0);
    if(seatsNote) seatsNote.textContent = DATA.seats?.note || '';
  }

  function initCopy(){
    $$('.copy').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const val=btn.getAttribute('data-copy')||'';
        try{ await navigator.clipboard.writeText(val); toast('تم النسخ ✅'); }catch(e){ toast('انسخ يدويًا'); }
      });
    });
  }

  function openModal(id){ const m=document.getElementById(id); m && m.classList.add('open'); }
  function closeModals(){ $$('.modal').forEach(m=>m.classList.remove('open')); }
  function initModals(){
    $$('[data-modal]').forEach(a=>a.addEventListener('click',(e)=>{e.preventDefault(); openModal(a.getAttribute('data-modal'));}));
    $$('.modal').forEach(m=>{
      m.addEventListener('click',(e)=>{ if(e.target===m) closeModals(); });
      const c=m.querySelector('[data-close]'); c && c.addEventListener('click', closeModals);
    });
  }

  function initRegister(){
    const yesNo=$('#didPlan'); if(!yesNo) return;
    const wrapNo=$('#planNo'), wrapYes=$('#planYes'), goPlanner=$('#goPlanner');
    function sync(){ const v=yesNo.value; wrapNo.classList.toggle('hidden', v!=='no'); wrapYes.classList.toggle('hidden', v!=='yes'); }
    yesNo.addEventListener('change', sync); sync();

    goPlanner && goPlanner.addEventListener('click', ()=>{
      const url=DATA.links?.placementTestUrl||'#';
      if(url.includes('ضع-رابط')) toast('عدّل رابط برنامج تحديد المستوى داخل assets/site-data.js');
      else location.href=url;
    });

    const form=$('#regForm');
    const receipt=$('#receipt');
    const msgOut=$('#tgMessage');

    function buildMsg(fd){
      const plan=(fd.get('planText')||'').trim();
      return `طلب اشتراك — ${DATA.courseName}\n\n` +
        `الاسم: ${fd.get('fullName')||''}\n` +
        `التواصل: ${fd.get('contact')||''}\n` +
        `موعد الاختبار: ${fd.get('examDate')||'غير محدد'}\n` +
        `هل استخدمت برنامج تحديد المستوى؟ ${fd.get('didPlan')==='yes'?'نعم':'لا'}\n\n` +
        (plan ? `الخطة (منسوخة):\n${plan}\n\n` : '') +
        `طريقة الدفع: ${fd.get('payMethod')||''}\n\n` +
        `ملاحظة: سأرفق الإيصال داخل المحادثة للتأكيد.`;
    }

    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const fd=new FormData(form);
      if(!fd.get('fullName')){ toast('اكتب الاسم'); return; }
      if(!fd.get('payMethod')){ toast('اختر طريقة الدفع'); return; }
      if(!receipt.files || !receipt.files.length){
        toast('إرفاق الإيصال إلزامي ✅');
        document.getElementById('pay').scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      const msg=buildMsg(fd);
      msgOut.value=msg;
      const user=DATA.telegramUsername||'';
      if(!user){ toast('عدّل telegramUsername داخل assets/site-data.js'); return; }
      const url=`https://t.me/${user}?text=${encodeURIComponent(msg)}`;
      window.open(url,'_blank');
      toast('تم تجهيز الرسالة ✅ الآن أرسل الإيصال داخل تيليجرام');
    });
  }

  async function initSW(){
    if(!('serviceWorker' in navigator)) return;
    try{ await navigator.serviceWorker.register('sw.js'); }catch(e){}
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initDrawer(); initCountdown(); initPricing(); initCopy(); initModals(); initRegister(); initSW();
  });
})();