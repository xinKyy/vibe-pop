export const CONTENT_TEMPLATES: Record<string, { title: string; description: string; type: string; emoji: string; gradient: string; code: string }> = {
  bouncing_ball: {
    title: '弹球挑战',
    description: '点击屏幕弹射小球，看看你能得多少分！',
    type: 'game',
    emoji: '🎮',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#1a1a2e;overflow:hidden;touch-action:none;font-family:sans-serif}canvas{display:block}#score{position:fixed;top:20px;left:50%;transform:translateX(-50%);color:#fff;font-size:28px;font-weight:bold;text-shadow:0 2px 10px rgba(102,126,234,.5);z-index:10}#hint{position:fixed;bottom:40px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.5);font-size:14px;z-index:10}</style></head><body><div id="score">0</div><div id="hint">点击屏幕弹射小球</div><canvas id="c"></canvas><script>const c=document.getElementById('c'),x=c.getContext('2d');let W=c.width=375,H=c.height=window.innerHeight;const balls=[],bricks=[];let score=0,hintEl=document.getElementById('hint');const colors=['#667eea','#764ba2','#f093fb','#4facfe','#43e97b','#fa709a'];function initBricks(){bricks.length=0;for(let r=0;r<5;r++)for(let col=0;col<5;col++){bricks.push({x:col*73+8,y:r*30+60,w:65,h:22,alive:true,color:colors[(r+col)%colors.length]})}}initBricks();function addBall(px,py){const angle=-Math.PI/2+(Math.random()-.5)*.8;balls.push({x:px,y:py,vx:Math.cos(angle)*6,vy:Math.sin(angle)*6,r:8,color:colors[Math.floor(Math.random()*colors.length)]})}c.addEventListener('click',e=>{const rect=c.getBoundingClientRect();addBall(e.clientX-rect.left,e.clientY-rect.top);hintEl.style.display='none'});c.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0],rect=c.getBoundingClientRect();addBall(t.clientX-rect.left,t.clientY-rect.top);hintEl.style.display='none'},{passive:false});function draw(){x.fillStyle='rgba(26,26,46,0.3)';x.fillRect(0,0,W,H);bricks.forEach(b=>{if(!b.alive)return;x.fillStyle=b.color;x.beginPath();x.roundRect(b.x,b.y,b.w,b.h,4);x.fill()});balls.forEach((b,i)=>{b.x+=b.vx;b.y+=b.vy;b.vy+=0.1;if(b.x<b.r||b.x>W-b.r)b.vx*=-0.95;if(b.y<b.r)b.vy*=-0.95;if(b.y>H+50){balls.splice(i,1);return}bricks.forEach(br=>{if(!br.alive)return;if(b.x>br.x&&b.x<br.x+br.w&&b.y>br.y&&b.y<br.y+br.h){br.alive=false;b.vy*=-1;score+=10;document.getElementById('score').textContent=score;if(bricks.every(b=>!b.alive))initBricks()}});x.beginPath();x.arc(b.x,b.y,b.r,0,Math.PI*2);x.fillStyle=b.color;x.fill();x.shadowColor=b.color;x.shadowBlur=15;x.fill();x.shadowBlur=0});requestAnimationFrame(draw)}draw();window.addEventListener('resize',()=>{W=c.width=375;H=c.height=window.innerHeight})</script></body></html>`,
  },

  photo_album: {
    title: '大理之旅',
    description: '左右滑动查看风景，点击放大',
    type: 'album',
    emoji: '📸',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:sans-serif;height:100vh;overflow:hidden}.album{display:flex;transition:transform .4s ease;height:70vh;margin-top:5vh}.slide{min-width:100%;display:flex;align-items:center;justify-content:center;padding:20px}.photo{width:90%;max-height:100%;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:3/4;font-size:120px;position:relative;overflow:hidden}.caption{position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,.8));text-align:center}.caption h3{font-size:18px;margin-bottom:4px}.caption p{font-size:13px;opacity:.7}.dots{display:flex;justify-content:center;gap:8px;margin-top:20px}.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);transition:all .3s}.dot.active{background:#f093fb;width:24px;border-radius:4px}.header{text-align:center;padding:20px}.header h1{font-size:22px;background:linear-gradient(135deg,#f093fb,#f5576c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.header p{font-size:13px;color:rgba(255,255,255,.5);margin-top:4px}</style></head><body><div class="header"><h1>大理之旅</h1><p>左右滑动查看 · 2026年春</p></div><div class="album" id="album"><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#667eea,#764ba2)">🏔️<div class="caption"><h3>苍山雪景</h3><p>海拔4122米的苍山</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">🌊<div class="caption"><h3>洱海日出</h3><p>清晨5点的宁静</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#f093fb,#f5576c)">🌸<div class="caption"><h3>古城花巷</h3><p>三月的樱花开满城</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">🍵<div class="caption"><h3>下午茶时光</h3><p>在古城里发呆的午后</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#fa709a,#fee140)">🌅<div class="caption"><h3>双廊落日</h3><p>最美的不是日落，是陪你看日落的人</p></div></div></div></div><div class="dots" id="dots"></div><script>const album=document.getElementById('album'),dotsEl=document.getElementById('dots'),total=5;let cur=0,startX=0,dx=0;for(let i=0;i<total;i++){const d=document.createElement('div');d.className='dot'+(i===0?' active':'');dotsEl.appendChild(d)}function go(n){cur=Math.max(0,Math.min(total-1,n));album.style.transform='translateX('+(-cur*100)+'%)';document.querySelectorAll('.dot').forEach((d,i)=>d.className='dot'+(i===cur?' active':''))}album.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;album.style.transition='none'},{passive:true});album.addEventListener('touchmove',e=>{dx=e.touches[0].clientX-startX;album.style.transform='translateX('+(-cur*100+dx/3.75)+'%)'},{passive:true});album.addEventListener('touchend',()=>{album.style.transition='transform .4s ease';if(dx<-50)go(cur+1);else if(dx>50)go(cur-1);else go(cur);dx=0});let mouseDown=false;album.addEventListener('mousedown',e=>{mouseDown=true;startX=e.clientX;album.style.transition='none'});album.addEventListener('mousemove',e=>{if(!mouseDown)return;dx=e.clientX-startX;album.style.transform='translateX('+(-cur*100+dx/3.75)+'%)'});album.addEventListener('mouseup',()=>{mouseDown=false;album.style.transition='transform .4s ease';if(dx<-50)go(cur+1);else if(dx>50)go(cur-1);else go(cur);dx=0})</script></body></html>`,
  },

  roast_generator: {
    title: '毒舌点评',
    description: '输入名字，AI 给你一段毒舌点评',
    type: 'tool',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;font-family:sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px;overflow:hidden}.title{font-size:28px;margin-bottom:8px;text-align:center}.subtitle{font-size:14px;opacity:.6;margin-bottom:30px}.input-wrap{width:100%;max-width:320px;position:relative;margin-bottom:20px}input{width:100%;padding:14px 20px;border-radius:25px;border:2px solid rgba(79,172,254,.3);background:rgba(255,255,255,.08);color:#fff;font-size:16px;outline:none;backdrop-filter:blur(10px);transition:border-color .3s}input:focus{border-color:#4facfe}input::placeholder{color:rgba(255,255,255,.3)}.btn{padding:14px 40px;border-radius:25px;border:none;background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;margin-bottom:30px}.btn:active{transform:scale(.95)}.result{width:100%;max-width:320px;min-height:200px;background:rgba(255,255,255,.05);border-radius:20px;padding:24px;border:1px solid rgba(79,172,254,.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.8;font-size:15px;transition:all .3s}.typing{display:inline-block;overflow:hidden;white-space:pre-wrap;border-right:2px solid #4facfe;animation:blink .8s infinite}@keyframes blink{0%,100%{border-color:#4facfe}50%{border-color:transparent}}</style></head><body><div class="title">🔮 毒舌点评机</div><div class="subtitle">输入名字，获得一段犀利点评</div><div class="input-wrap"><input id="name" placeholder="输入你的名字..." maxlength="10"></div><button class="btn" onclick="generate()">开始点评 ⚡</button><div class="result" id="result">等待输入中...</div><script>const roasts=["作为一个{name}，你最大的优点就是...让我想想...嗯...你很勇敢地活着。","听说{name}小时候被夸过一次聪明，从此就再也没进步过了。","{name}？这名字起得不错，可惜浪费了。","如果无聊是一种超能力，{name}一定是这个领域的天花板。","别人是一日不见如隔三秋，{name}是一日不见...清静了不少。","{name}的存在证明了一件事：上帝也有摸鱼的时候。","我对{name}的评价就四个字：勇气可嘉。毕竟每天照镜子都需要勇气。","{name}要是去参加选秀，评委会说：你很有勇气站在这里，这就是你最大的才华。","认识{name}之后我明白了一个道理：人和人之间的差距，有时候比人和狗还大。","如果把{name}的才华做成饼，大概够蚂蚁吃一口的。"];function generate(){const name=document.getElementById('name').value.trim()||'路人甲';const roast=roasts[Math.floor(Math.random()*roasts.length)].replace(/{name}/g,name);const el=document.getElementById('result');el.innerHTML='';let i=0;el.className='result typing';function type(){if(i<roast.length){el.textContent+=roast[i];i++;setTimeout(type,50+Math.random()*30)}else{el.className='result'}}type()}</script></body></html>`,
  },

  time_capsule: {
    title: '时光相册',
    description: '写下此刻的心情，封存到未来',
    type: 'album',
    emoji: '⏰',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);color:#fff;font-family:sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px}.capsule{width:120px;height:120px;background:linear-gradient(135deg,#43e97b,#38f9d7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:60px;margin-bottom:20px;box-shadow:0 10px 40px rgba(67,233,123,.3);animation:float 3s ease-in-out infinite}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}h1{font-size:24px;margin-bottom:6px}p.sub{font-size:13px;opacity:.6;margin-bottom:30px}textarea{width:100%;max-width:320px;height:120px;padding:16px;border-radius:16px;border:2px solid rgba(67,233,123,.2);background:rgba(255,255,255,.06);color:#fff;font-size:14px;outline:none;resize:none;line-height:1.6;backdrop-filter:blur(10px)}textarea:focus{border-color:#43e97b}textarea::placeholder{color:rgba(255,255,255,.3)}.btn{margin-top:16px;padding:14px 40px;border-radius:25px;border:none;background:linear-gradient(135deg,#43e97b,#38f9d7);color:#0f2027;font-size:15px;font-weight:700;cursor:pointer}.btn:active{transform:scale(.95)}.sealed{display:none;text-align:center;margin-top:20px;animation:fadeIn .5s ease}.sealed .lock{font-size:80px;margin:20px 0}.sealed .date{font-size:14px;opacity:.6;margin-top:10px}@keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}#particles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0}.content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center}</style></head><body><canvas id="particles"></canvas><div class="content"><div class="capsule" id="capsule">⏰</div><h1>时光胶囊</h1><p class="sub">写下此刻的心情，封存到未来</p><div id="input-area"><textarea id="msg" placeholder="给未来的自己写点什么..."></textarea><button class="btn" onclick="seal()">封存胶囊 🔒</button></div><div class="sealed" id="sealed"><div class="lock">🔮</div><h2>已封存！</h2><p>你的心情已经安全封存</p><p class="date" id="date"></p><button class="btn" style="margin-top:20px" onclick="location.reload()">再写一个</button></div></div><script>function seal(){const msg=document.getElementById('msg').value;if(!msg.trim())return;document.getElementById('input-area').style.display='none';document.getElementById('sealed').style.display='block';document.getElementById('capsule').textContent='🔮';const d=new Date();d.setFullYear(d.getFullYear()+1);document.getElementById('date').textContent='将在 '+d.toLocaleDateString('zh-CN')+' 开启';burst()}const cv=document.getElementById('particles'),ctx=cv.getContext('2d');cv.width=375;cv.height=window.innerHeight;const ps=[];function burst(){for(let i=0;i<50;i++)ps.push({x:187,y:200,vx:(Math.random()-.5)*8,vy:(Math.random()-.5)*8,r:Math.random()*4+2,life:1,color:'hsl('+(Math.random()*60+120)+',80%,60%)'})}function animate(){ctx.clearRect(0,0,cv.width,cv.height);ps.forEach((p,i)=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=.015;if(p.life<=0){ps.splice(i,1);return}ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()});ctx.globalAlpha=1;requestAnimationFrame(animate)}animate()</script></body></html>`,
  },

  dodge_game: {
    title: '躲避障碍',
    description: '左右移动躲避下落的方块，你能活多久？',
    type: 'game',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#1a1a2e;overflow:hidden;touch-action:none}canvas{display:block}#ui{position:fixed;top:0;left:0;right:0;padding:16px 20px;display:flex;justify-content:space-between;color:#fff;font-family:sans-serif;font-size:16px;font-weight:bold;z-index:10}#gameover{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:sans-serif;z-index:20}#gameover h1{font-size:32px;margin-bottom:10px;background:linear-gradient(135deg,#fa709a,#fee140);-webkit-background-clip:text;-webkit-text-fill-color:transparent}#gameover p{font-size:18px;margin-bottom:24px}#gameover button{padding:14px 40px;border-radius:25px;border:none;background:linear-gradient(135deg,#fa709a,#fee140);color:#fff;font-size:16px;font-weight:700;cursor:pointer}</style></head><body><div id="ui"><span id="score">得分: 0</span><span id="best">最高: 0</span></div><div id="gameover"><h1>Game Over</h1><p id="final">得分: 0</p><button onclick="restart()">再来一次</button></div><canvas id="c"></canvas><script>const c=document.getElementById('c'),x=c.getContext('2d');let W=c.width=375,H=c.height=window.innerHeight;let player={x:W/2,y:H-80,w:40,h:40},obstacles=[],score=0,best=0,speed=3,alive=true,targetX=player.x;const colors=['#fa709a','#fee140','#4facfe','#43e97b','#f093fb'];function spawnObs(){obstacles.push({x:Math.random()*(W-30),y:-30,w:20+Math.random()*30,h:20+Math.random()*20,color:colors[Math.floor(Math.random()*colors.length)],speed:speed+Math.random()*2})}c.addEventListener('touchmove',e=>{e.preventDefault();targetX=e.touches[0].clientX},{passive:false});c.addEventListener('mousemove',e=>{targetX=e.clientX});function restart(){obstacles.length=0;score=0;speed=3;alive=true;player.x=W/2;targetX=player.x;document.getElementById('gameover').style.display='none';loop()}function loop(){if(!alive)return;x.fillStyle='rgba(26,26,46,0.4)';x.fillRect(0,0,W,H);player.x+=(targetX-player.x)*.15;x.fillStyle='#fee140';x.shadowColor='#fee140';x.shadowBlur=20;x.beginPath();x.roundRect(player.x-player.w/2,player.y,player.w,player.h,8);x.fill();x.shadowBlur=0;if(Math.random()<.04+score/5000)spawnObs();obstacles.forEach((o,i)=>{o.y+=o.speed;x.fillStyle=o.color;x.beginPath();x.roundRect(o.x,o.y,o.w,o.h,4);x.fill();if(o.y>H){obstacles.splice(i,1);return}const px=player.x-player.w/2;if(px<o.x+o.w&&px+player.w>o.x&&player.y<o.y+o.h&&player.y+player.h>o.y){alive=false;best=Math.max(best,score);document.getElementById('gameover').style.display='flex';document.getElementById('final').textContent='得分: '+score;document.getElementById('best').textContent='最高: '+best}});score++;speed=3+score/200;document.getElementById('score').textContent='得分: '+score;requestAnimationFrame(loop)}loop()</script></body></html>`,
  },

  birthday_card: {
    title: '生日贺卡',
    description: '动态生日祝福卡片',
    type: 'other',
    emoji: '🎂',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#2d1b69,#11998e);color:#fff;font-family:sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;text-align:center}.cake{font-size:100px;animation:bounce 2s ease-in-out infinite;cursor:pointer;user-select:none;transition:transform .1s}@keyframes bounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.1)}}h1{font-size:32px;margin:20px 0 8px;background:linear-gradient(135deg,#fed6e3,#a8edea);-webkit-background-clip:text;-webkit-text-fill-color:transparent}p{font-size:16px;opacity:.8;line-height:1.6;padding:0 30px;max-width:320px}.candles{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10}@keyframes confetti-fall{0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}.confetti{position:absolute;width:8px;height:8px;border-radius:2px;animation:confetti-fall linear forwards}.music-note{position:absolute;font-size:24px;animation:note-float 3s ease-out forwards;pointer-events:none}@keyframes note-float{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-100px) scale(0.5)}}.btn{margin-top:24px;padding:14px 32px;border-radius:25px;border:2px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;font-size:15px;cursor:pointer;backdrop-filter:blur(10px)}.btn:active{transform:scale(.95)}</style></head><body><div class="candles" id="fx"></div><div class="cake" id="cake" onclick="blow()">🎂</div><h1>生日快乐！</h1><p>愿你的每一天都像今天一样闪闪发光 ✨</p><button class="btn" onclick="celebrate()">🎉 放烟花</button><script>function celebrate(){const fx=document.getElementById('fx');const colors=['#fa709a','#fee140','#4facfe','#43e97b','#f093fb','#a8edea','#fed6e3'];for(let i=0;i<40;i++){const el=document.createElement('div');el.className='confetti';el.style.left=Math.random()*100+'%';el.style.background=colors[Math.floor(Math.random()*colors.length)];el.style.animationDuration=(Math.random()*3+2)+'s';el.style.animationDelay=Math.random()*2+'s';el.style.width=(Math.random()*8+4)+'px';el.style.height=(Math.random()*8+4)+'px';fx.appendChild(el);setTimeout(()=>el.remove(),5000)}}function blow(){const cake=document.getElementById('cake');cake.textContent='🎁';cake.style.transform='scale(1.3)';setTimeout(()=>{cake.textContent='🎂';cake.style.transform='scale(1)'},1500);const fx=document.getElementById('fx');for(let i=0;i<8;i++){const note=document.createElement('div');note.className='music-note';note.textContent=['🎵','🎶','✨','💫','⭐'][Math.floor(Math.random()*5)];note.style.left=(Math.random()*60+20)+'%';note.style.top=(40+Math.random()*20)+'%';fx.appendChild(note);setTimeout(()=>note.remove(),3000)}}celebrate()</script></body></html>`,
  },
};

