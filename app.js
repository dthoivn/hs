const KEY="smartclass_quick_teacher_v1";
let db={schoolName:"",schoolYear:"2026-2027",schools:[],activeSchoolId:"",activeSchoolYearId:"",classes:[{id:"class_default",name:"Lớp học của tôi"}],activeClassId:"class_default",students:[],grades:[],behaviors:[]};
let selectedType="Khen",selectedScore=null,editingStudentId=null;
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
  $("classFilter").innerHTML='<option value="all">Tất cả lớp</option>'+db.classes.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");
  $("classFilter").value=db.activeClassId;
  $("classLabel").textContent=[db.schoolName,currentClass().name,db.schoolYear].filter(Boolean).join(" · ");
}
function renderAll(){fillSelects();renderStudents();renderBehaviorFeed();renderGradeFeed();renderClassList();renderStats();renderRanking();renderProgress();$("behaviorTodayCount").textContent=db.behaviors.filter(x=>x.date===today()&&schoolStudents().some(s=>s.id===x.studentId)).length+" hôm nay";$("gradeTodayCount").textContent=db.grades.filter(x=>x.date===today()&&schoolStudents().some(s=>s.id===x.studentId)).length+" điểm hôm nay"}

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
function renderBehaviorFeed(){let activeIds=new Set(schoolStudents().map(s=>s.id));let arr=db.behaviors.filter(x=>activeIds.has(x.studentId)).slice(0,12);$("behaviorFeed").innerHTML=arr.map(x=>{let cls=x.type==="Khen"?"":x.type==="Nhắc"?"remind":"negative";return `<div class="feed-item"><div class="feed-mark ${cls}">${x.type==="Khen"?"✓":x.type==="Nhắc"?"!":"×"}</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.type)} · ${esc(x.note||"Đã ghi nhận")} · ${esc(x.time||"")}</small></div><button class="delete-btn" onclick="removeRecord('behaviors','${x.id}')">×</button></div>`}).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có ghi nhận</b><small>Chọn học sinh và chạm một nút nề nếp để nhập nhanh.</small></div></div>'}
function renderGradeFeed(){let activeIds=new Set(schoolStudents().map(s=>s.id));let arr=db.grades.filter(x=>activeIds.has(x.studentId)).slice(0,12);$("gradeFeed").innerHTML=arr.map(x=>`<div class="feed-item"><div class="feed-mark" style="background:#edf1ff;color:#3f63dc">▤</div><div class="feed-main"><b>${esc(nameOf(x.studentId))}</b><small>${esc(x.subject)} · ${esc(x.kind)} · ${esc(x.time||"")}</small></div><strong class="feed-score">${Number(x.score).toFixed(1)}</strong><button class="delete-btn" onclick="removeRecord('grades','${x.id}')">×</button></div>`).join("")||'<div class="feed-item"><div class="feed-main"><b>Chưa có điểm</b><small>Chọn học sinh, môn học và chạm mức điểm.</small></div></div>'}
function renderClassList(){
  $("classList").innerHTML=db.classes.map(c=>{let count=db.students.filter(s=>s.classId===c.id).length;return `<div class="class-item"><div><b>${esc(c.name)}</b><small>${count} học sinh</small></div><button class="plain-btn" onclick="renameClass('${c.id}')">Đổi tên</button><button class="plain-btn" onclick="deleteClass('${c.id}')">Xóa</button></div>`}).join("");
}
$("classFilter").onchange=()=>{let v=$("classFilter").value;if(v!=="all"){db.activeClassId=v;persist()}else renderStudents()};
$("behaviorTypes").addEventListener("click",e=>{let b=e.target.closest("[data-type]");if(!b)return;selectedType=b.dataset.type;document.querySelectorAll(".type-btn").forEach(x=>x.classList.toggle("selected",x===b))});
$("addBehavior").onclick=()=>{let sid=$("behaviorStudent").value;if(!sid)return toast("Hãy thêm học sinh vào lớp trước");db.behaviors.unshift({id:uid(),studentId:sid,type:selectedType,note:$("behaviorText").value.trim(),date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("behaviorText").value="";persist();toast("Đã ghi nhận "+selectedType.toLowerCase())};
$("scorePad").addEventListener("click",e=>{let b=e.target.closest("[data-score]");if(!b)return;selectedScore=Number(b.dataset.score);document.querySelectorAll("#scorePad button").forEach(x=>x.classList.toggle("selected",x===b));$("chosenScore").textContent=selectedScore});
$("clearScore").onclick=()=>{selectedScore=null;$("chosenScore").textContent="—";document.querySelectorAll("#scorePad button").forEach(x=>x.classList.remove("selected"))};
$("addGrade").onclick=()=>{let sid=$("gradeStudent").value,sub=$("gradeSubject").value.trim();if(!sid)return toast("Hãy thêm học sinh vào lớp trước");if(!sub)return toast("Nhập tên môn học");if(selectedScore===null)return toast("Chọn mức điểm");db.grades.unshift({id:uid(),studentId:sid,subject:sub,kind:$("gradeKind").value,score:selectedScore,date:today(),time:new Date().toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"})});$("clearScore").click();persist();toast("Đã lưu điểm "+selectedScore)};
$("studentSearch").oninput=renderStudents;
$("statsPeriod").addEventListener("change",()=>{renderStats();renderRanking();renderProgress()});
$("progressStudent").addEventListener("change",renderProgress);
$("exportExcel").addEventListener("click",exportExcel);
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
function deleteClass(id){let c=db.classes.find(x=>x.id===id);if(!c)return;if(db.students.some(s=>s.classId===id))return alert("Lớp vẫn còn học sinh. Hãy chuyển học sinh sang lớp khác trước.");if(db.classes.length===1)return alert("Phải giữ lại ít nhất một lớp.");if(!confirm("Xóa lớp "+c.name+"?"))return;db.classes=db.classes.filter(x=>x.id!==id);if(db.activeClassId===id)db.activeClassId=db.classes[0].id;persist()}
function exportTxt(){let p={app:"Smart Class Quick",version:3,exportedAt:new Date().toISOString(),data:db};let blob=new Blob(["SMART CLASS QUICK BACKUP\\n"+JSON.stringify(p,null,2)],{type:"text/plain;charset=utf-8"});let url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="SmartClass_"+today()+".txt";a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);toast("Đã xuất file TXT")}
$("exportBtn").onclick=exportTxt;
$("importFile").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let p=JSON.parse(String(r.result).replace(/^SMART CLASS QUICK BACKUP\\s*/,""));let d=p.data||p;if(!Array.isArray(d.students)||!Array.isArray(d.grades)||!Array.isArray(d.behaviors))throw 0;if(!confirm("Nhập file sẽ thay thế dữ liệu hiện tại. Tiếp tục?"))return;db={...d,classes:d.classes,activeClassId:d.activeClassId};ensureSchema();persist();toast("Đã khôi phục dữ liệu")}catch(e){alert("File TXT không đúng định dạng Smart Class Quick.")}e.target.value=""};r.readAsText(f,"UTF-8")};
load();
