const MODEL="openai/gpt-oss-20b";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type","Access-Control-Allow-Methods":"POST, OPTIONS"};

export default{async fetch(request,env){
  if(request.method==="OPTIONS")return new Response(null,{headers:cors});
  if(request.method!=="POST")return out({error:"Method not allowed."},405);
  try{
    const b=await request.json(),count=Math.min(25,Math.max(5,Number(b.count)||10));
    const difficulty=["Easy","Medium","Hard"].includes(b.difficulty)?b.difficulty:"Easy";
    const pdf=b.mode==="pdf",source=pdf?String(b.documentText||""):String(b.topic||"").trim();
    if(pdf&&source.length<80)return out({error:"PDF text is too short."},400);
    if(!pdf&&(source.length<3||source.length>200))return out({error:"Topic must be 3–200 characters."},400);

    const guide={Easy:"recall and recognition; straightforward wording and clear distractors.",Medium:"understanding and application; include some inference and plausible distractors.",Hard:"analysis, synthesis, multi-step reasoning and highly plausible distractors; never rely on ambiguity."}[difficulty];
    const system=`You are Quanta, an expert assessment designer. Return ONLY valid JSON matching the supplied schema. Generate high-quality MCQs. Difficulty: ${difficulty} — ${guide} Every question has exactly four options and exactly one correct answer. Explanations should teach briefly. Avoid duplicates, vague wording, all-of-the-above, and ambiguity. For PDF mode, use ONLY information supported by the document and do not invent outside facts.`;
    const user=pdf?`Create exactly ${count} MCQs from this document. Cover different parts when possible. The source field should describe the relevant section without inventing page numbers.\nDOCUMENT:\n${source}`:`Create exactly ${count} MCQs about: "${source}".`;

    const schema={type:"object",additionalProperties:false,properties:{
      title:{type:"string"},questions:{type:"array",minItems:count,maxItems:count,items:{type:"object",additionalProperties:false,
      properties:{question:{type:"string"},options:{type:"array",minItems:4,maxItems:4,items:{type:"string"}},correctIndex:{type:"integer",minimum:0,maximum:3},explanation:{type:"string"},source:{type:"string"}},
      required:["question","options","correctIndex","explanation","source"]}},},required:["title","questions"]};

    const r=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${env.GROQ_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({
      model:MODEL,temperature:.35,messages:[{role:"system",content:system},{role:"user",content:user}],
      response_format:{type:"json_schema",json_schema:{name:"quiz",strict:true,schema}}
    })});
    const raw=await r.text();if(!r.ok){let msg="Groq request failed.";try{msg=JSON.parse(raw)?.error?.message||msg}catch{}return out({error:msg},502)}
    const content=JSON.parse(raw).choices?.[0]?.message?.content;if(!content)return out({error:"Groq returned an empty response."},502);
    let quiz;try{quiz=JSON.parse(content)}catch{return out({error:"Groq returned malformed JSON."},502)}
    if(!Array.isArray(quiz.questions)||quiz.questions.length!==count)return out({error:"AI returned an unexpected question count. Please retry."},502);
    return out(quiz);
  }catch(e){return out({error:e.message||"Unexpected server error."},500)}
}};
function out(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json",...cors}})}