export function getTemplateKeys(): string[] {
  return Object.keys(CONTENT_TEMPLATES);
}

export function getTemplateByKey(key: string) {
  return CONTENT_TEMPLATES[key];
}

/** 输入框提示词模板：点击后填充到 prompt 输入框，让用户可以继续编辑后再让 AI 生成 */
export interface LocalizedText {
  zh: string;
  en: string;
}

export interface PromptTemplate {
  id: string;
  emoji: string;
  gradient: string;
  /** 卡片标题（中英双语） */
  title: LocalizedText;
  /** 卡片描述，用于网格卡片预览（中英双语） */
  description: LocalizedText;
  /** 点击后填入输入框的完整提示词（中英双语） */
  prompt: LocalizedText;
  sortOrder: number;
  isActive: boolean;
}

const DESIGN_SYSTEM_ZH = `【设计系统】
- 背景：#0a0a0f（暗色沉浸）
- 卡片：#1a1a2e，圆角 12px
- 强调色：linear-gradient(135deg, #ff6b9d, #c44569)
- 字体：-apple-system, BlinkMacSystemFont, sans-serif
- 移动端优先（375px 视口）`;

const DESIGN_SYSTEM_EN = `【Design System】
- Background: #0a0a0f (dark immersive)
- Card: #1a1a2e, border-radius 12px
- Accent: linear-gradient(135deg, #ff6b9d, #c44569)
- Font: -apple-system, BlinkMacSystemFont, sans-serif
- Mobile-first (375px viewport)`;

