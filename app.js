const KEY="smartclass_quick_teacher_v1";
let db={schoolName:"",schoolYear:"2026-2027",schools:[],activeSchoolId:"",activeSchoolYearId:"",classes:[{id:"class_default",name:"Lớp học của tôi"}],activeClassId:"class_default",students:[],grades:[],behaviors:[],timetables:[],timetableImages:[]};
let selectedType="Khen",selectedScore=null,editingStudentId=null,editingTimetableId=null,selectedTimetableDay="all";
const $=id=>document.getElementById(id),today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")},uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function ensureSchema(){
  db.schoolName=typeof db.schoolName==="string"?db.schoolName:"";
  db.schoolYear=typeof db.schoolYear==="string"&&db.schoolYear?db.schoolYear:"2026-2027";
  if(!Array.isArray(db.schools)||!db.schools.length){
    const schoolId=uid(),yearId=uid();
    db.schools=[{id:schoolId,name:db.schoolName||"Trường của tôi",years:[{id:yearId,label:db.schoolYear}]}];
    db.activeSchoolId=schoolId;db.activeSchoolYearId=yearId;
  }
  db.schools=db.schools.map(s=>{
    const years=Array.isArray(s.years)?s.years:[];
    return {id:s.id||uid(),name:s.name||"Trường chưa đặt tên",years:years.map(y=>({id:y.id||uid(),label:y.label||y.name||"2026-2027"}))};
  });
  db.schools.forEach(s=>{if(!s.years.length)s.years.push({id:uid(),label:"2026-2027"})});
  if(!db.activeSchoolId||!db.schools.some(s=>s.id===db.activeSchoolId))db.activeSchoolId=db.schools[0].id;
  const activeSchool=db.schools.find(s=>s.id===db.activeSchoolId)||db.schools[0];
  if(!db.activeSchoolYearId||!activeSchool.years.some(y=>y.id===db.activeSchoolYearId))db.activeSchoolYearId=activeSchool.years[0].id;
  const activeYear=activeSchool.years.find(y=>y.id===db.activeSchoolYearId)||activeSchool.years[0];
  db.schoolName=activeSchool.name;db.schoolYear=activeYear.label;
  if(!Array.isArray(db.classes)||!db.classes.length){
    const oldName=db.className||"Lớp học của tôi";
    db.classes=[{id:"class_default",name:oldName}];
  }
  db.classes=db.classes.map(c=>({id:c.id||uid(),name:c.name||"Lớp chưa đặt tên"}));
  if(!db.activeClassId||!db.classes.some(c=>c.id===db.activeClassId))db.activeClassId=db.classes[0].id;
  db.students=Array.isArray(db.students)?db.students:[];
  db.students.forEach(s=>{
    s.profile=s.profile&&typeof s.profile==="object"?s.profile:{};
    if(!s.schoolId)s.schoolId=db.activeSchoolId;
    if(!s.schoolYearId)s.schoolYearId=db.activeSchoolYearId;
    if(!s.classId)s.classId=db.classes[0].id;
  });
  db.grades=Array.isArray(db.grades)?db.grades:[];
  db.behaviors=Array.isArray(db.behaviors)?db.behaviors:[];
  db.timetableImages=Array.isArray(db.timetableImages)?db.timetableImages:[];
  db.timetables=Array.isArray(db.timetables)?db.timetables:[];
  db.timetables.forEach(t=>{
    if(!t.id)t.id=uid();
    if(!t.schoolId)t.schoolId=db.activeSchoolId;
    if(!t.schoolYearId)t.schoolYearId=db.activeSchoolYearId;
    if(!t.classId)t.classId=db.classes[0].id;
    t.day=Number(t.day)||2;
    t.session=t.session==="Chiều"?"Chiều":"Sáng";
    t.period=Number(t.period)||1;
  });
}
function currentSchool(){return db.schools.find(s=>s.id===db.activeSchoolId)||db.schools[0]}
function currentSchoolYear(){return currentSchool().years.find(y=>y.id===db.activeSchoolYearId)||currentSchool().years[0]}
function syncSchoolAliases(){db.schoolName=currentSchool().name;db.schoolYear=currentSchoolYear().label}
function currentClass(){return db.classes.find(c=>c.id===db.activeClassId)||db.classes[0]}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(db));$("saveStatus").textContent="● Đã lưu";if(window.smartClassCloudSave)window.smartClassCloudSave(db)}catch(e){$("saveStatus").textContent="! Lỗi lưu";toast("Không lưu được. Hãy xuất TXT.")}renderAll()}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1900)}
function load(){try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved)db=saved}catch(e){}ensureSchema();syncSchoolAliases();$("classLabel").textContent=[db.schoolName,currentClass().name,db.schoolYear].filter(Boolean).join(" · ");renderAll()}
window.smartClassApplyCloudData=function(remote){if(!remote||typeof remote!=="object")return;db=remote;ensureSchema();syncSchoolAliases();try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}$("saveStatus").textContent="● Đã đồng bộ";renderAll()};
window.smartClassGetLocalData=function(){return db};
function nameOf(id){return db.students.find(s=>s.id===id)?.name||"Đã xóa học sinh"}
function initials(n){return (n||"?").trim().split(/\s+/).slice(-2).map(x=>x[0]).join("").toUpperCase()}
function switchScreen(screen){document.querySelectorAll(".screen").forEach(x=>x.classList.toggle("active",x.id==="screen-"+screen));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.screen===screen));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelector(".bottom-nav").addEventListener("click",e=>{let b=e.target.closest("[data-screen]");if(b)switchScreen(b.dataset.screen)});
function schoolStudents(){return db.students.filter(s=>s.schoolId===db.activeSchoolId&&s.schoolYearId===db.activeSchoolYearId)}
function classStudents(){return schoolStudents().filter(s=>s.classId===db.activeClassId)}
function fillSelects(){
  const students=classStudents();
  const schoolSelect=$("activeSchool"),yearSelect=$("activeSchoolYear");
  schoolSelect.innerHTML=db.schools.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("");
  schoolSelect.value=db.activeSchoolId;
  const selectedSchool=currentSchool();
  yearSelect.innerHTML=selectedSchool.years.map(y=>`<option value="${esc(y.id)}">${esc(y.label)}</option>`).join("");
  yearSelect.value=db.activeSchoolYearId;
  syncSchoolAliases();
  let opts=students.map(s=>`<option value="${s.id}">${esc(s.code)} · ${esc(s.name)}</option>`).join("")||'<option value="">Lớp này chưa có học sinh</option>';
  $("behaviorStudent").innerHTML=$("gradeStudent").innerHTML=opts;
  const classOptions=db.classes.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
  $("behaviorClassSelect").innerHTML=classOptions;
  $("behaviorClassSelect").value=db.activeClassId;
  $("classFilter").innerHTML='<option value="all">Tất cả lớp</option>'+classOptions;
  $("classFilter").value=db.activeClassId;
  $("classLabel").textContent=[db.schoolName,currentClass().name,db.schoolYear].filter(Boolean).join(" · ");
}
function renderAll(){fillSelects();renderStudents();renderBehaviorFeed();renderGradeFeed();renderClassList();renderStats();renderRanking();renderProgress();renderTimetable();$("behaviorTodayCount").textContent=db.behaviors.filter(x=>x.date===today()&&classStudents().some(s=>s.id===x.studentId)).length+" hôm nay";$("gradeTodayCount").textContent=db.grades.filter(x=>x.date===today()&&schoolStudents().some(s=>s.id===x.studentId)).length+" điểm hôm nay"}

