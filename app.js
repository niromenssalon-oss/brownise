(function(){
  const C = window.NIRO_CONFIG;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

  const money = n => `${Number(n).toLocaleString()} QR`;
  const escapeHtml = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  function initials(name){ return name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase(); }
  function storageGet(){ try{return JSON.parse(localStorage.getItem(C.booking.storageKey)||'[]')}catch{return []} }
  function storageSet(v){ localStorage.setItem(C.booking.storageKey, JSON.stringify(v)); }
  function toast(msg){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2800); }
  function nav(){
    const page = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(a=>{ if(a.getAttribute('href')===page || (page===''&&a.getAttribute('href')==='index.html')) a.classList.add('active'); });
  }
  function applyGlobal(){
    $$('[data-salon-name]').forEach(el=>el.textContent=C.salon.name);
    $$('[data-location]').forEach(el=>el.textContent=C.salon.location);
    $$('[data-whatsapp]').forEach(el=>el.textContent=C.salon.whatsapp);
    $$('[data-opening]').forEach(el=>el.textContent=C.salon.openingLabel);
    $$('[data-wa-link]').forEach(el=>{el.href='https://wa.me/'+C.salon.whatsapp.replace(/\D/g,'');});
    $$('[data-instagram]').forEach(el=>{el.href=C.salon.instagram;});
    $$('[data-maps]').forEach(el=>{el.href=C.salon.maps;});
  }

  function serviceCard(s){
    return `<article class="card service-card"><div><span class="tag">${escapeHtml(s.category)}</span><div class="service-top"><h3>${escapeHtml(s.name)}</h3><div class="price">${money(s.price)}${s.price>=150?' <small style="font-size:11px">UP</small>':''}</div></div><p>${escapeHtml(s.note)}</p></div><div class="summary-row"><span>${s.duration} min</span><a class="btn small ghost" href="booking.html?service=${encodeURIComponent(s.id)}">Book this</a></div></article>`;
  }

  function populateServices(){
    const wrap=$('#serviceGrid'); if(!wrap)return;
    wrap.innerHTML=C.services.map(serviceCard).join('');
  }
  function populateBarbers(){
    const wrap=$('#barberGrid'); if(!wrap)return;
    wrap.innerHTML=C.barbers.map(b=>`<article class="card barber"><div class="avatar" style="box-shadow:inset 0 0 0 1px ${b.accent}55">${initials(b.name)}</div><h3>${escapeHtml(b.name)}</h3><div class="muted">${escapeHtml(b.nationality)}</div><div class="badge">Shift ${b.shiftStart} → ${b.shiftEnd}</div></article>`).join('');
  }

  function dateKey(d){ return d.toISOString().slice(0,10); }
  function parseTime(t){ const [h,m]=t.split(':').map(Number); return h*60+m; }
  function fmtTime(m){ const h=Math.floor((m%1440)/60), min=m%60, ap=h>=12?'PM':'AM', hh=(h%12)||12; return `${hh}:${String(min).padStart(2,'0')} ${ap}`; }
  function inShift(start,end,t){
    if(start===end)return true;
    return start < end ? (t>=start && t<end) : (t>=start || t<end);
  }
  function slotAvailable(barber, dateStr, startMin, duration, allBookings){
    const startDate = new Date(`${dateStr}T${String(Math.floor(startMin/60)).padStart(2,'0')}:${String(startMin%60).padStart(2,'0')}:00`);
    const endMinTotal = startMin + duration;
    const serviceEnd = new Date(startDate.getTime()+duration*60000);

    // Every minute in the service must remain inside the barber's shift.
    for(let t=startMin; t<endMinTotal; t+=Math.max(5, Math.min(C.booking.slotMinutes, 15))){
      const tm=((t%1440)+1440)%1440;
      if(!inShift(parseTime(barber.shiftStart), parseTime(barber.shiftEnd), tm)) return false;
    }
    // Check bookings for overlapping time. Store actual ISO start/end.
    const dateBookings=allBookings.filter(x=>x.barberId===barber.id);
    const serviceStart=startDate.getTime(); const serviceEndMs=serviceEnd.getTime();
    return !dateBookings.some(x=> serviceStart < new Date(x.endISO).getTime() && serviceEndMs > new Date(x.startISO).getTime());
  }

  function buildSlots(){
    const barberId=$('#barber')?.value, serviceId=$('#service')?.value, date=$('#date')?.value, slots=$('#slots');
    if(!barberId||!serviceId||!date||!slots)return;
    const barber=C.barbers.find(b=>b.id===barberId), service=C.services.find(s=>s.id===serviceId), bookings=storageGet();
    const out=[];
    for(let m=0;m<1440;m+=C.booking.slotMinutes){
      if(slotAvailable(barber,date,m,service.duration,bookings)) out.push(m);
    }
    if(!out.length){slots.innerHTML='<div class="notice" style="grid-column:1/-1">No available time slots for this barber and date. Try another date or barber.</div>'; $('#selectedTime').value=''; return;}
    slots.innerHTML=out.map(m=>`<button class="slot" type="button" data-min="${m}">${fmtTime(m)}</button>`).join('');
    slots.querySelectorAll('.slot').forEach(btn=>btn.addEventListener('click',()=>{
      slots.querySelectorAll('.slot').forEach(x=>x.classList.remove('selected')); btn.classList.add('selected'); $('#selectedTime').value=btn.dataset.min; refreshSummary();
    }));
    refreshSummary();
  }

  function refreshSummary(){
    const service=C.services.find(s=>s.id===$('#service')?.value), barber=C.barbers.find(b=>b.id===$('#barber')?.value);
    $('#sumService') && ($('#sumService').textContent=service?service.name:'—');
    $('#sumBarber') && ($('#sumBarber').textContent=barber?barber.name:'—');
    $('#sumDate') && ($('#sumDate').textContent=$('#date')?.value||'—');
    const val=$('#selectedTime')?.value; $('#sumTime') && ($('#sumTime').textContent=val?fmtTime(Number(val)):'—');
    $('#sumPrice') && ($('#sumPrice').textContent=service?money(service.price)+(service.price>=150?' +':''):'—');
    $('#sumDuration') && ($('#sumDuration').textContent=service?service.duration+' min':'—');
  }

  function initBooking(){
    if(!$('#bookingForm'))return;
    const date=$('#date'); date.min=dateKey(new Date()); if(!date.value)date.value=date.min;
    const serviceSelect=$('#service');
    serviceSelect.innerHTML='<option value="">Choose a service</option>'+C.services.map(s=>`<option value="${s.id}">${s.name} — ${money(s.price)}${s.price>=150?' +':''}</option>`).join('');
    const barberSelect=$('#barber');
    barberSelect.innerHTML='<option value="">Choose a barber</option>'+C.barbers.map(b=>`<option value="${b.id}">${b.name} — ${b.nationality} (${b.shiftStart}–${b.shiftEnd})</option>`).join('');
    const q=new URLSearchParams(location.search).get('service'); if(q&&C.services.some(s=>s.id===q))serviceSelect.value=q;
    ['change','input'].forEach(ev=>{ date.addEventListener(ev,()=>{buildSlots();refreshSummary()}); serviceSelect.addEventListener(ev,()=>{buildSlots();refreshSummary()}); barberSelect.addEventListener(ev,()=>{buildSlots();refreshSummary()}); });
    $('#bookingForm').addEventListener('submit',e=>{
      e.preventDefault();
      const name=$('#clientName').value.trim(), phone=$('#clientPhone').value.trim(), service=C.services.find(s=>s.id===serviceSelect.value), barber=C.barbers.find(b=>b.id===barberSelect.value), selected=$('#selectedTime').value;
      if(!name||!phone||!service||!barber||!date.value||selected===''){toast('Please complete all booking fields and choose a time.'); return;}
      const minutes=Number(selected); const start=new Date(`${date.value}T${String(Math.floor(minutes/60)).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')}:00`); const end=new Date(start.getTime()+service.duration*60000);
      const bookings=storageGet();
      if(!slotAvailable(barber,date.value,minutes,service.duration,bookings)){toast('That time was just taken. Please choose another slot.');buildSlots();return;}
      const id='NR-'+Date.now();
      bookings.push({id,name,phone,serviceId:service.id,serviceName:service.name,price:service.price,barberId:barber.id,barberName:barber.name,date:date.value,time:fmtTime(minutes),duration:service.duration,startISO:start.toISOString(),endISO:end.toISOString(),createdAt:new Date().toISOString()});
      storageSet(bookings);
      $('#confirmBox').style.display='block'; $('#confirmText').textContent=`Booking ${id} confirmed for ${name} — ${service.name} with ${barber.name} on ${date.value} at ${fmtTime(minutes)}.`;
      const wa=`https://wa.me/${C.salon.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello NIRO MEN'S SALON, I want to book:\nBooking: ${id}\nName: ${name}\nPhone: ${phone}\nService: ${service.name}\nBarber: ${barber.name}\nDate: ${date.value}\nTime: ${fmtTime(minutes)}\nDuration: ${service.duration} min\nPrice: ${service.price} QR${service.price>=150?' +':''}`)}`;
      $('#waConfirm').href=wa; $('#waConfirm').style.display='inline-flex';
      toast('Booking saved successfully.');
      buildSlots();
    });
    buildSlots(); refreshSummary();
  }

  function initAdmin(){
    const table=$('#bookingsTable'); if(!table)return;
    function render(){
      const data=storageGet().sort((a,b)=>new Date(a.startISO)-new Date(b.startISO));
      if(!data.length){table.innerHTML='<tr><td colspan="8" class="muted">No bookings saved on this device.</td></tr>'; return;}
      table.innerHTML=data.map(x=>`<tr><td><strong>${escapeHtml(x.id)}</strong><br><span class="muted">${new Date(x.createdAt).toLocaleString()}</span></td><td>${escapeHtml(x.name)}<br>${escapeHtml(x.phone)}</td><td>${escapeHtml(x.serviceName)}<br>${money(x.price)}${x.price>=150?' +':''}</td><td>${escapeHtml(x.barberName)}</td><td>${x.date}</td><td>${escapeHtml(x.time)}</td><td>${x.duration} min</td><td><button class="btn small ghost" data-delete="${escapeHtml(x.id)}">Delete</button></td></tr>`).join('');
      table.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{storageSet(storageGet().filter(x=>x.id!==b.dataset.delete));render();toast('Booking deleted.');});
    }
    render();
    $('#clearBookings')?.addEventListener('click',()=>{ if(confirm('Delete all bookings saved on this device?')){storageSet([]);render();toast('All bookings cleared.');} });
    $('#exportBookings')?.addEventListener('click',()=>{
      const data=storageGet(); const headers=['ID','Name','Phone','Service','Price','Barber','Date','Time','Duration','Created'];
      const rows=data.map(x=>[x.id,x.name,x.phone,x.serviceName,x.price,x.barberName,x.date,x.time,x.duration,new Date(x.createdAt).toLocaleString()]);
      const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
      const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url; a.download='niro-bookings.csv'; a.click(); URL.revokeObjectURL(url);
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{applyGlobal();nav();populateServices();populateBarbers();initBooking();initAdmin();});
})();
