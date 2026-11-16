const tg = window.Telegram?.WebApp;
try { tg?.ready(); tg?.expand(); tg?.setHeaderColor('#ffffff'); tg?.setBackgroundColor('#ffffff'); } catch {}
const app = document.querySelector('#app');
let questions=[], answers=[], screen='home', index=0, editing=false, sending=false;
const nominationClips=[
 {name:'Даниил Конюшевский',src:'videos/01-kony.mp4'},
 {name:'Тимофей Шевченко',src:'videos/02-shevchenko.mp4'},
 {name:'Тимур Юревич',src:'videos/03-timur.mp4'},
 {name:'Даниил Погребнев',src:'videos/04-pogrebnev.mp4'},
 {name:'Марк Статкевич',src:'videos/05-mark.mp4'}
];
let clipIndex=0, clipsFinished=false;
const clipsWatched=Array(nominationClips.length).fill(false);
const draftKey='slay-vote-v3';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>String(n).padStart(2,'0');
function save(){try{sessionStorage.setItem(draftKey,JSON.stringify(answers))}catch{}}
function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.style.display='block';setTimeout(()=>el.style.display='none',5000)}
function go(s){screen=s;render();window.scrollTo({top:0,behavior:'instant'})}
function complete(){return questions.every((q,i)=>Number.isInteger(answers[i])&&answers[i]>=0&&answers[i]<q.options.length)}
function renderClips(){
 const clip=nominationClips[clipIndex];
 app.innerHTML=`<div class="question-top"><span class="eyebrow">НОМИНАЦИЯ 05 / 09</span><span class="eyebrow">ВИДЕО ${clipIndex+1} / ${nominationClips.length}</span></div><section class="voting clip-stage"><div class="question-aside"><span class="eyebrow">SLAY / ВЫБОР ГОДА</span><h1>${esc(questions[4].text)}</h1><p class="hint">Посмотрите пять видео по очереди.<br>Затем выберите номинанта.</p></div><div><p class="clip-name">${esc(clip.name)}</p><video id="nomination-video" class="nomination-video" src="${clip.src}" controls playsinline preload="metadata" aria-label="Видео: ${esc(clip.name)}"></video><p id="clip-status" class="hint" role="status">${clipsWatched[clipIndex]?'Видео просмотрено. Можно продолжить.':'Нажмите воспроизведение. После окончания видео станет доступен следующий шаг.'}</p><button class="text-btn" id="retry-video" hidden>Загрузить видео заново</button><div class="controls"><button class="text-btn" id="clip-back">← Назад</button><button class="primary" id="clip-next" ${clipsWatched[clipIndex]?'':'disabled'}><span>${clipIndex===nominationClips.length-1?'К вариантам ответа':'Следующее видео'}</span><span class="arrow">↗</span></button></div></div></section>`;
 const video=document.querySelector('#nomination-video');
 const next=document.querySelector('#clip-next');
 video.onended=()=>{clipsWatched[clipIndex]=true;next.disabled=false;document.querySelector('#clip-status').textContent='Видео просмотрено. Можно продолжить.'};
 video.onerror=()=>{document.querySelector('#clip-status').textContent='Не удалось загрузить видео. Проверьте подключение и попробуйте снова.';document.querySelector('#retry-video').hidden=false};
 document.querySelector('#retry-video').onclick=()=>{video.load();document.querySelector('#retry-video').hidden=true;document.querySelector('#clip-status').textContent='Нажмите воспроизведение.'};
 document.querySelector('#clip-back').onclick=()=>{if(clipIndex){clipIndex--;go('vote')}else if(editing){editing=false;go('review')}else{index=3;go('vote')}};
 next.onclick=()=>{if(!clipsWatched[clipIndex])return;if(clipIndex<nominationClips.length-1){clipIndex++;go('vote')}else{clipsFinished=true;go('vote')}};
}
function render(){
 document.querySelector('#nomination-video')?.pause?.();
 if(screen==='vote'&&index===4&&!clipsFinished){renderClips();return;}

 if(screen==='home'){
 app.innerHTML=`<section class="hero"><div class="hero-side"><span class="year">2026</span><p>Люди, моменты и фразы,<br>которые сделали этот год.</p></div><div><h1>ГОЛОСО<wbr>ВАНИЕ</h1><p class="intro">Белла Порч - Братан Коч</p><button class="primary" id="begin"><span>${answers.some(Number.isInteger)?'Продолжить голосование':'Начать Голосование'}</span><span class="arrow">↗</span></button><p class="privacy">После отправки организатор получит ваши ответы, имя и Telegram ID. Один выбор в каждой номинации.</p></div></section><section class="directory" aria-label="Номинации">${questions.map((q,i)=>`<div class="tile"><span>${num(i+1)}</span><strong>${esc(q.text)}</strong></div>`).join('')}</section>`;
 document.querySelector('#begin').onclick=()=>{index=answers.findIndex(a=>!Number.isInteger(a));if(index<0||index>=questions.length)index=0;go(complete()?'review':'vote')};
 }else if(screen==='vote'){
 const q=questions[index];
 app.innerHTML=`<div class="question-top"><span class="eyebrow">НОМИНАЦИЯ ${num(index+1)} / ${num(questions.length)}</span><div class="progress" aria-label="Вопрос ${index+1} из ${questions.length}">${questions.map((_,i)=>`<i class="${i<=index?'done':''}"></i>`).join('')}</div></div><section class="voting"><div class="question-aside"><div class="number">${num(index+1)}</div><span class="eyebrow">SLAY / ВЫБОР ГОДА</span><h1>${esc(q.text)}</h1><p class="hint">Один голос. Один номинант.<br>Выберите свой вариант.</p></div><div><div class="options" role="group" aria-label="${esc(q.text)}">${q.options.map((o,i)=>`<button class="option ${answers[index]===i?'selected':''}" data-choice="${i}" aria-pressed="${answers[index]===i}"><span class="index">${num(i+1)}</span><span class="name">${esc(o)}</span><span class="radio" aria-hidden="true"></span></button>`).join('')}</div><div class="controls"><button class="text-btn" id="back">← Назад</button><button class="primary" id="next" ${!Number.isInteger(answers[index])?'disabled':''}><span>${editing?'Сохранить выбор':index===questions.length-1?'Проверить ответы':'Следующая номинация'}</span><span class="arrow">↗</span></button></div></div></section>`;
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const y=window.scrollY;answers[index]=Number(b.dataset.choice);save();try{tg?.HapticFeedback?.selectionChanged()}catch{}render();window.scrollTo(0,y)});
 document.querySelector('#back').onclick=()=>{if(editing){editing=false;go('review')}else if(index){index--;go('vote')}else go('home')};
 document.querySelector('#next').onclick=()=>{if(editing){editing=false;go('review')}else if(index===questions.length-1)go('review');else{index++;go('vote')}};
 }else if(screen==='review'){
 app.innerHTML=`<section class="review"><span class="eyebrow">ФИНАЛЬНЫЙ ШТРИХ / ${num(questions.length)} ИЗ ${num(questions.length)}</span><h1 class="review-title">Ваш голос.<br>Ваши номинанты.</h1><p class="hint">Проверьте выбор перед отправкой.</p><div class="review-list">${questions.map((q,i)=>`<div class="review-row"><span class="n">${num(i+1)}</span><div><small>${esc(q.text)}</small><strong>${esc(q.options[answers[i]]??'Не выбран')}</strong></div><button class="text-btn" data-edit="${i}">Изменить</button></div>`).join('')}</div><p class="privacy">Ваши ответы, имя и Telegram ID будут отправлены организатору голосования.</p><button id="submit" class="primary" ${!complete()||sending?'disabled':''}><span>${sending?'Передаём в Telegram…':'Отправить мой голос'}</span><span class="arrow">↗</span></button><p class="preview-note">${tg&&tg.platform!=='unknown'?'После отправки приложение закроется. Бот подтвердит получение в чате.':'Вы в режиме просмотра. Для отправки откройте приложение через кнопку «Открыть голосование» в боте.'}</p></section>`;
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.edit);editing=true;go('vote')});
 document.querySelector('#submit').onclick=()=>{if(!complete())return;if(!tg||tg.platform==='unknown'){toast('Откройте @slay2026vote_bot и нажмите «Открыть голосование».');return}try{sending=true;render();tg.sendData(JSON.stringify({version:3,answers}));setTimeout(()=>{sending=false;render()},6000)}catch{sending=false;render();toast('Не удалось передать голос. Попробуйте ещё раз через бота.')}};
 }
}
document.querySelector('.brand').onclick=e=>{e.preventDefault();editing=false;go('home')};
fetch('questions.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{questions=data;answers=Array(questions.length).fill(null);try{const draft=JSON.parse(sessionStorage.getItem(draftKey));if(Array.isArray(draft))questions.forEach((q,i)=>{if(Number.isInteger(draft[i])&&draft[i]>=0&&draft[i]<q.options.length)answers[i]=draft[i]})}catch{}render()}).catch(()=>{app.innerHTML='<section class="empty"><h1>Нет связи.</h1><p>Не удалось загрузить номинации. Проверьте подключение и откройте приложение снова.</p><button class="primary" onclick="location.reload()">Попробовать ещё раз ↗</button></section>'});