const DESIGN_SYSTEM_ZH_DUAL = `${DESIGN_SYSTEM_ZH}
- 兼容 Web 和移动端双端`;

const DESIGN_SYSTEM_EN_DUAL = `${DESIGN_SYSTEM_EN}, compatible with Web and mobile dual-end`;

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'travel_card',
    emoji: '🗺️',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    title: { zh: '旅行地点卡', en: 'Travel Location Card' },
    description: {
      zh: '全屏封面照 + 故事 + 迷你地图，展示一次旅程',
      en: 'Full-screen cover photo + story + mini map for one trip',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{place_name: "地点名称"}} — 如：伏见稻荷大社
- {{date: "日期"}} — 如：3月26日
- {{cover_image: "封面照片URL"}} — 主视觉图片
- {{story: "故事内容"}} — 1-2段经历描述
- {{tips: "实用Tips"}} — 可选：交通/门票/时间建议
- {{coordinates: "经纬度"}} — 如：34.9671,135.7727（用于地图）
- {{photos: ["照片1URL","照片2URL"]}} — 浏览态照片网格

【页面结构】
1. 全屏封面照片（cover_image），底部渐变遮罩
2. 左下角：地点名称（place_name）+ 日期（date）
3. 右下角："查看详情"按钮
4. 点击展开浏览态：
   - 顶部：照片网格（photos）
   - 中部：故事文字（story）
   - 底部：迷你地图（coordinates）+ Tips

