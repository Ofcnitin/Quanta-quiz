const API_URL = localStorage.getItem("quanta_api_url") || "YOUR_WORKER_URL";

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={mode:"topic",difficulty:"Easy",count:10,pdfText:"",source:"",quiz:null,answers:[],current:0};

$("#topicInput").addEventListener("input",e=>$("#topicCount").textContent=`${e.target.value.length} / 200`);
$$(".mode").forEach(b=>b.onclick=()=>{state.mode=b.dataset.mode;$$(".mode").forEach(x=>x.classList.toggle("active",x===b));$(".mode-switch").classList.toggle("pdf-mode",state.mode==="pdf");$("#topicPane").classList.toggle("hidden",state.mode!=="topic");$("#pdfPane").classList.toggle("hidden",state.mode!=="pdf");$("#sourceLabel").textContent=state.mode==="topic"?"What do you want to learn?":"Add your source material"});
$$(".seg").forEach(b=>b.onclick=()=>{$$(".seg").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.difficulty=b.dataset.value});
$("#questionCount").onchange=e=>state.count=Number(e.target.value);

const dz=$("#dropzone"),pi=$("#pdfInput");
["dragenter","dragover"].forEach(x=>dz.addEventListener(x,e=>{e.preventDefault();dz.classList.add("drag")}));
["dragleave","drop"].forEach(x=>dz.addEventListener(x,e=>{e.preventDefault();dz.classList.remove("drag")}));
dz.addEventListener("drop",e=>e.dataTransfer.files[0]&&loadPdf(e.dataTransfer.files[0]));pi.onchange=e=>e.target.files[0]&&loadPdf(e.target.files[0]);

async function loadPdf(file){
  if(file.type!=="application/pdf")return toast("Please choose a PDF file.");
  if(file.size>20*1024*1024)return toast("PDF is larger than 20 MB.");
  $("#fileName").textContent=file.name;$("#fileMeta").textContent="Reading PDF…";
  try{
    const pdfjs=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.mjs";
    const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
    if(pdf.numPages>50)return toast("Please use a PDF with 50 pages or fewer.");
    const pages=[];
    for(let i=1;i<=pdf.numPages;i++){const c=await (await pdf.getPage(i)).getTextContent();pages.push(c.items.map(x=>x.str).join(" "))}
    state.pdfText=pages.join("\n\n");
    if(state.pdfText.trim().length<80)return toast("This PDF has little or no selectable text.");
    $("#fileMeta").textContent=`${pdf.numPages} pages · ${state.pdfText.length.toLocaleString()} characters extracted`;
  }catch(e){console.error(e);toast("Couldn't read that PDF in this browser.")}
}
$("#generateBtn").onclick=generateQuiz;

async function generateQuiz(){
  state.source=state.mode==="topic"?$("#topicInput").value.trim():$("#fileName").textContent;
  if(state.mode==="topic"&&(state.source.length<3||state.source.length>200))return toast("Enter a topic between 3 and 200 characters.");
  if(state.mode==="pdf"&&!state.pdfText)return toast("Upload a readable PDF first.");
  if(API_URL.includes("YOUR_WORKER_URL"))return toast("Connect the Worker URL in app.js first.");
  showLoading(true);
  try{
    const body={mode:state.mode,topic:state.mode==="topic"?state.source:"",documentText:state.mode==="pdf"?compress(state.pdfText):"",difficulty:state.difficulty,count:state.count};
    const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
    const data=await r.json();if(!r.ok)throw Error(data.error||"Generation failed.");
    validate(data);state.quiz=data;state.answers=Array(data.questions.length).fill(null);state.current=0;
    $("#homeView").classList.add("hidden");$("#resultsView").classList.add("hidden");$("#quizView").classList.remove("hidden");renderQuiz();
  }catch(e){console.error(e);toast(e.message)}finally{showLoading(false)}
}
function compress(t){if(t.length<=48000)return t;const p=t.match(/[\s\S]{1,6000}/g)||[];return p.filter((_,i)=>i<8||i%3===0).join("\n\n--- CHUNK ---\n\n").slice(0,48000)}
function validate(d){if(!d?.questions?.length)throw Error("AI returned no questions.");d.questions.forEach((q,i)=>{if(!q.question||q.options?.length!==4||!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>3||!q.explanation)throw Error(`Question ${i+1} has an invalid structure.`)})}