function parseISODate(value){if(!value)return null;const p=value.split("-").map(Number);if(p.length!==3||!p.every(Number.isFinite))return null;return new Date(p[0],p[1]-1,p[2])}
function isoLocal(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function periodBounds(period){
  const now=new Date(), yearText=String(db.schoolYear||"2026-2027"), match=yearText.match(/(20\d{2})/);
  const startYear=match?Number(match[1]):now.getFullYear();
  let start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(start);
  if(period==="day"){}
  else if(period==="week"){const day=(start.getDay()+6)%7;start.setDate(start.getDate()-day);end=new Date(start);end.setDate(end.getDate()+6)}
  else if(period==="month"){start=new Date(now.getFullYear(),now.getMonth(),1);end=new Date(now.getFullYear(),now.getMonth()+1,0)}
  else if(period==="hk1"){start=new Date(startYear,8,1);end=new Date(startYear,11,31)}
  else if(period==="hk2"){start=new Date(startYear+1,0,1);end=new Date(startYear+1,4,31)}
  else {start=new Date(startYear,8,1);end=new Date(startYear+1,4,31)}
  return {from:isoLocal(start),to:isoLocal(end)};
}
function renderStats(){
  const period=$("statsPeriod")?.value||"year", bounds=periodBounds(period);
  const students=classStudents();
  const inRange=x=>x.date&&x.date>=bounds.from&&x.date<=bounds.to;
  const activeIds=new Set(students.map(s=>s.id));
  const behaviors=db.behaviors.filter(x=>inRange(x)&&activeIds.has(x.studentId)), grades=db.grades.filter(x=>inRange(x)&&activeIds.has(x.studentId));
  const totalKhen=behaviors.filter(x=>x.type==="Khen").length;
  const totalNhac=behaviors.filter(x=>x.type==="Nhắc").length;
  const totalViPham=behaviors.filter(x=>x.type==="Vi phạm").length;
  const avg=grades.length?(grades.reduce((sum,x)=>sum+Number(x.score||0),0)/grades.length).toFixed(1):"—";
  $("statsStudentCount").textContent=students.length+" học sinh";
  $("statsSummary").innerHTML=`
    <div class="stat-tile"><small>Lượt khen</small><b class="stat-positive">${totalKhen}</b></div>
    <div class="stat-tile"><small>Lượt nhắc</small><b class="stat-warning">${totalNhac}</b></div>
    <div class="stat-tile"><small>Vi phạm</small><b class="stat-negative">${totalViPham}</b></div>
    <div class="stat-tile"><small>Lượt điểm</small><b>${grades.length}</b></div>
    <div class="stat-tile stat-average"><small>Điểm trung bình</small><b>${avg}</b></div>`;
  $("studentStatsList").innerHTML=students.map(s=>{
    const b=behaviors.filter(x=>x.studentId===s.id),g=grades.filter(x=>x.studentId===s.id);
    const k=b.filter(x=>x.type==="Khen").length,n=b.filter(x=>x.type==="Nhắc").length,v=b.filter(x=>x.type==="Vi phạm").length;
    const average=g.length?(g.reduce((sum,x)=>sum+Number(x.score||0),0)/g.length).toFixed(1):"—";
    const high=g.length?Math.max(...g.map(x=>Number(x.score||0))).toFixed(1):"—";
    return `<article class="student-stat-card">
      <div class="student-stat-top"><div class="student-initial">${esc(initials(s.name))}</div><div class="student-stat-name"><b>${esc(s.name)}</b><small>Mã: ${esc(s.code||"—")}</small></div><div class="student-stat-average"><b>${average}</b><small>ĐTB (${g.length} điểm)</small></div></div>
      <div class="behavior-counts"><span class="count-good">✓ Khen <b>${k}</b></span><span class="count-warn">! Nhắc <b>${n}</b></span><span class="count-bad">× Vi phạm <b>${v}</b></span></div>
      <div class="student-score-detail"><span>Số điểm: <b>${g.length}</b></span><span>Điểm cao nhất: <b>${high}</b></span></div>
    </article>`;
  }).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có học sinh trong lớp này</b><small>Thêm học sinh để xem thống kê chi tiết.</small></div></div>';
}

function getStudentMetrics(student, bounds){
  const behaviors=db.behaviors.filter(x=>x.studentId===student.id&&x.date>=bounds.from&&x.date<=bounds.to);
  const grades=db.grades.filter(x=>x.studentId===student.id&&x.date>=bounds.from&&x.date<=bounds.to&&Number.isFinite(Number(x.score)));
  const k=behaviors.filter(x=>x.type==="Khen").length;
  const n=behaviors.filter(x=>x.type==="Nhắc").length;
  const v=behaviors.filter(x=>x.type==="Vi phạm").length;
  const average=grades.length?grades.reduce((sum,x)=>sum+Number(x.score),0)/grades.length:null;
  const academic=average===null?0:average*6;
  const discipline=Math.max(0,Math.min(40,30+Math.min(10,k*2)-n*2-v*5));
  const total=average===null?null:academic+discipline;
  let rating="Chưa đủ dữ liệu";
  if(total!==null)rating=total>=90?"Xuất sắc":total>=80?"Tốt":total>=65?"Đạt":"Cần cố gắng";
  return {k,n,v,grades,average,academic,discipline,total,rating,behaviors};
}
function currentPeriodBounds(){return periodBounds($("statsPeriod").value||"year")}
function renderRanking(){
  const bounds=currentPeriodBounds();
  const ranked=classStudents().map(s=>({student:s,...getStudentMetrics(s,bounds)}))
    .sort((a,b)=>(b.total??-1)-(a.total??-1)||((a.student.name||"").localeCompare(b.student.name||"","vi")));
  $("rankingTable").innerHTML=ranked.map((x,i)=>{
    const score=x.total===null?"—":x.total.toFixed(1);
    const cls=x.rating==="Xuất sắc"?"rank-excellent":x.rating==="Tốt"?"rank-good":x.rating==="Đạt"?"rank-pass":x.rating==="Cần cố gắng"?"rank-low":"rank-empty";
    return `<div class="ranking-row"><span class="rank-number">${x.total===null?"—":i+1}</span><div class="ranking-person"><b>${esc(x.student.name)}</b><small>${x.k} khen · ${x.n} nhắc · ${x.v} vi phạm · ${x.grades.length} điểm</small></div><span class="rank-badge ${cls}">${esc(x.rating)}</span><b class="rank-score">${score}</b></div>`;
  }).join("")||'<div class="empty-note">Chưa có học sinh để xếp hạng.</div>';
}
function renderProgress(){
  const students=classStudents(),select=$("progressStudent"),old=select.value;
  select.innerHTML=students.map(s=>`<option value="${esc(s.id)}">${esc(s.code||"")} · ${esc(s.name)}</option>`).join("")||'<option value="">Chưa có học sinh</option>';
  if(students.some(s=>s.id===old))select.value=old;
  const sid=select.value,student=students.find(s=>s.id===sid);
  if(!student){$("progressSummary").textContent="Thêm học sinh và nhập điểm để xem tiến bộ.";$("progressChart").innerHTML="";return}
  const bounds=currentPeriodBounds(),metrics=getStudentMetrics(student,bounds);
  $("progressSummary").innerHTML=`<span>ĐTB: <b>${metrics.average===null?"—":metrics.average.toFixed(2)}</b></span><span>Số bài: <b>${metrics.grades.length}</b></span><span>Xếp loại: <b>${esc(metrics.rating)}</b></span>`;
  const start=parseISODate(bounds.from),end=parseISODate(bounds.to);
  const months=[];let cursor=new Date(start.getFullYear(),start.getMonth(),1),last=new Date(end.getFullYear(),end.getMonth(),1);
  while(cursor<=last&&months.length<24){months.push({key:`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,"0")}`,label:`T${cursor.getMonth()+1}`,values:[]});cursor.setMonth(cursor.getMonth()+1)}
  metrics.grades.forEach(g=>{const key=(g.date||"").slice(0,7),m=months.find(x=>x.key===key);if(m)m.values.push(Number(g.score))});
  const W=600,H=230,L=38,R=14,T=18,B=38,plotW=W-L-R,plotH=H-T-B;
  const y=v=>T+(10-v)/10*plotH;
  let grid="";[0,2,4,6,8,10].forEach(v=>{grid+=`<line x1="${L}" y1="${y(v)}" x2="${W-R}" y2="${y(v)}" stroke="#e8edf4"/><text x="${L-9}" y="${y(v)+4}" text-anchor="end" font-size="10" fill="#8793a5">${v}</text>`});
  const points=months.map((m,i)=>({x:months.length===1?L+plotW/2:L+i*plotW/(months.length-1),y:m.values.length?y(m.values.reduce((a,b)=>a+b,0)/m.values.length):null,avg:m.values.length?m.values.reduce((a,b)=>a+b,0)/m.values.length:null,label:m.label,count:m.values.length}));
  const segments=[];let current=[];points.forEach(pt=>{if(pt.y===null){if(current.length)segments.push(current);current=[]}else current.push(pt)});if(current.length)segments.push(current);
  const lines=segments.map(seg=>`<polyline points="${seg.map(pt=>`${pt.x},${pt.y}`).join(" ")}" fill="none" stroke="#3f63dc" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
  const dots=points.map(pt=>pt.y===null?"":`<circle cx="${pt.x}" cy="${pt.y}" r="4.5" fill="#3f63dc"><title>${pt.label}: ${pt.avg.toFixed(2)} (${pt.count} bài)</title></circle>`).join("");
  const labels=points.map(pt=>`<text x="${pt.x}" y="${H-12}" text-anchor="middle" font-size="10" fill="#8793a5">${pt.label}</text>`).join("");
  $("progressChart").innerHTML=months.length?`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Điểm trung bình theo tháng, thang điểm 0 đến 10">${grid}${lines}${dots}${labels}</svg><small>Điểm trung bình theo tháng; tháng không có điểm sẽ để trống.</small>`:'<div class="empty-note">Không có dữ liệu trong khoảng thời gian này.</div>';
}
function exportExcel(){
  if(!window.XLSX){$("excelStatus").textContent="Không tải được thư viện Excel. Hãy kiểm tra Internet rồi tải lại trang.";return toast("Chưa tải được thư viện Excel")}
  const period=$("statsPeriod").value||"year",bounds=currentPeriodBounds(),label=$("statsPeriod").selectedOptions[0]?.textContent||period;
  const students=classStudents();
  const summary=students.map(s=>{const m=getStudentMetrics(s,bounds);return {"Hạng":m.total===null?"":null,"Mã HS":s.code||"","Họ và tên":s.name,"Lớp":currentClass().name,"Số lần khen":m.k,"Số lần nhắc":m.n,"Số lần vi phạm":m.v,"Số bài điểm":m.grades.length,"Điểm trung bình":m.average===null?"":Number(m.average.toFixed(2)),"Điểm học tập (60)":Number(m.academic.toFixed(2)),"Điểm nề nếp (40)":Number(m.discipline.toFixed(2)),"Điểm thi đua":m.total===null?"":Number(m.total.toFixed(2)),"Xếp loại":m.rating};});
  summary.sort((a,b)=>(Number(b["Điểm thi đua"]||-1)-Number(a["Điểm thi đua"]||-1)));
  summary.forEach((x,i)=>x["Hạng"]=x["Điểm thi đua"]===""?"":i+1);
  const behaviorRows=db.behaviors.filter(x=>x.date>=bounds.from&&x.date<=bounds.to&&students.some(s=>s.id===x.studentId)).map(x=>({"Ngày":x.date,"Giờ":x.time||"","Mã HS":students.find(s=>s.id===x.studentId)?.code||"","Học sinh":nameOf(x.studentId),"Loại":x.type,"Ghi chú":x.note||""}));
  const gradeRows=db.grades.filter(x=>x.date>=bounds.from&&x.date<=bounds.to&&students.some(s=>s.id===x.studentId)).map(x=>({"Ngày":x.date,"Giờ":x.time||"","Mã HS":students.find(s=>s.id===x.studentId)?.code||"","Học sinh":nameOf(x.studentId),"Môn":x.subject||"","Loại điểm":x.kind||"","Điểm":Number(x.score)}));
  const wb=XLSX.utils.book_new();
  const info=[{"Trường":db.schoolName||"","Năm học":db.schoolYear||"","Lớp":currentClass().name,"Thời gian":label,"Từ ngày":bounds.from,"Đến ngày":bounds.to,"Quy tắc": "Thi đua = ĐTB×6 + nề nếp; nề nếp = giới hạn 0–40 của (30 + khen×2 tối đa +10 − nhắc×2 − vi phạm×5)"}];
  const addSheet=(rows,name)=>{const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{"Thông tin":"Không có dữ liệu"}]);ws["!cols"]=Object.keys(rows[0]||{"Thông tin":""}).map(k=>({wch:Math.min(32,Math.max(12,k.length+4))}));XLSX.utils.book_append_sheet(wb,ws,name)};
  addSheet(info,"Thong tin");addSheet(summary,"Xep hang");addSheet(gradeRows,"Bang diem");addSheet(behaviorRows,"Ne nep");
  const safe=(currentClass().name||"Lop").replace(/[^\w-]+/g,"_");
  XLSX.writeFile(wb,`Bao_cao_${safe}_${period}_${today()}.xlsx`);
  $("excelStatus").textContent=`Đã tạo báo cáo ${label} (${bounds.from} đến ${bounds.to}).`;
}