【交互】
- 封面照片视差滚动效果
- 点击"查看详情"：opacity 0→1 + translateY 20px→0 动画
- 浏览态内左右滑动切换照片
- 地图使用 Leaflet 或静态图片标记`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{place_name: "Place Name"}} — e.g. Fushimi Inari Shrine
- {{date: "Date"}} — e.g. March 26
- {{cover_image: "Cover Photo URL"}} — Hero image
- {{story: "Your Story"}} — 1-2 paragraphs of experience
- {{tips: "Practical Tips"}} — Optional: transport/tickets/timing
- {{coordinates: "Lat,Lng"}} — e.g. 34.9671,135.7727 (for map)
- {{photos: ["photo1URL","photo2URL"]}} — Photo grid for detail view

【Page Structure】
1. Full-screen cover photo (cover_image) with bottom gradient overlay
2. Bottom-left: place_name + date
3. Bottom-right: "View Details" button
4. Tap to expand detail view:
   - Top: photo grid (photos)
   - Middle: story text
   - Bottom: mini map (coordinates) + Tips

【Interactions】
- Parallax scrolling on cover photo
- Tap "View Details": opacity 0→1 + translateY 20px→0 animation
- Swipe left/right in detail view to browse photos
- Map: Leaflet or static image with marker`,
    },
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'product_card',
    emoji: '🚀',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    title: { zh: '产品闪卡', en: 'Product Flash Card' },
    description: {
      zh: 'Logo + Tagline + 特性标签 + CTA，一屏讲清楚产品',
      en: 'Logo + tagline + feature tags + CTA on a single screen',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{product_name: "产品名称"}} — 如：VibePop
- {{tagline: "一句话介绍"}} — 如：让代码变成好玩的社交内容
- {{logo_url: "Logo图片URL"}} — 产品图标
- {{features: [
    {name: "核心特性1", desc: "描述这个功能解决的问题"},
    {name: "核心特性2", desc: "描述这个功能带来的价值"},
    {name: "核心特性3", desc: "描述这个特性的使用场景"}
  ]}} — 特性标签数组
- {{demo_url: "演示链接"}} — 展示链接文本，提供 📋 复制按钮
- {{cta_text: "按钮文字"}} — 如：立即体验 / 了解更多

【页面结构】
1. 顶部：Logo（logo_url）+ 产品名（product_name）+ Tagline
2. 中部：特性标签云（features数组）
3. 底部：渐变 CTA 按钮（cta_text）