function renderQuiz(){
  const q=state.quiz.questions[state.current];$("#quizTitle").textContent=state.mode==="topic"?state.source:"PDF Quiz";
  $("#questionNumber").textContent=`QUESTION ${String(state.current+1).padStart(2,"0")}`;$("#difficultyBadge").textContent=state.difficulty.toUpperCase();
  $("#questionText").textContent=q.question;$("#progressText").textContent=`${state.current+1} / ${state.quiz.questions.length}`;$("#progressBar").style.width=`${(state.current+1)/state.quiz.questions.length*100}%`;
  $("#nextBtn").textContent=state.current===state.quiz.questions.length-1?"Finish →":"Next →";$("#nextBtn").disabled=state.answers[state.current]===null;
  $("#options").innerHTML=q.options.map((o,i)=>`<button class="option ${state.answers[state.current]===i?"selected":""}" data-i="${i}"><span class="option-index">${String.fromCharCode(65+i)}</span><span>${esc(o)}</span></button>`).join("");
  $$(".option").forEach(b=>b.onclick=()=>{state.answers[state.current]=Number(b.dataset.i);renderQuiz()});
  $("#questionRail").innerHTML=state.quiz.questions.map((_,i)=>`<button class="rail-q ${i===state.current?"active":""} ${state.answers[i]!==null?"done":""}" data-q="${i}">${String(i+1).padStart(2,"0")}</button>`).join("");
  $$(".rail-q").forEach(b=>b.onclick=()=>{state.current=Number(b.dataset.q);renderQuiz()});
}
$("#nextBtn").onclick=()=>{if(state.current<state.quiz.questions.length-1){state.current++;renderQuiz()}else showResults()};
$("#backBtn").onclick=()=>confirm("Leave this quiz? Your answers will be cleared.")&&reset();
$("#retakeBtn").onclick=()=>{state.answers=Array(state.quiz.questions.length).fill(null);state.current=0;$("#resultsView").classList.add("hidden");$("#quizView").classList.remove("hidden");renderQuiz()};
$("#reviewBtn").onclick=()=>$("#reviewList").classList.toggle("hidden");

function showResults(){
  $("#quizView").classList.add("hidden");$("#resultsView").classList.remove("hidden");const qs=state.quiz.questions;
  const correct=qs.reduce((n,q,i)=>n+(state.answers[i]===q.correctIndex),0),pct=Math.round(correct/qs.length*100);
  $("#scoreNumber").textContent=`${pct}%`;$("#correctStat").textContent=correct;$("#wrongStat").textContent=qs.length-correct;$("#totalStat").textContent=qs.length;
  $("#resultHeading").textContent=pct>=90?"Excellent work.":pct>=70?"Solid understanding.":pct>=50?"Good start.":"Keep going.";
  $("#resultSub").textContent=`You got ${correct} of ${qs.length} questions correct.`;
  $("#reviewList").innerHTML=qs.map((q,i)=>{const ok=state.answers[i]===q.correctIndex;return `<article class="review-item glass"><h4>${i+1}. ${esc(q.question)}</h4><div class="review-answer ${ok?"correct":"wrong"}">${ok?"✓ Correct":"✕ Your answer: "+esc(q.options[state.answers[i]]||"Not answered")}</div><div class="review-answer correct">Correct answer: ${esc(q.options[q.correctIndex])}</div><p class="review-explain">${esc(q.explanation)}</p></article>`}).join("");
  window.scrollTo({top:0,behavior:"smooth"});
}
function reset(){state.quiz=null;state.answers=[];$("#quizView").classList.add("hidden");$("#resultsView").classList.add("hidden");$("#homeView").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"})}
function showLoading(v){$("#loadingOverlay").classList.toggle("hidden",!v)}
function toast(m){const e=$("#toast");e.textContent=m;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),3200)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