function renderStudents(){
  let q=($("studentSearch").value||"").toLowerCase(),filter=$("classFilter").value||db.activeClassId;
  let a=schoolStudents().filter(s=>(filter==="all"||s.classId===filter)&&(s.name+" "+s.code).toLowerCase().includes(q));
  $("studentCount").textContent=a.length+" học sinh";
  $("studentList").innerHTML=a.map(s=>{let g=db.grades.filter(x=>x.studentId===s.id);let cn=db.classes.find(c=>c.id===s.classId)?.name||"Chưa phân lớp";return `<div class="student-row"><div class="student-initial">${esc(initials(s.name))}</div><div class="student-info"><b>${esc(s.name)}</b><small>Mã: ${esc(s.code||"—")} · ${esc(cn)}</small></div><div class="student-metrics"><b>${g.length?(g.reduce((a,x)=>a+Number(x.score),0)/g.length).toFixed(1):"—"}</b>ĐTB</div><button class="plain-btn student-action" onclick="editStudentProfile('${s.id}')">Hồ sơ</button><button class="plain-btn student-action" onclick="printStudentReport('${s.id}')">Phiếu</button><button class="delete-btn" aria-label="Chuyển lớp" title="Chuyển lớp" onclick="moveStudent('${s.id}')">⇄</button><button class="delete-btn" aria-label="Xóa học sinh" onclick="removeStudent('${s.id}')">⋯</button></div>`}).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có học sinh</b><small>Chọn lớp hoặc nhấn + Thêm để tạo hồ sơ.</small></div></div>';
}
function renderBehaviorFeed(){let activeIds=new Set(classStudents().map(s=>s.id));let arr=db.behaviors.filter(x=>activeIds.has(x.studentId)).slice(0,12);$("behaviorFeed").innerHTML=arr.map(x=>{let cls=x.type==="Khen"?"":x.type==="Nhắc"?"remind":"negative";return `<div class="feed-item"><div class="feed-mark ${cls}">${x.type==="Khen"?"✓":x.type==="Nhắc"?"!":"×"}</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.type)} · ${esc(x.note||"Đã ghi nhận")} · ${esc(x.time||"")}</small></div><button class="delete-btn" onclick="removeRecord('behaviors','${x.id}')">×</button></div>`}).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có ghi nhận</b><small>Chọn học sinh và chạm một nút nề nếp để nhập nhanh.</small></div></div>'}
function renderGradeFeed(){let activeIds=new Set(schoolStudents().map(s=>s.id));let arr=db.grades.filter(x=>activeIds.has(x.studentId)).slice(0,12);$("gradeFeed").innerHTML=arr.map(x=>`<div class="feed-item"><div class="feed-mark" style="background:#edf1ff;color:#3f63dc">▤</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.subject)} · ${esc(x.kind)} · ${esc(x.time||"")}</small></div><strong class="feed-score">${Number(x.score).toFixed(1)}</strong><button class="delete-btn" onclick="removeRecord('grades','${x.id}')">×</button></div>`).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có điểm</b><small>Chọn học sinh, môn học và chạm mức điểm.</small></div></div>'}
function renderClassList(){
  $("classList").innerHTML=db.classes.map(c=>{let count=db.students.filter(s=>s.classId===c.id).length;return `<div class="class-item"><div><b>${esc(c.name)}</b><small>${count} học sinh</small></div><button class="plain-btn" onclick="renameClass('${c.id}')">Đổi tên</button><button class="plain-btn" onclick="deleteClass('${c.id}')">Xóa</button></div>`}).join("");
}
function selectActiveClass(value){if(!db.classes.some(c=>c.id===value))return;db.activeClassId=value;persist()}
$("behaviorClassSelect").onchange=()=>selectActiveClass($("behaviorClassSelect").value);
$("classFilter").onchange=()=>{let v=$("classFilter").value;if(v!=="all")selectActiveClass(v);else renderStudents()};
$("behaviorTypes").addEventListener("click",e=>{let b=e.target.closest("[data-type]");if(!b)return;selectedType=b.dataset.type;document.querySelectorAll(".type-btn").forEach(x=>x.classList.toggle("selected",x===b))});
$("addBehavior").onclick=()=>{let sid=$("behaviorStudent").value;if(!sid)return toast("Hãy thêm học sinh vào lớp trước");db.behaviors.unshift({id:uid(),studentId:sid,type:selectedType,note:$("behaviorText").value.trim(),date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("behaviorText").value="";persist();toast("Đã ghi nhận "+selectedType.toLowerCase())};
$("scorePad").addEventListener("click",e=>{let b=e.target.closest("[data-score]");if(!b)return;selectedScore=Number(b.dataset.score);document.querySelectorAll("#scorePad button").forEach(x=>x.classList.toggle("selected",x===b));$("chosenScore").textContent=selectedScore});
$("clearScore").onclick=()=>{selectedScore=null;$("chosenScore").textContent="—";document.querySelectorAll("#scorePad button").forEach(x=>x.classList.remove("selected"))};
$("addGrade").onclick=()=>{let sid=$("gradeStudent").value,sub=$("gradeSubject").value.trim();if(!sid)return toast("Hãy thêm học sinh vào lớp trước");if(!sub)return toast("Nhập tên môn học");if(selectedScore===null)return toast("Chọn mức điểm");db.grades.unshift({id:uid(),studentId:sid,subject:sub,kind:$("gradeKind").value,score:selectedScore,date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("clearScore").click();persist();toast("Đã lưu điểm "+selectedScore)};
$("studentSearch").oninput=renderStudents;
$("statsPeriod").addEventListener("change",()=>{renderStats();renderRanking();renderProgress()});
$("progressStudent").addEventListener("change",renderProgress);
$("exportExcel").addEventListener("click",exportExcel);
// Nhập danh sách học sinh từ file Excel theo mẫu tải xuống.
let pendingExcelStudents=[];
function normalizeExcelText(value){return String(value??"").trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D").toLowerCase().replace(/[^a-z0-9]/g,"")}
function excelDate(value){
  if(value===undefined||value===null||value==="")return "";
  if(value instanceof Date&&!Number.isNaN(value.getTime()))return [value.getFullYear(),String(value.getMonth()+1).padStart(2,"0"),String(value.getDate()).padStart(2,"0")].join("-");
  if(typeof value==="number"&&window.XLSX){const d=XLSX.SSF.parse_date_code(value);if(d)return `${d.y}-${String(d.m).padStart(2,"0")}-${String(d.d).padStart(2,"0")}`}
  const v=String(value).trim();if(!v)return "";
  let m=v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);if(m)return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);if(m)return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  return "";
}
function downloadStudentTemplate(){
  if(!window.XLSX)return alert("Chưa tải được thư viện Excel. Hãy kết nối Internet rồi thử lại.");
  const headers=["STT","MaHS","HoTen","Lop","NgaySinh","GioiTinh","DiaChi","HoTenPhuHuynh","SDTPhuHuynh","DiemManh","NoiDungCanHoTro","GhiChu"];
  const ws=XLSX.utils.aoa_to_sheet([headers]);
  ws["!cols"]=[{wch:8},{wch:16},{wch:26},{wch:14},{wch:14},{wch:12},{wch:30},{wch:26},{wch:18},{wch:28},{wch:30},{wch:30}];
  const info=[
    ["HƯỚNG DẪN NHẬP DANH SÁCH HỌC SINH"],
    ["1. Điền dữ liệu ở sheet DanhSachHocSinh, bắt đầu từ dòng 2; không sửa tên cột ở dòng 1."],
    ["2. Bắt buộc: HoTen và Lop. Các cột khác có thể để trống."],
    ["3. NgaySinh dùng định dạng dd/mm/yyyy hoặc yyyy-mm-dd; GioiTinh: Nam, Nữ hoặc Khác."],
    ["4. Mỗi dòng là một học sinh. Không gộp ô, không để dòng tiêu đề phụ trong danh sách."],
    ["5. Khi tải lên, học sinh được thêm vào trường và năm học đang chọn. Lớp chưa tồn tại sẽ tự tạo."],
    ["6. Hệ thống bỏ qua học sinh trùng mã; nếu không có mã, đối chiếu họ tên và lớp trong cùng trường/năm học."]
  ];
  const guide=XLSX.utils.aoa_to_sheet(info);guide["!cols"]=[{wch:115}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"DanhSachHocSinh");XLSX.utils.book_append_sheet(wb,guide,"HuongDan");
  XLSX.writeFile(wb,"Mau_Nhap_Danh_Sach_Hoc_Sinh.xlsx");
}
function parseStudentExcel(file){
  if(!window.XLSX)throw new Error("Không tải được thư viện Excel. Hãy kết nối Internet rồi tải lại trang.");
  const reader=new FileReader();reader.onload=()=>{
    try{
      const wb=XLSX.read(reader.result,{type:"array",cellDates:true});
      const sheet=wb.Sheets[wb.SheetNames.find(n=>normalizeExcelText(n)==="danhsachhocsinh")||wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(sheet,{defval:"",raw:true});
      if(!rows.length)throw new Error("File chưa có dữ liệu học sinh hoặc thiếu dòng tiêu đề.");
      const headerMap={};Object.keys(rows[0]).forEach(k=>headerMap[normalizeExcelText(k)]=k);
      const col=(...names)=>{for(const n of names){const k=headerMap[normalizeExcelText(n)];if(k!==undefined)return k}return null};
      const fields={name:col("HoTen","Họ và tên","TenHocSinh","HoTenHocSinh"),className:col("Lop","Lớp","TenLop"),code:col("MaHS","Mã học sinh","MaHocSinh"),dob:col("NgaySinh","Ngày sinh"),gender:col("GioiTinh","Giới tính"),address:col("DiaChi","Địa chỉ"),parentName:col("HoTenPhuHuynh","Họ tên phụ huynh","PhuHuynh"),parentPhone:col("SDTPhuHuynh","Số điện thoại phụ huynh","DienThoai"),strengths:col("DiemManh","Sở trường / điểm mạnh","SoTruong"),support:col("NoiDungCanHoTro","Nội dung cần hỗ trợ","CanHoTro"),notes:col("GhiChu","Ghi chú")};
      if(!fields.name||!fields.className)throw new Error("Không tìm thấy cột bắt buộc HoTen và Lop. Hãy dùng đúng file mẫu tải từ ứng dụng.");
      const errors=[],valid=[],seen=new Set();let rowNo=1;
      const current=schoolStudents();
      rows.forEach(r=>{
        rowNo++;const get=k=>k?r[k]:"",name=String(get(fields.name)||"").trim(),className=String(get(fields.className)||"").trim();
        if(!name&&!className&&!String(get(fields.code)||"").trim())return;
        if(!name||!className){errors.push(`Dòng ${rowNo}: thiếu ${!name?"họ tên":"tên lớp"}.`);return}
        const code=String(get(fields.code)||"").trim();
        const key=code?"code:"+normalizeExcelText(code)+"|class:"+normalizeExcelText(className):"name:"+normalizeExcelText(name)+"|class:"+normalizeExcelText(className);
        const exists=current.some(st=>code?(normalizeExcelText(st.code)===normalizeExcelText(code)&&normalizeExcelText(db.classes.find(c=>c.id===st.classId)?.name)===normalizeExcelText(className)):(normalizeExcelText(st.name)===normalizeExcelText(name)&&normalizeExcelText(db.classes.find(c=>c.id===st.classId)?.name)===normalizeExcelText(className)));
        if(exists||seen.has(key)){errors.push(`Dòng ${rowNo}: học sinh trùng ${code?"mã "+code:"họ tên và lớp"}, đã bỏ qua.`);return}
        seen.add(key);
        const gender=String(get(fields.gender)||"").trim();
        valid.push({name,code,dob:excelDate(get(fields.dob)),gender:/^(nam|n)$/i.test(gender)?"Nam":/^(nu|nữ|f)$/i.test(gender)?"Nữ":gender?"Khác":"",address:String(get(fields.address)||"").trim(),parentName:String(get(fields.parentName)||"").trim(),parentPhone:String(get(fields.parentPhone)||"").trim(),strengths:String(get(fields.strengths)||"").trim(),support:String(get(fields.support)||"").trim(),notes:String(get(fields.notes)||"").trim(),className});
      });
      pendingExcelStudents=valid;
      const preview=$("studentExcelPreview");
      preview.innerHTML=`<div class="preview-summary"><b>Kiểm tra file hoàn tất</b><br>Hợp lệ để nhập: <b>${valid.length}</b> học sinh · Bỏ qua / cần kiểm tra: <b>${errors.length}</b> dòng.<br>Trường: <b>${esc(currentSchool().name)}</b> · Năm học: <b>${esc(currentSchoolYear().label)}</b></div>${errors.length?`<ul class="preview-errors">${errors.slice(0,12).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>${errors.length>12?`<small>Còn ${errors.length-12} dòng lỗi khác.</small>`:""}`:"<p>Không phát hiện dòng trùng hoặc thiếu thông tin bắt buộc.</p>"}${valid.length?'<button class="submit-btn preview-confirm" id="confirmStudentExcel">✓ NHẬP '+valid.length+' HỌC SINH VÀO ỨNG DỤNG</button>':"<p>Không có học sinh hợp lệ để nhập.</p>"}`;
      const confirmBtn=$("confirmStudentExcel");if(confirmBtn)confirmBtn.onclick=commitStudentExcel;
    }catch(err){pendingExcelStudents=[];$("studentExcelPreview").textContent=err.message||"Không đọc được file Excel."}
    $("studentExcelFile").value="";
  };reader.onerror=()=>{$("studentExcelPreview").textContent="Không thể đọc file đã chọn."};reader.readAsArrayBuffer(file);
}
function commitStudentExcel(){
  if(!pendingExcelStudents.length)return;
  if(!confirm(`Nhập ${pendingExcelStudents.length} học sinh vào ${currentSchool().name} – năm học ${currentSchoolYear().label}?`))return;
  let added=0;
  pendingExcelStudents.forEach(item=>{
    let cls=db.classes.find(c=>normalizeExcelText(c.name)===normalizeExcelText(item.className));
    if(!cls){cls={id:uid(),name:item.className};db.classes.push(cls)}
    const code=item.code||String(added+1).padStart(2,"0");
    db.students.push({id:uid(),name:item.name,code,classId:cls.id,schoolId:db.activeSchoolId,schoolYearId:db.activeSchoolYearId,profile:{dob:item.dob,gender:item.gender,address:item.address,parentName:item.parentName,parentPhone:item.parentPhone,strengths:item.strengths,support:item.support,notes:item.notes}});added++;
  });
  pendingExcelStudents=[];$("studentExcelPreview").innerHTML=`<div class="preview-summary">Đã nhập thành công <b>${added}</b> học sinh.</div>`;persist();$("classFilter").value="all";renderStudents();toast(`Đã nhập ${added} học sinh từ Excel`);
}

$("studentExcelFile").addEventListener("change",e=>{const file=e.target.files?.[0];if(file)parseStudentExcel(file)});

function setProfileForm(s){
  const p=s?.profile||{};
  $("newStudentName").value=s?.name||"";$("newStudentCode").value=s?.code||"";
  $("studentDob").value=p.dob||"";$("studentGender").value=p.gender||"";
  $("studentAddress").value=p.address||"";$("studentParent").value=p.parentName||"";
  $("studentParentPhone").value=p.parentPhone||"";$("studentStrengths").value=p.strengths||"";
  $("studentSupport").value=p.support||"";$("studentNotes").value=p.notes||"";
}
function readProfileForm(){return {dob:$("studentDob").value,gender:$("studentGender").value,address:$("studentAddress").value.trim(),parentName:$("studentParent").value.trim(),parentPhone:$("studentParentPhone").value.trim(),strengths:$("studentStrengths").value.trim(),support:$("studentSupport").value.trim(),notes:$("studentNotes").value.trim()}}
$("openAddStudent").onclick=()=>{editingStudentId=null;$("studentModalTitle").textContent="Thêm hồ sơ học sinh";setProfileForm(null);$("studentModal").classList.remove("hidden");$("newStudentName").focus()};
function editStudentProfile(id){const s=db.students.find(x=>x.id===id);if(!s)return;editingStudentId=id;$("studentModalTitle").textContent="Cập nhật hồ sơ học sinh";setProfileForm(s);$("studentModal").classList.remove("hidden");}
function closeStudent(){$("studentModal").classList.add("hidden");editingStudentId=null;setProfileForm(null)}
$("closeStudentModal").onclick=$("cancelStudent").onclick=closeStudent;
$("saveStudent").onclick=()=>{let name=$("newStudentName").value.trim();if(!name)return toast("Nhập họ tên học sinh");let code=$("newStudentCode").value.trim()||String(classStudents().length+1).padStart(2,"0");const profile=readProfileForm(),wasEditing=Boolean(editingStudentId);if(editingStudentId){const s=db.students.find(x=>x.id===editingStudentId);if(!s)return closeStudent();s.name=name;s.code=code;s.profile={...(s.profile||{}),...profile};}else{db.students.push({id:uid(),name,code,classId:db.activeClassId,schoolId:db.activeSchoolId,schoolYearId:db.activeSchoolYearId,profile});}closeStudent();persist();toast(wasEditing?"Đã cập nhật hồ sơ":"Đã thêm học sinh vào "+currentClass().name)};

function automaticComment(m,student){
  const parts=[];
  if(m.average===null)parts.push("Chưa có đủ dữ liệu điểm số trong thời gian thống kê để đánh giá kết quả học tập.");
  else if(m.average>=8.5)parts.push("Em có kết quả học tập nổi bật, cần tiếp tục phát huy tinh thần chủ động và duy trì chất lượng học tập.");
  else if(m.average>=7)parts.push("Em có kết quả học tập khá, nên tiếp tục củng cố kiến thức và duy trì sự ổn định.");
  else if(m.average>=5)parts.push("Em đạt mức kết quả học tập cơ bản; cần tăng cường ôn tập và chủ động hỏi khi chưa hiểu bài.");
  else parts.push("Kết quả học tập còn hạn chế; cần xây dựng kế hoạch ôn tập thường xuyên và nhận thêm hỗ trợ.");
  if(m.v>0)parts.push(`Về nề nếp, em có ${m.v} lượt vi phạm và ${m.n} lượt nhắc nhở; cần nghiêm túc khắc phục và thực hiện tốt nội quy.`);
  else if(m.n>0)parts.push(`Em có ${m.n} lượt nhắc nhở, cần chú ý hơn để duy trì nề nếp ổn định.`);
  else if(m.k>0)parts.push(`Em có ${m.k} lượt được tuyên dương, thể hiện những chuyển biến tích cực.`);
  else parts.push("Tiếp tục duy trì nề nếp và tích cực tham gia các hoạt động của lớp.");
  if(student.profile?.strengths)parts.push("Điểm mạnh ghi nhận: "+student.profile.strengths+".");
  if(student.profile?.support)parts.push("Định hướng hỗ trợ: "+student.profile.support+".");
  return parts.join(" ");
}
function periodLabel(){return $("statsPeriod").selectedOptions[0]?.textContent||"Cả năm học"}
function reportHeader(title,bounds){
  return `<header class="print-header"><h1>${esc(db.schoolName||"Tên trường")}</h1><h2>${esc(title)}</h2><p>Năm học ${esc(db.schoolYear||"")} · ${esc(currentClass().name)} · ${esc(periodLabel())} (${bounds.from} đến ${bounds.to})</p></header>`;
}
function printStudentReport(id){
  const s=db.students.find(x=>x.id===id);if(!s)return;
  const bounds=currentPeriodBounds(),m=getStudentMetrics(s,bounds),p=s.profile||{};
  const grades=m.grades.slice().sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  const gradeRows=grades.map(g=>`<tr><td>${esc(g.date||"")}</td><td>${esc(g.subject||"")}</td><td>${esc(g.kind||"")}</td><td>${Number(g.score).toFixed(1)}</td></tr>`).join("");
  const comment=automaticComment(m,s);
  $("printArea").innerHTML=`<article class="print-sheet">${reportHeader("PHIẾU ĐÁNH GIÁ HỌC SINH",bounds)}
  <section class="print-section"><h3>I. Thông tin học sinh</h3><div class="print-grid">
  <p><b>Họ và tên:</b> ${esc(s.name)}</p><p><b>Mã học sinh:</b> ${esc(s.code||"—")}</p>
  <p><b>Ngày sinh:</b> ${esc(p.dob||"—")}</p><p><b>Giới tính:</b> ${esc(p.gender||"—")}</p>
  <p><b>Địa chỉ:</b> ${esc(p.address||"—")}</p><p><b>Phụ huynh:</b> ${esc(p.parentName||"—")}</p>
  <p><b>Điện thoại:</b> ${esc(p.parentPhone||"—")}</p></div></section>
  <section class="print-section"><h3>II. Kết quả học tập và rèn luyện</h3><table><tr><th>Điểm trung bình</th><th>Số bài điểm</th><th>Khen</th><th>Nhắc</th><th>Vi phạm</th><th>Điểm thi đua</th><th>Xếp loại</th></tr><tr><td>${m.average===null?"—":m.average.toFixed(2)}</td><td>${m.grades.length}</td><td>${m.k}</td><td>${m.n}</td><td>${m.v}</td><td>${m.total===null?"—":m.total.toFixed(1)}</td><td>${esc(m.rating)}</td></tr></table></section>
  <section class="print-section"><h3>III. Nhận xét cuối kỳ / giai đoạn</h3><p>${esc(comment)}</p></section>
  <section class="print-section"><h3>IV. Chi tiết điểm đã ghi nhận</h3><table><tr><th>Ngày</th><th>Môn</th><th>Loại điểm</th><th>Điểm</th></tr>${gradeRows||'<tr><td colspan="4">Chưa có điểm trong giai đoạn này.</td></tr>'}</table></section>
  <section class="print-section"><h3>V. Thông tin bổ sung</h3><p><b>Điểm mạnh:</b> ${esc(p.strengths||"—")}</p><p><b>Nội dung cần hỗ trợ:</b> ${esc(p.support||"—")}</p><p><b>Ghi chú:</b> ${esc(p.notes||"—")}</p></section>
  <div class="signature-row"><div>Giáo viên chủ nhiệm<br><br><br>(Ký và ghi rõ họ tên)</div><div>Phụ huynh học sinh<br><br><br>(Ký và ghi rõ họ tên)</div></div></article>`;
  window.print();
}
function printClassReport(){
  const bounds=currentPeriodBounds(),students=classStudents();
  const rows=students.map(s=>({s,m:getStudentMetrics(s,bounds)})).sort((a,b)=>(b.m.total??-1)-(a.m.total??-1));
  const allGrades=rows.flatMap(x=>x.m.grades),allK=rows.reduce((a,x)=>a+x.m.k,0),allN=rows.reduce((a,x)=>a+x.m.n,0),allV=rows.reduce((a,x)=>a+x.m.v,0);
  const avg=allGrades.length?allGrades.reduce((a,x)=>a+Number(x.score),0)/allGrades.length:null;
  const table=rows.map((x,i)=>`<tr><td>${x.m.total===null?"—":i+1}</td><td>${esc(x.s.code||"")}</td><td>${esc(x.s.name)}</td><td>${x.m.average===null?"—":x.m.average.toFixed(2)}</td><td>${x.m.k}</td><td>${x.m.n}</td><td>${x.m.v}</td><td>${x.m.total===null?"—":x.m.total.toFixed(1)}</td><td>${esc(x.m.rating)}</td></tr>`).join("");
  const ratingCounts={"Xuất sắc":0,"Tốt":0,"Đạt":0,"Cần cố gắng":0,"Chưa đủ dữ liệu":0};rows.forEach(x=>ratingCounts[x.m.rating]=(ratingCounts[x.m.rating]||0)+1);
  $("printArea").innerHTML=`<article class="print-sheet">${reportHeader("BÁO CÁO TỔNG KẾT LỚP",bounds)}
  <section class="print-section"><h3>I. Tổng quan</h3><div class="print-grid"><p><b>Sĩ số:</b> ${students.length} học sinh</p><p><b>Tổng lượt điểm:</b> ${allGrades.length}</p><p><b>Điểm trung bình chung:</b> ${avg===null?"—":avg.toFixed(2)}</p><p><b>Lượt khen:</b> ${allK}</p><p><b>Lượt nhắc:</b> ${allN}</p><p><b>Lượt vi phạm:</b> ${allV}</p></div></section>
  <section class="print-section"><h3>II. Kết quả xếp loại</h3><p>${Object.entries(ratingCounts).map(([k,v])=>`${k}: ${v}`).join(" · ")}</p></section>
  <section class="print-section"><h3>III. Bảng tổng hợp học sinh</h3><table><tr><th>Hạng</th><th>Mã HS</th><th>Họ và tên</th><th>ĐTB</th><th>Khen</th><th>Nhắc</th><th>Vi phạm</th><th>Điểm thi đua</th><th>Xếp loại</th></tr>${table||'<tr><td colspan="9">Lớp chưa có học sinh.</td></tr>'}</table></section>
  <section class="print-section"><h3>IV. Nhận xét chung</h3><p>Lớp có ${students.length} học sinh; dữ liệu thống kê được tổng hợp trong giai đoạn ${bounds.from} đến ${bounds.to}. Giáo viên chủ nhiệm căn cứ thêm vào quá trình học tập, chuyên cần và các minh chứng thực tế để hoàn thiện nhận xét chính thức.</p></section>
  <div class="signature-row"><div>Giáo viên chủ nhiệm<br><br><br>(Ký và ghi rõ họ tên)</div><div>Đại diện nhà trường<br><br><br>(Ký và đóng dấu)</div></div></article>`;
  window.print();
}
$("printClassReport").addEventListener("click",printClassReport);

function moveStudent(id){let s=db.students.find(x=>x.id===id);if(!s)return;let choices=db.classes.filter(c=>c.id!==s.classId);if(!choices.length)return toast("Hãy tạo thêm lớp trước");let menu=choices.map((c,i)=>(i+1)+". "+c.name).join("\\n");let n=prompt("Chuyển "+s.name+" sang lớp nào?\\n"+menu+"\\nNhập số thứ tự:");let target=choices[Number(n)-1];if(target){s.classId=target.id;persist();toast("Đã chuyển học sinh")}}
function removeStudent(id){if(!confirm("Xóa học sinh này và toàn bộ điểm, ghi nhận liên quan?"))return;db.students=db.students.filter(s=>s.id!==id);db.grades=db.grades.filter(x=>x.studentId!==id);db.behaviors=db.behaviors.filter(x=>x.studentId!==id);persist()}
function removeRecord(type,id){if(!confirm("Xóa bản ghi này?"))return;db[type]=db[type].filter(x=>x.id!==id);persist()}
function validSchoolYear(value){return /^(20\d{2})\s*[-–/]\s*(20\d{2})$/.test(value)}
function openSchoolManager(){$("newSchoolName").value="";$("newSchoolYear").value=currentSchoolYear().label;$("appendSchoolYear").value="";renderSchoolManager();$("schoolModal").classList.remove("hidden")}
function renderSchoolManager(){
  $("schoolManageList").innerHTML=db.schools.map(s=>`<div class="class-item"><div><b>${esc(s.name)}</b><small>${s.years.length} năm học · ${s.years.map(y=>esc(y.label)).join(", ")}</small></div><button class="plain-btn" onclick="selectSchoolForManage('${s.id}')">Chọn</button></div>`).join("");
}
function selectSchoolForManage(id){if(!db.schools.some(s=>s.id===id))return;db.activeSchoolId=id;db.activeSchoolYearId=currentSchool().years[0].id;persist();renderSchoolManager();toast("Đã chọn "+currentSchool().name)}
$("manageSchools").onclick=openSchoolManager;
$("closeSchoolModal").onclick=()=>$("schoolModal").classList.add("hidden");
$("addSchool").onclick=()=>{
  const name=$("newSchoolName").value.trim(),year=$("newSchoolYear").value.trim();
  if(!name)return toast("Nhập tên trường");
  if(!validSchoolYear(year))return toast("Năm học theo dạng 2026-2027");
  if(db.schools.some(s=>s.name.toLocaleLowerCase("vi")===name.toLocaleLowerCase("vi")))return toast("Trường đã tồn tại");
  const school={id:uid(),name,years:[{id:uid(),label:year}]};db.schools.push(school);db.activeSchoolId=school.id;db.activeSchoolYearId=school.years[0].id;persist();renderSchoolManager();toast("Đã thêm trường "+name);
};
$("addSchoolList").onclick=()=>{
  const raw=$("bulkSchoolNames").value;
  const year=$("bulkSchoolYear").value.trim();
  if(!validSchoolYear(year))return toast("Năm học theo dạng 2026-2027");
  const names=[...new Set(raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean))];
  if(!names.length)return toast("Nhập ít nhất một tên trường, mỗi dòng một trường");
  const existing=new Set(db.schools.map(s=>s.name.trim().toLocaleLowerCase("vi")));
  const added=[];const skipped=[];
  names.forEach(name=>{
    const key=name.toLocaleLowerCase("vi");
    if(existing.has(key)){skipped.push(name);return;}
    const school={id:uid(),name,years:[{id:uid(),label:year}]};
    db.schools.push(school);existing.add(key);added.push(school);
  });
  if(added.length){db.activeSchoolId=added[0].id;db.activeSchoolYearId=added[0].years[0].id;persist();}
  renderSchoolManager();
  $("bulkSchoolNames").value="";
  const message=added.length?`Đã tạo ${added.length} trường${skipped.length?`; bỏ qua ${skipped.length} trường đã tồn tại`:""}`:("Không có trường mới; các tên nhập vào đã tồn tại");
  toast(message);
};
$("addSchoolYear").onclick=()=>{
  const value=$("appendSchoolYear").value.trim(),school=currentSchool();
  if(!validSchoolYear(value))return toast("Năm học theo dạng 2026-2027");
  if(school.years.some(y=>y.label===value))return toast("Năm học này đã có");
  const year={id:uid(),label:value};school.years.push(year);db.activeSchoolYearId=year.id;$("appendSchoolYear").value="";persist();renderSchoolManager();toast("Đã thêm năm học "+value);
};
$("activeSchool").addEventListener("change",()=>{
  db.activeSchoolId=$("activeSchool").value;db.activeSchoolYearId=currentSchool().years[0].id;persist();
});
$("activeSchoolYear").addEventListener("change",()=>{db.activeSchoolYearId=$("activeSchoolYear").value;persist()});
$("classSettings").onclick=()=>{$("classModal").classList.remove("hidden");$("classNameInput").value=""};
function closeClass(){$("classModal").classList.add("hidden")}
$("closeClassModal").onclick=closeClass;
$("addClass").onclick=()=>{let name=$("classNameInput").value.trim();if(!name)return toast("Nhập tên lớp");if(db.classes.some(c=>c.name.toLowerCase()===name.toLowerCase()))return toast("Tên lớp đã tồn tại");let c={id:uid(),name};db.classes.push(c);db.activeClassId=c.id;$("classNameInput").value="";persist();toast("Đã tạo lớp "+name)};
function renameClass(id){let c=db.classes.find(x=>x.id===id);if(!c)return;let name=prompt("Tên lớp mới:",c.name);if(!name||!name.trim())return;if(db.classes.some(x=>x.id!==id&&x.name.toLowerCase()===name.trim().toLowerCase()))return toast("Tên lớp đã tồn tại");c.name=name.trim();persist();toast("Đã đổi tên lớp")}
function deleteClass(id){let c=db.classes.find(x=>x.id===id);if(!c)return;if(db.students.some(s=>s.classId===id))return alert("Lớp vẫn còn học sinh. Hãy chuyển học sinh sang lớp khác trước.");if(db.classes.length===1)return alert("Phải giữ lại ít nhất một lớp.");if(!confirm("Xóa lớp "+c.name+"?"))return;db.classes=db.classes.filter(x=>x.id!==id);db.timetables=db.timetables.filter(t=>t.classId!==id);db.timetableImages=db.timetableImages.filter(img=>img.classId!==id);if(db.activeClassId===id)db.activeClassId=db.classes[0].id;persist()}
function exportTxt(){let p={app:"Smart Class Quick",version:3,exportedAt:new Date().toISOString(),data:db};let blob=new Blob(["SMART CLASS QUICK BACKUP\\n"+JSON.stringify(p,null,2)],{type:"text/plain;charset=utf-8"});let url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SmartClass_"+today()+".txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Đã xuất file TXT")}
$("exportBtn").onclick=exportTxt;
$("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let p=JSON.parse(String(r.result).replace(/^SMART CLASS QUICK BACKUP\\s*/,""));let d=p.data||p;if(!Array.isArray(d.students)||!Array.isArray(d.grades)||!Array.isArray(d.behaviors))throw 0;if(!confirm("Nhập file sẽ thay thế dữ liệu hiện tại. Tiếp tục?"))return;db={...d,classes:d.classes,activeClassId:d.activeClassId};ensureSchema();persist();toast("Đã khôi phục dữ liệu")}catch(e){alert("File TXT không đúng định dạng Smart Class Quick.")}e.target.value=""};r.readAsText(f,"UTF-8")};

// --- THỜI KHÓA BIỂU THEO LỚP, TRƯỜNG, NĂM HỌC ---
const DAY_NAMES={2:"Thứ 2",3:"Thứ 3",4:"Thứ 4",5:"Thứ 5",6:"Thứ 6",7:"Thứ 7"};
function todayDayNum(){const d=new Date().getDay();return d===0?8:d+1}
function classTimetableSlots(){
  return db.timetables.filter(t=>t.schoolId===db.activeSchoolId&&t.schoolYearId===db.activeSchoolYearId&&t.classId===db.activeClassId);
}
function renderTimetable(){
  const container=$("timetableClassicContainer");
  if(!container)return;
  const school=currentSchool(),year=currentSchoolYear(),cls=currentClass();
  const unitLabel=`${cls.name} · ${year.label}`;
  const fullLabel=`${school.name} · Lớp ${cls.name} (${year.label})`;
  if($("timetableUnitBadge"))$("timetableUnitBadge").textContent=unitLabel;
  if($("timetableContextTitle"))$("timetableContextTitle").textContent=fullLabel;

  const todayNum=todayDayNum();
  document.querySelectorAll("#timetableDayPills .day-pill").forEach(btn=>{
    const d=btn.dataset.day;
    btn.classList.toggle("active",d===String(selectedTimetableDay));
    btn.classList.toggle("is-today",Number(d)===todayNum);
  });

  const allSlots=classTimetableSlots();
  const daysToShow=selectedTimetableDay==="all"?[2,3,4,5,6,7]:[Number(selectedTimetableDay)];

  if(!allSlots.length&&selectedTimetableDay==="all"){
    container.innerHTML=`<div class="tt-empty-state">
      <b>Chưa có thời khóa biểu cho lớp ${esc(cls.name)}</b>
      <p>Thiết lập thời khóa biểu riêng cho <b>${esc(school.name)}</b> – năm học <b>${esc(year.label)}</b> để tra cứu nhanh ngay trên điện thoại.</p>
      <button type="button" class="submit-btn" onclick="openTimetableModal()">＋ TẠO TIẾT HỌC ĐẦU TIÊN</button>
    </div>`;
    renderTimetableImage();
    return;
  }

  container.innerHTML=daysToShow.map(day=>{
    const isToday=day===todayNum;
    const daySlots=allSlots.filter(t=>Number(t.day)===day);
    const sessions=["Sáng","Chiều"].map(sess=>{
      const rows=daySlots.filter(t=>(t.session||"Sáng")===sess).sort((a,b)=>Number(a.period)-Number(b.period));
      if(!rows.length)return "";
      const trs=rows.map(item=>{
        const meta=[];
        if(item.teacher)meta.push(`<span>GV: ${esc(item.teacher)}</span>`);
        if(item.room)meta.push(`<span>Phòng: ${esc(item.room)}</span>`);
        if(item.note)meta.push(`<span>${esc(item.note)}</span>`);
        return `<tr class="tt-row" onclick="openTimetableModal('${esc(item.id)}')">
          <td class="tt-col-period">
            <span class="tt-period-num">Tiết ${esc(item.period)}</span>
            ${item.time?`<span class="tt-period-time">${esc(item.time)}</span>`:""}
          </td>
          <td class="tt-col-main">
            <span class="tt-subject">${esc(item.subject)}</span>
            ${meta.length?`<div class="tt-meta">${meta.join(" · ")}</div>`:""}
          </td>
          <td class="tt-col-action" aria-label="Chỉnh sửa">✎</td>
        </tr>`;
      }).join("");
      return `<div class="tt-session-group">
        <div class="tt-session-label">Buổi ${sess}</div>
        <table class="tt-table"><tbody>${trs}</tbody></table>
      </div>`;
    }).join("");

    return `<article class="tt-day-card${isToday?" is-today":""}">
      <div class="tt-day-header">
        <div class="tt-day-title">
          <b>${DAY_NAMES[day]}</b>
          ${isToday?'<span class="tt-today-tag">Hôm nay</span>':""}
        </div>
        <button type="button" class="tt-day-add" onclick="openTimetableModal(null, ${day})">＋ Thêm tiết</button>
      </div>
      ${sessions||`<div class="tt-empty-day">Chưa có tiết học nào trong ${DAY_NAMES[day]}.</div>`}
    </article>`;
  }).join("");
  renderTimetableImage();
}

function openTimetableModal(id=null,defaultDay=null){
  editingTimetableId=id;
  const item=id?db.timetables.find(t=>t.id===id):null;
  $("timetableModalTitle").textContent=item?"Chỉnh sửa tiết học":"Thêm tiết học";
  $("ttDay").value=String(item?item.day:(defaultDay||(selectedTimetableDay!=="all"?selectedTimetableDay:(todayDayNum()<=7?todayDayNum():2))));
  $("ttSession").value=item?.session||"Sáng";
  if(item){
    $("ttPeriod").value=String(item.period||1);
  }else{
    const d=Number($("ttDay").value),sess=$("ttSession").value;
    const used=classTimetableSlots().filter(t=>Number(t.day)===d&&(t.session||"Sáng")===sess).map(t=>Number(t.period));
    const nextPeriod=[1,2,3,4,5].find(p=>!used.includes(p))||1;
    $("ttPeriod").value=String(nextPeriod);
  }
  $("ttTime").value=item?.time||"";
  $("ttSubject").value=item?.subject||"";
  $("ttTeacher").value=item?.teacher||"";
  $("ttRoom").value=item?.room||"";
  $("ttNote").value=item?.note||"";
  $("deleteTimetableSlot").classList.toggle("hidden",!item);
  $("timetableModal").classList.remove("hidden");
  setTimeout(()=>$("ttSubject").focus(),60);
}
function closeTimetableModal(){
  $("timetableModal").classList.add("hidden");
  editingTimetableId=null;
}
$("openAddTimetable").onclick=()=>openTimetableModal();
$("closeTimetableModal").onclick=$("cancelTimetable").onclick=closeTimetableModal;
$("timetableDayPills").addEventListener("click",e=>{
  const btn=e.target.closest("[data-day]");
  if(!btn)return;
  selectedTimetableDay=btn.dataset.day;
  renderTimetable();
});
$("saveTimetable").onclick=()=>{
  const subject=$("ttSubject").value.trim();
  if(!subject)return toast("Nhập tên môn học hoặc hoạt động");
  const day=Number($("ttDay").value)||2;
  const session=$("ttSession").value==="Chiều"?"Chiều":"Sáng";
  const period=Number($("ttPeriod").value)||1;
  const time=$("ttTime").value.trim();
  const teacher=$("ttTeacher").value.trim();
  const room=$("ttRoom").value.trim();
  const note=$("ttNote").value.trim();

  const duplicate=classTimetableSlots().find(t=>t.id!==editingTimetableId&&Number(t.day)===day&&(t.session||"Sáng")===session&&Number(t.period)===period);
  if(duplicate){
    if(!confirm(`${DAY_NAMES[day]} (${session} - Tiết ${period}) đã có môn "${duplicate.subject}". Bạn muốn ghi đè bằng "${subject}" không?`))return;
    db.timetables=db.timetables.filter(t=>t.id!==duplicate.id);
  }

  if(editingTimetableId){
    const existing=db.timetables.find(t=>t.id===editingTimetableId);
    if(existing){
      Object.assign(existing,{day,session,period,time,subject,teacher,room,note});
    }
    toast("Đã cập nhật tiết học");
  }else{
    db.timetables.push({
      id:uid(),
      schoolId:db.activeSchoolId,
      schoolYearId:db.activeSchoolYearId,
      classId:db.activeClassId,
      day,session,period,time,subject,teacher,room,note
    });
    toast("Đã thêm tiết học");
  }
  closeTimetableModal();
  persist();
};
$("deleteTimetableSlot").onclick=()=>{
  if(!editingTimetableId)return;
  const item=db.timetables.find(t=>t.id===editingTimetableId);
  if(!item)return closeTimetableModal();
  if(!confirm(`Xóa tiết "${item.subject}" (${DAY_NAMES[item.day]} - ${item.session} tiết ${item.period})?`))return;
  db.timetables=db.timetables.filter(t=>t.id!==editingTimetableId);
  closeTimetableModal();
  persist();
  toast("Đã xóa tiết học");
};
$("clearTimetableBtn").onclick=()=>{
  const slots=classTimetableSlots();
  if(!slots.length)return toast("Lớp này chưa có thời khóa biểu");
  if(!confirm(`Xóa toàn bộ ${slots.length} tiết học của lớp ${currentClass().name} (${currentSchoolYear().label})?`))return;
  db.timetables=db.timetables.filter(t=>!(t.schoolId===db.activeSchoolId&&t.schoolYearId===db.activeSchoolYearId&&t.classId===db.activeClassId));
  persist();
  toast("Đã xóa thời khóa biểu lớp "+currentClass().name);
};
$("copyTimetableBtn").onclick=()=>{
  const groups=new Map();
  db.timetables.forEach(t=>{
    if(t.schoolId===db.activeSchoolId&&t.schoolYearId===db.activeSchoolYearId&&t.classId===db.activeClassId)return;
    const key=`${t.schoolId}|${t.schoolYearId}|${t.classId}`;
    if(!groups.has(key)){
      const sch=db.schools.find(s=>s.id===t.schoolId)?.name||"Trường";
      const yr=db.schools.find(s=>s.id===t.schoolId)?.years.find(y=>y.id===t.schoolYearId)?.label||"";
      const cl=db.classes.find(c=>c.id===t.classId)?.name||"Lớp";
      groups.set(key,{key,label:`Lớp ${cl} · ${sch} (${yr})`,count:0});
    }
    groups.get(key).count++;
  });
  const list=[...groups.values()];
  if(!list.length)return toast("Chưa có thời khóa biểu ở lớp/năm học khác để sao chép");
  $("copyTargetLabel").textContent=`Lớp ${currentClass().name} (${currentSchoolYear().label})`;
  $("copySourceSelect").innerHTML=list.map(g=>`<option value="${esc(g.key)}">${esc(g.label)} (${g.count} tiết)</option>`).join("");
  $("copyTimetableModal").classList.remove("hidden");
};
$("closeCopyTimetableModal").onclick=$("cancelCopyTimetable").onclick=()=>$("copyTimetableModal").classList.add("hidden");
$("confirmCopyTimetable").onclick=()=>{
  const val=$("copySourceSelect").value;
  if(!val)return;
  const [srcSchoolId,srcYearId,srcClassId]=val.split("|");
  const sourceSlots=db.timetables.filter(t=>t.schoolId===srcSchoolId&&t.schoolYearId===srcYearId&&t.classId===srcClassId);
  if(!sourceSlots.length)return toast("Nguồn không có dữ liệu");
  const currentCount=classTimetableSlots().length;
  if(currentCount&&!confirm(`Lớp ${currentClass().name} đang có ${currentCount} tiết. Sao chép sẽ thay thế toàn bộ thời khóa biểu hiện tại. Tiếp tục?`))return;
  db.timetables=db.timetables.filter(t=>!(t.schoolId===db.activeSchoolId&&t.schoolYearId===db.activeSchoolYearId&&t.classId===db.activeClassId));
  sourceSlots.forEach(t=>{
    db.timetables.push({...t,id:uid(),schoolId:db.activeSchoolId,schoolYearId:db.activeSchoolYearId,classId:db.activeClassId});
  });
  $("copyTimetableModal").classList.add("hidden");
  persist();
  toast(`Đã sao chép ${sourceSlots.length} tiết học`);
};


// --- HÌNH ẢNH THỜI KHÓA BIỂU ---
function currentTimetableImage(){
  return db.timetableImages.find(x=>x.schoolId===db.activeSchoolId&&x.schoolYearId===db.activeSchoolYearId&&x.classId===db.activeClassId)||null;
}
function renderTimetableImage(){
  const box=$("timetableImageContainer");
  if(!box)return;
  const imgObj=currentTimetableImage();
  const uploadBtn=document.querySelector(".tt-img-upload-btn");
  if(uploadBtn){
    const input=$("timetableImageInput");
    uploadBtn.childNodes[0].textContent=imgObj?"↻ Đổi hình ảnh TKB ":"＋ Thêm hình ảnh TKB ";
  }
  if(!imgObj||!imgObj.dataUrl){
    box.innerHTML=`<div class="tt-image-empty">Chưa có ảnh thời khóa biểu cho lớp <b>${esc(currentClass().name)}</b>. Nhấn <b>＋ Thêm hình ảnh TKB</b> để tải ảnh từ điện thoại hoặc máy tính.</div>`;
    return;
  }
  box.innerHTML=`<div class="tt-image-box">
    <img class="tt-image-frame" src="${imgObj.dataUrl}" alt="Ảnh thời khóa biểu lớp ${esc(currentClass().name)}" onclick="openTtLightbox()">
    <div class="tt-image-bar">
      <span class="tt-image-caption">${esc(imgObj.name||"Ảnh thời khóa biểu")} · Cập nhật ${esc(imgObj.updatedAt||"")}</span>
      <div class="tt-image-actions">
        <button type="button" class="plain-btn" onclick="openTtLightbox()">🔍 Phóng to</button>
        <button type="button" class="plain-btn danger-link" onclick="deleteTimetableImage()">Xóa ảnh</button>
      </div>
    </div>
  </div>`;
}
function compressTimetableImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Không đọc được file ảnh."));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("File không phải hình ảnh hợp lệ."));
      img.onload=()=>{
        const maxSide=1400;
        let w=img.width,h=img.height;
        if(w>maxSide||h>maxSide){
          if(w>=h){h=Math.round(h*maxSide/w);w=maxSide;}
          else{w=Math.round(w*maxSide/h);h=maxSide;}
        }
        const canvas=document.createElement("canvas");
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext("2d");
        ctx.fillStyle="#ffffff";
        ctx.fillRect(0,0,w,h);
        ctx.drawImage(img,0,0,w,h);
        let quality=0.82;
        let dataUrl=canvas.toDataURL("image/jpeg",quality);
        while(dataUrl.length>480000&&quality>0.45){
          quality-=0.1;
          dataUrl=canvas.toDataURL("image/jpeg",quality);
        }
        resolve(dataUrl);
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}
$("timetableImageInput").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  e.target.value="";
  if(!file)return;
  try{
    toast("Đang xử lý ảnh...");
    const dataUrl=await compressTimetableImage(file);
    db.timetableImages=db.timetableImages.filter(x=>!(x.schoolId===db.activeSchoolId&&x.schoolYearId===db.activeSchoolYearId&&x.classId===db.activeClassId));
    db.timetableImages.push({
      id:uid(),
      schoolId:db.activeSchoolId,
      schoolYearId:db.activeSchoolYearId,
      classId:db.activeClassId,
      name:file.name||"TKB.jpg",
      dataUrl,
      updatedAt:new Date().toLocaleDateString("vi-VN")
    });
    persist();
    toast("Đã chèn hình ảnh thời khóa biểu");
  }catch(err){
    toast(err.message||"Không thể tải hình ảnh");
  }
});
function deleteTimetableImage(){
  if(!currentTimetableImage())return;
  if(!confirm("Xóa hình ảnh thời khóa biểu của lớp "+currentClass().name+"?"))return;
  db.timetableImages=db.timetableImages.filter(x=>!(x.schoolId===db.activeSchoolId&&x.schoolYearId===db.activeSchoolYearId&&x.classId===db.activeClassId));
  persist();
  toast("Đã xóa hình ảnh TKB");
}
function openTtLightbox(){
  const imgObj=currentTimetableImage();
  if(!imgObj)return;
  $("ttLightboxTitle").textContent=`TKB Lớp ${currentClass().name} · ${currentSchoolYear().label}`;
  $("ttLightboxImg").src=imgObj.dataUrl;
  $("ttImageLightbox").classList.remove("hidden");
}
function closeTtLightbox(){
  $("ttImageLightbox").classList.add("hidden");
  $("ttLightboxImg").src="";
}

load();