【交互】
- 特性标签 Hover：背景变粉色，放大 1.05x
- 点击标签：从下方滑入详情卡片（特性描述展开）
- CTA 按钮：脉冲呼吸动画（box-shadow 扩散），点击后展开链接卡片展示 demo_url 文本 + 📋 复制按钮，不跳转

【视觉】
- 背景微妙动态渐变（CSS animation，15s循环）
- 每个特性标签使用不同彩色边框（紫/粉/青轮换）`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{product_name: "Product Name"}} — e.g. VibePop
- {{tagline: "One-liner"}} — e.g. Turn code into playable social content
- {{logo_url: "Logo URL"}} — Product icon
- {{features: [
    {name: "Key Feature 1", desc: "What problem this solves"},
    {name: "Key Feature 2", desc: "Value this brings"},
    {name: "Key Feature 3", desc: "When to use this"}
  ]}} — Feature tags array
- {{demo_url: "Demo Link"}} — Display link text with 📋 copy button
- {{cta_text: "Button Text"}} — e.g. Try Now / Learn More

【Page Structure】
1. Top: Logo (logo_url) + product_name + tagline
2. Middle: Feature tag cloud (features array)
3. Bottom: Gradient CTA button (cta_text)

【Interactions】
- Feature tag hover: background turns pink, scale 1.05x
- Tap tag: detail card slides up from bottom (expands description)
- CTA button: pulse breathing animation (box-shadow spread), tap expands link card showing demo_url text + 📋 copy button, no redirect

【Visual】
- Subtle animated gradient background (CSS animation, 15s loop)
- Each feature tag uses different colored border (purple/pink/cyan rotation)`,
    },
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'personal_profile',
    emoji: '👤',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    title: { zh: '个人主页', en: 'Personal Profile' },
    description: {
      zh: '头像 + bio + 社交链接 + 作品网格，打造轻量名片',
      en: 'Avatar + bio + social links + works grid for a lightweight card',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{avatar_url: "头像URL"}} — 个人头像
- {{name: "显示名称"}}
- {{handle: "用户名"}}
- {{bio: "个人简介"}}
- {{links: [
    {platform: "Twitter", url: "https://twitter.com/xxx"},
    {platform: "GitHub", url: "https://github.com/xxx"},
    {platform: "Blog", url: "https://xxx.com"}
  ]}} — 社交链接数组
- {{works: [
    {title: "作品标题1", cover: "封面URL1", url: "链接1"},
    {title: "作品标题2", cover: "封面URL2", url: "链接2"}
  ]}} — 作品展示数组

【页面结构】
1. 顶部居中：头像 + 名字 + handle + bio
2. 社交链接行：圆形图标按钮（links）
3. 作品网格：2列瀑布流（works）

【交互】
- 头像 Hover：旋转 360° + 粉色发光
- 社交链接：Hover 图标放大 1.2x，点击显示平台名 + 链接文本 + 📋 复制按钮，不跳转外部
- 作品卡片：Hover 显示"查看"遮罩层
- 点击作品：展开详情弹窗（大图+描述+作品链接文本+📋复制按钮）

【视觉】
- 头像使用渐变边框动画（旋转 conic-gradient）
- 作品卡片悬停上浮（translateY -4px + 阴影）`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{avatar_url: "Avatar URL"}} — Profile photo
- {{name: "Display Name"}}
- {{handle: "Username"}}
- {{bio: "Bio"}}
- {{links: [
    {platform: "Twitter", url: "https://twitter.com/xxx"},
    {platform: "GitHub", url: "https://github.com/xxx"},
    {platform: "Blog", url: "https://xxx.com"}
  ]}} — Social links array
- {{works: [
    {title: "Work Title 1", cover: "coverURL1", url: "link1"},
    {title: "Work Title 2", cover: "coverURL2", url: "link2"}
  ]}} — Works/portfolio array

【Page Structure】
1. Top-center: Avatar + name + handle + bio
2. Social links row: circular icon buttons (links)
3. Works grid: 2-column masonry (works)

【Interactions】
- Avatar hover: rotate 360° + pink glow
- Social links: hover icon scales 1.2x, tap shows platform name + link text + 📋 copy button, no external redirect
- Work cards: hover shows "View" overlay
- Tap work: expands detail modal (large image + description + work link text + 📋 copy button)

【Visual】
- Avatar uses animated gradient border (rotating conic-gradient)
- Work cards lift on hover (translateY -4px + shadow)`,
    },
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'event_invitation',
    emoji: '🎉',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    title: { zh: '活动邀请', en: 'Event Invitation' },
    description: {
      zh: '大标题 + 实时倒计时 + 地点时间 + 报名链接',
      en: 'Large title + live countdown + venue + sign-up link',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{event_name: "活动名称"}} — 如：VibePop 产品发布会
- {{datetime: "2026-05-01T19:00:00"}} — ISO格式，用于倒计时
- {{location: "地点名称"}} — 如：上海市静安区
- {{address: "详细地址"}} — 如：南京西路1266号恒隆广场
- {{description: "活动描述"}} — 2-3句话介绍活动内容
- {{rsvp_url: "报名链接"}} — 活动报名地址，展示链接文本 + 📋 复制按钮，不跳转
- {{max_guests: 50}} — 人数上限（可选）

【页面结构】
1. 顶部：活动名称（大标题）+ 实时倒计时器
2. 中部：📅 日期时间 + 📍 地点（location + address）
3. 底部：描述文字 + 报名链接展示（rsvp_url 文本 + 📋 复制按钮）

【交互】
- 倒计时器：实时更新（JS setInterval），等宽字体显示
- 倒计时结束：显示"🔴 进行中"或"✓ 已结束"
- RSVP 区域：展示 rsvp_url 链接文本，附带 📋 复制按钮，点击复制链接到剪贴板，不跳转外部
- 人数显示：current_guests / max_guests（如 12/50）
- 地点：点击打开地图应用（geo: 协议导航）

【视觉】
- 倒计时数字粉色强调，使用等宽字体（Monaco / Courier）
- 报名链接区域：链接文本使用粉色等宽字体显示，右侧 📋 复制按钮，点击后显示"✓ 已复制"提示
- RSVP 区域脉冲动画吸引点击
- 日期左侧日历图标装饰`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{event_name: "Event Name"}} — e.g. VibePop Launch Party
- {{datetime: "2026-05-01T19:00:00"}} — ISO format for countdown
- {{location: "Location Name"}} — e.g. Jing'an District, Shanghai
- {{address: "Full Address"}} — e.g. 1266 Nanjing West Rd
- {{description: "Description"}} — 2-3 sentences about the event
- {{rsvp_url: "Sign-up Link"}} — Event sign-up URL, display link text + 📋 copy button, no redirect
- {{max_guests: 50}} — Capacity limit (optional)
- {{current_guests: 12}} — Current sign-ups (optional)

【Page Structure】
1. Top: Event name (large title) + live countdown timer
2. Middle: 📅 Date/Time + 📍 Location (location + address)
3. Bottom: Description + sign-up link display (rsvp_url text + 📋 copy button)

【Interactions】
- Countdown: real-time updates (JS setInterval), monospace font
- Countdown ends: shows "🔴 Live" or "✓ Ended"
- Sign-up area: display rsvp_url link text with 📋 copy button, tap copies link to clipboard, no external redirect
- Guest count: current_guests / max_guests (e.g. 12/50)
- Location: display full address as selectable text (address), no geo redirect

【Visual】
- Countdown digits in pink accent, monospace (Monaco / Courier)
- Sign-up link area: link text in pink monospace font, 📋 copy button on the right, tap shows "✓ Copied" toast
- RSVP area pulse animation to draw attention
- Calendar icon decoration next to date`,
    },
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'step_tutorial',
    emoji: '📋',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    title: { zh: '步骤教程', en: 'Step-by-Step Tutorial' },
    description: {
      zh: '难度标签 + 折叠步骤列表 + 进度条，带你一步步完成',
      en: 'Difficulty tag + collapsible steps + progress bar',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{title: "教程标题"}} — 如：3分钟上手 VibePop
- {{difficulty: "简单"}} — 简单 / 中等 / 困难
- {{duration: "15分钟"}} — 预计完成时长
- {{steps: [
    {
      title: "准备工作",
      desc: "说明需要提前准备的环境、材料或工具清单",
      image: "步骤配图URL（可选）"
    },
    {
      title: "第一步：基础操作",
      desc: "描述具体的操作步骤，可以包含需要注意的细节和常见问题",
      image: "步骤配图URL（可选）"
    },
    {
      title: "第二步：核心流程",
      desc: "继续描述接下来的关键步骤，保持每步一个核心动作",
      image: "步骤配图URL（可选）"
    },
    {
      title: "完成与验证",
      desc: "说明如何检查结果是否正确，以及遇到问题时的排查方向",
      image: "步骤配图URL（可选）"
    }
  ]}} — 步骤数组（可复制添加更多步骤）

【页面结构】
1. 顶部：标题 + 难度标签（彩色）+ 时长
2. 中部：步骤列表（垂直排列，默认折叠）
3. 底部：进度条 + "标记全部完成"按钮

【交互】
- 每个步骤：默认折叠，只显示序号 + 标题
- 点击步骤：展开详情（desc + 图片），其他步骤自动收起
- 步骤完成：点击左侧圆形复选框，打勾 + 变粉色 + 文字变淡
- 进度条：根据完成步骤实时更新宽度（百分比）
- 全部完成后：顶部显示"🎉 恭喜完成" + 撒花动画

【视觉】
- 未完成：灰色边框 + 空心圆
- 已完成：粉色边框 + 打勾实心圆 + 文字透明度 0.6
- 当前展开：背景高亮（#1a1a2e → #252540）
- 进度条：渐变填充，平滑过渡`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{title: "Tutorial Title"}} — e.g. VibePop Quick Start
- {{difficulty: "Easy"}} — Easy / Medium / Hard
- {{duration: "15 min"}} — Estimated completion time
- {{steps: [
    {
      title: "Preparation",
      desc: "List environment, materials, or tools needed before starting",
      image: "Step image URL (optional)"
    },
    {
      title: "Step 1: Basic Setup",
      desc: "Describe the specific action, including details to watch out for and common issues",
      image: "Step image URL (optional)"
    },
    {
      title: "Step 2: Core Flow",
      desc: "Continue with the next key step. Keep each step to one core action",
      image: "Step image URL (optional)"
    },
    {
      title: "Verify & Finish",
      desc: "Explain how to check if the result is correct, and troubleshooting tips",
      image: "Step image URL (optional)"
    }
  ]}} — Steps array (copy-paste to add more)

【Page Structure】
1. Top: Title + difficulty tag (colored) + duration
2. Middle: Step list (vertical, collapsed by default)
3. Bottom: Progress bar + "Mark All Done" button

【Interactions】
- Each step: collapsed by default, shows index + title only
- Tap step: expands details (desc + image), others auto-collapse
- Step complete: tap circle checkbox → checkmark + pink + text fades
- Progress bar: updates width in real-time based on completed steps
- All done: top shows "🎉 Congratulations" + confetti animation

【Visual】
- Incomplete: gray border + hollow circle
- Complete: pink border + checked solid circle + text opacity 0.6
- Currently expanded: highlighted background (#1a1a2e → #252540)
- Progress bar: gradient fill, smooth transition`,
    },
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'photo_story',
    emoji: '📸',
    gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    title: { zh: '照片故事', en: 'Photo Story' },
    description: {
      zh: '全屏浏览 + 点击切换 + 文字描述，讲一段旅程',
      en: 'Full-screen browse + tap to switch + captions',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH}

【变量 - 请替换为你的内容】
- {{title: "故事标题"}} — 如：京都春日
- {{photos: [
    {url: "照片1URL", desc: "第一张照片的文字描述", date: "3月26日"},
    {url: "照片2URL", desc: "第二张照片的文字描述", date: "3月27日"},
    {url: "照片3URL", desc: "第三张照片的文字描述", date: "3月28日"}
  ]}} — 照片数组（可复制添加更多）
- {{music_url: "背景音乐URL（可选）"}} — 自动循环播放

【页面结构】
1. 全屏照片（当前页，object-fit: cover）
2. 底部：照片描述文字（渐变遮罩确保可读性）
3. 顶部：细进度条（当前张数/总数）
4. 左右边缘：隐形点击热区（上一张/下一张）

【交互】
- 点击右侧 30%：下一张照片（CSS translateX slide 动画）
- 点击左侧 30%：上一张照片
- 点击中间 40%：切换描述显示/隐藏
- 照片切换：当前图 scale 1.02→1.0 微动效
- 最后一张：显示"↻ 重播"和"↗ 分享"按钮
- 背景音乐：自动播放，点击喇叭图标静音

【视觉】
- 照片填满屏幕，黑色背景过渡
- 描述文字底部渐变遮罩（透明→黑色 80%）
- 进度条顶部细线（粉色渐变）
- 切换时照片有轻微模糊过渡（filter blur）`,
      en: `${DESIGN_SYSTEM_EN}

【Variables - Replace with your content】
- {{title: "Story Title"}} — e.g. Spring in Kyoto
- {{photos: [
    {url: "photo1URL", desc: "Description for first photo", date: "Mar 26"},
    {url: "photo2URL", desc: "Description for second photo", date: "Mar 27"},
    {url: "photo3URL", desc: "Description for third photo", date: "Mar 28"}
  ]}} — Photo array (copy-paste to add more)
- {{music_url: "Background Music URL (optional)"}} — Auto-loop playback

【Page Structure】
1. Full-screen photo (current, object-fit: cover)
2. Bottom: photo description (gradient overlay for readability)
3. Top: thin progress bar (current / total)
4. Left/right edges: invisible tap zones (prev / next)

【Interactions】
- Tap right 30%: next photo (CSS translateX slide animation)
- Tap left 30%: previous photo
- Tap middle 40%: toggle description show/hide
- Photo transition: current image scale 1.02→1.0 micro-motion
- Last photo: shows "↻ Replay" and "↗ Share" buttons
- Background music: auto-plays, tap speaker icon to mute

【Visual】
- Photo fills screen, black background transition
- Description gradient overlay at bottom (transparent → black 80%)
- Progress bar: thin pink gradient line at top
- Transition: slight blur filter during photo change`,
    },
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'creative_canvas',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    title: { zh: '创意绘画', en: 'Creative Canvas' },
    description: {
      zh: 'p5.js 交互式生成艺术，粒子 / 波浪 / 分形随手挑',
      en: 'Interactive generative art with p5.js (particles / waves / fractals)',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH_DUAL}

【变量 - 请替换为你的内容】
- {{art_title: "作品标题"}} — 如：霓虹粒子
- {{canvas_size: "400,400"}} — 画布尺寸（宽,高），移动端建议不超过屏幕宽度
- {{mode: "interactive"}} — 模式：interactive（交互）/ auto（自动）/ static（静态）
- {{color_scheme: "neon"}} — 配色：neon（霓虹）/ pastel（柔和）/ mono（单色）/ warm（暖色）
- {{subject: "粒子系统"}} — 绘画主题：粒子系统 / 几何图案 / 流动场 / 波浪 / 分形 / 自定义
- {{interaction: "触屏跟随"}} — 交互方式：触屏跟随 / 点击生成 / 滑动绘制 / 无交互
- {{description: "作品描述"}} — 1-2句话介绍这个作品想表达什么

【p5.js 绘画指引】
必须引入 p5.js CDN：
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>

【交互】
- 根据 interaction 变量设置交互方式（双端兼容）：
  - 触屏跟随：元素跟随 mouseX/mouseY（移动端自动映射为触摸位置）
  - 点击生成：mousePressed() + touchStarted() 双事件生成新元素
  - 滑动绘制：mouseDragged() + touchMoved() 双事件绘制轨迹
  - 无交互：纯自动动画

【视觉】
- 画布外围使用渐变发光边框（box-shadow 粉色脉冲动画）
- 画布 CSS 添加 \`touch-action: none; user-select: none;\` 防止移动端滚动和文字选中
- 画布背景色跟随 color_scheme：
  - neon → #0a0a0f（深色底+亮色元素）
  - pastel → #f5f0eb（浅色底+柔和色）
  - mono → #111111（黑白灰）
  - warm → #1a1410（暖棕底+橙红色）
- 粒子/线条使用半透明叠加（alpha 50-80），营造拖尾效果
- 使用 blendMode(ADD) 实现发光叠加（适合 neon 模式，Web端可用，移动端大部分浏览器支持）`,
      en: `${DESIGN_SYSTEM_EN_DUAL}

【Variables - Replace with your content】
- {{art_title: "Artwork Title"}} — e.g. Neon Particles
- {{canvas_size: "400,400"}} — Canvas dimensions (width,height), mobile should not exceed screen width
- {{mode: "interactive"}} — Mode: interactive / auto / static
- {{color_scheme: "neon"}} — Color scheme: neon / pastel / mono / warm
- {{subject: "Particle System"}} — Art subject: particles / geometric / flow / waves / fractal / custom
- {{interaction: "Touch Follow"}} — Interaction: touch follow / tap spawn / slide draw / none
- {{description: "Description"}} — 1-2 sentences about what this piece expresses

【p5.js Drawing Guide】
Must include p5.js CDN:
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>

【Interactions】
- Set interaction based on interaction variable (dual-end compatible):
  - Touch follow: elements track mouseX/mouseY (auto-mapped to touch on mobile)
  - Tap spawn: mousePressed() + touchStarted() dual events spawn new elements
  - Slide draw: mouseDragged() + touchMoved() dual events draw trail
  - No interaction: pure auto animation

【Visual】
- Canvas has glowing gradient border (box-shadow pink pulse animation)
- Canvas CSS adds \`touch-action: none; user-select: none;\` to prevent mobile scroll and text selection
- Canvas background follows color_scheme:
  - neon → #0a0a0f (dark + bright elements)
  - pastel → #f5f0eb (light + soft colors)
  - mono → #111111 (black/white/gray)
  - warm → #1a1410 (warm brown + orange-red)
- Particles/lines use semi-transparent overlay (alpha 50-80) for trail effect
- Use blendMode(ADD) for glow overlay (good for neon mode, works on Web, supported by most mobile browsers)`,
    },
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'mini_game',
    emoji: '🎮',
    gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    title: { zh: '小游戏', en: 'Mini Game' },
    description: {
      zh: '2D / 3D 小游戏，触屏 + 键盘双端控制',
      en: '2D / 3D mini game with touch + keyboard controls',
    },
    prompt: {
      zh: `${DESIGN_SYSTEM_ZH_DUAL}

【变量 - 请替换为你的内容】
- {{game_title: "游戏标题"}} — 如：霓虹贪吃蛇
- {{dimension: "2D"}} — 维度：2D（p5.js）/ 3D（three.js）
- {{genre: "休闲"}} — 类型：休闲 / 益智 / 动作 / 竞速 / 射击 / 自定义
- {{gameplay: "玩法说明"}} — 如：点击屏幕控制小球跳跃，躲避障碍物
- {{score_type: "分数"}} — 计分方式：分数 / 时间 / 收集物数量 / 关卡进度
- {{difficulty: "简单"}} — 难度：简单 / 中等 / 困难
- {{description: "游戏描述"}} — 1-2句话介绍游戏核心体验

【技术栈选择】
- 2D 游戏 → 引入 p5.js：
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
- 3D 游戏 → 引入 three.js：
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

【页面结构】
1. 顶部：游戏标题（game_title）+ 得分/关卡显示
2. 中部：游戏画布区域（铺满卡片内容区），CSS 设置 \`touch-action: none\` 防止页面滚动
3. 底部：控制按钮行（开始/暂停/重置）+ 玩法提示文字

【交互】
- 双端兼容控制方式：
  - 触屏：点击/滑动/长按（mousePressed + touchStarted 双事件）
  - 键盘：方向键/WASD/空格（桌面端）
  - 陀螺仪：deviceOrientation（可选，体感游戏）
- 游戏状态管理：
  - 开始前：显示 "▶ 开始游戏" 遮罩层
  - 游戏中：实时更新得分（score_type）
  - 结束：显示最终得分 + "↻ 再来一局" + "📋 分享成绩"（复制分数文本）
- 控制按钮（可见于双端）：
  - ▶ 开始 / ⏸ 暂停
  - ↻ 重置
  - 🔊 音效开关（可选）

【视觉】
- 游戏画布 CSS 添加 \`touch-action: none; user-select: none;\` 防止移动端滚动
- 游戏界面保持暗色沉浸风格，UI 元素使用粉色强调色
- 得分数字使用等宽字体（Monaco / Courier），实时跳动动画
- 游戏结束弹窗：半透明遮罩 + 居中卡片，显示成绩 + 再来一局按钮
- 3D 游戏推荐添加 subtle 雾效（fog）增加场景深度感`,
      en: `${DESIGN_SYSTEM_EN_DUAL}

【Variables - Replace with your content】
- {{game_title: "Game Title"}} — e.g. Neon Snake
- {{dimension: "2D"}} — Dimension: 2D (p5.js) / 3D (three.js)
- {{genre: "Casual"}} — Genre: casual / puzzle / action / racing / shooter / custom
- {{gameplay: "How to Play"}} — e.g. Tap screen to make the ball jump, avoid obstacles
- {{score_type: "Score"}} — Scoring: points / time / collectibles / level progress
- {{difficulty: "Easy"}} — Difficulty: easy / medium / hard
- {{description: "Game Description"}} — 1-2 sentences about core experience

【Tech Stack Selection】
- 2D game → include p5.js:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
- 3D game → include three.js:
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

【Page Structure】
1. Top: Game title (game_title) + score/level display
2. Middle: Game canvas (fills card content area), CSS \`touch-action: none\` prevents page scroll
3. Bottom: Control buttons (Start / Pause / Reset) + gameplay hint text

【Interactions】
- Dual-end compatible controls:
  - Touch: tap / swipe / long-press (mousePressed + touchStarted dual events)
  - Keyboard: arrow keys / WASD / spacebar (desktop only)
  - Gyroscope: deviceOrientation (optional, motion-based games)
- Game state management:
  - Before start: show "▶ Start Game" overlay
  - Playing: real-time score update (score_type)
  - Game Over: show final score + "↻ Play Again" + "📋 Share Score" (copy score text)
- Control buttons (visible on both ends):
  - ▶ Start / ⏸ Pause
  - ↻ Reset
  - 🔊 Sound toggle (optional)

【Visual】
- Game canvas CSS adds \`touch-action: none; user-select: none;\` to prevent mobile scroll
- Keep dark immersive style, UI elements use pink accent color
- Score numbers use monospace font (Monaco / Courier), real-time bounce animation
- Game over modal: semi-transparent overlay + centered card, shows score + play again button
- 3D games: add subtle fog effect for scene depth`,
    },
    sortOrder: 8,
    isActive: true,
  },
];

export function matchTemplate(prompt: string): string | null {
  const lower = prompt.toLowerCase();
  if (lower.includes('弹球') || lower.includes('ball') || lower.includes('打砖块')) return 'bouncing_ball';
  if (lower.includes('相册') || lower.includes('旅行') || lower.includes('photo') || lower.includes('大理')) return 'photo_album';
  if (lower.includes('毒舌') || lower.includes('点评') || lower.includes('roast') || lower.includes('吐槽')) return 'roast_generator';
  if (lower.includes('时光') || lower.includes('胶囊') || lower.includes('心情') || lower.includes('日记')) return 'time_capsule';
  if (lower.includes('躲避') || lower.includes('dodge') || lower.includes('障碍') || lower.includes('跑酷')) return 'dodge_game';
  if (lower.includes('生日') || lower.includes('贺卡') || lower.includes('birthday') || lower.includes('祝福')) return 'birthday_card';
  return null;
}
