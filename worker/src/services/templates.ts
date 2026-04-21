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
    type: 'memory',
    emoji: '📸',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0a0f;color:#fff;font-family:sans-serif;height:100vh;overflow:hidden}.album{display:flex;transition:transform .4s ease;height:70vh;margin-top:5vh}.slide{min-width:100%;display:flex;align-items:center;justify-content:center;padding:20px}.photo{width:90%;max-height:100%;border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:3/4;font-size:120px;position:relative;overflow:hidden}.caption{position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,.8));text-align:center}.caption h3{font-size:18px;margin-bottom:4px}.caption p{font-size:13px;opacity:.7}.dots{display:flex;justify-content:center;gap:8px;margin-top:20px}.dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.3);transition:all .3s}.dot.active{background:#f093fb;width:24px;border-radius:4px}.header{text-align:center;padding:20px}.header h1{font-size:22px;background:linear-gradient(135deg,#f093fb,#f5576c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.header p{font-size:13px;color:rgba(255,255,255,.5);margin-top:4px}</style></head><body><div class="header"><h1>大理之旅</h1><p>左右滑动查看 · 2026年春</p></div><div class="album" id="album"><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#667eea,#764ba2)">🏔️<div class="caption"><h3>苍山雪景</h3><p>海拔4122米的苍山</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">🌊<div class="caption"><h3>洱海日出</h3><p>清晨5点的宁静</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#f093fb,#f5576c)">🌸<div class="caption"><h3>古城花巷</h3><p>三月的樱花开满城</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#43e97b,#38f9d7)">🍵<div class="caption"><h3>下午茶时光</h3><p>在古城里发呆的午后</p></div></div></div><div class="slide"><div class="photo" style="background:linear-gradient(135deg,#fa709a,#fee140)">🌅<div class="caption"><h3>双廊落日</h3><p>最美的不是日落，是陪你看日落的人</p></div></div></div></div><div class="dots" id="dots"></div><script>const album=document.getElementById('album'),dotsEl=document.getElementById('dots'),total=5;let cur=0,startX=0,dx=0;for(let i=0;i<total;i++){const d=document.createElement('div');d.className='dot'+(i===0?' active':'');dotsEl.appendChild(d)}function go(n){cur=Math.max(0,Math.min(total-1,n));album.style.transform='translateX('+(-cur*100)+'%)';document.querySelectorAll('.dot').forEach((d,i)=>d.className='dot'+(i===cur?' active':''))}album.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;album.style.transition='none'},{passive:true});album.addEventListener('touchmove',e=>{dx=e.touches[0].clientX-startX;album.style.transform='translateX('+(-cur*100+dx/3.75)+'%)'},{passive:true});album.addEventListener('touchend',()=>{album.style.transition='transform .4s ease';if(dx<-50)go(cur+1);else if(dx>50)go(cur-1);else go(cur);dx=0});let mouseDown=false;album.addEventListener('mousedown',e=>{mouseDown=true;startX=e.clientX;album.style.transition='none'});album.addEventListener('mousemove',e=>{if(!mouseDown)return;dx=e.clientX-startX;album.style.transform='translateX('+(-cur*100+dx/3.75)+'%)'});album.addEventListener('mouseup',()=>{mouseDown=false;album.style.transition='transform .4s ease';if(dx<-50)go(cur+1);else if(dx>50)go(cur-1);else go(cur);dx=0})</script></body></html>`,
  },

  roast_generator: {
    title: '毒舌点评',
    description: '输入名字，AI 给你一段毒舌点评',
    type: 'generator',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    code: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box}body{background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;font-family:sans-serif;height:100vh;display:flex;flex-direction:column;align-items:center;padding:40px 20px;overflow:hidden}.title{font-size:28px;margin-bottom:8px;text-align:center}.subtitle{font-size:14px;opacity:.6;margin-bottom:30px}.input-wrap{width:100%;max-width:320px;position:relative;margin-bottom:20px}input{width:100%;padding:14px 20px;border-radius:25px;border:2px solid rgba(79,172,254,.3);background:rgba(255,255,255,.08);color:#fff;font-size:16px;outline:none;backdrop-filter:blur(10px);transition:border-color .3s}input:focus{border-color:#4facfe}input::placeholder{color:rgba(255,255,255,.3)}.btn{padding:14px 40px;border-radius:25px;border:none;background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff;font-size:16px;font-weight:600;cursor:pointer;transition:all .2s;margin-bottom:30px}.btn:active{transform:scale(.95)}.result{width:100%;max-width:320px;min-height:200px;background:rgba(255,255,255,.05);border-radius:20px;padding:24px;border:1px solid rgba(79,172,254,.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;text-align:center;line-height:1.8;font-size:15px;transition:all .3s}.typing{display:inline-block;overflow:hidden;white-space:pre-wrap;border-right:2px solid #4facfe;animation:blink .8s infinite}@keyframes blink{0%,100%{border-color:#4facfe}50%{border-color:transparent}}</style></head><body><div class="title">🔮 毒舌点评机</div><div class="subtitle">输入名字，获得一段犀利点评</div><div class="input-wrap"><input id="name" placeholder="输入你的名字..." maxlength="10"></div><button class="btn" onclick="generate()">开始点评 ⚡</button><div class="result" id="result">等待输入中...</div><script>const roasts=["作为一个{name}，你最大的优点就是...让我想想...嗯...你很勇敢地活着。","听说{name}小时候被夸过一次聪明，从此就再也没进步过了。","{name}？这名字起得不错，可惜浪费了。","如果无聊是一种超能力，{name}一定是这个领域的天花板。","别人是一日不见如隔三秋，{name}是一日不见...清静了不少。","{name}的存在证明了一件事：上帝也有摸鱼的时候。","我对{name}的评价就四个字：勇气可嘉。毕竟每天照镜子都需要勇气。","{name}要是去参加选秀，评委会说：你很有勇气站在这里，这就是你最大的才华。","认识{name}之后我明白了一个道理：人和人之间的差距，有时候比人和狗还大。","如果把{name}的才华做成饼，大概够蚂蚁吃一口的。"];function generate(){const name=document.getElementById('name').value.trim()||'路人甲';const roast=roasts[Math.floor(Math.random()*roasts.length)].replace(/{name}/g,name);const el=document.getElementById('result');el.innerHTML='';let i=0;el.className='result typing';function type(){if(i<roast.length){el.textContent+=roast[i];i++;setTimeout(type,50+Math.random()*30)}else{el.className='result'}}type()}</script></body></html>`,
  },

  time_capsule: {
    title: '时光相册',
    description: '写下此刻的心情，封存到未来',
    type: 'memory',
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
export interface PromptTemplate {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  prompt: string;
  sortOrder: number;
  isActive: boolean;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'game_bouncing',
    title: '弹球游戏',
    emoji: '🎮',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    prompt: '做一个弹球打砖块小游戏：点击屏幕向上发射小球，彩色砖块被击中后消失并加分，顶部显示当前得分，支持触屏操作。',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'memory_album',
    title: '旅行相册',
    emoji: '📸',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    prompt: '做一个可左右滑动的旅行相册：每张卡片展示一张风景图和一段文案，底部有小圆点指示当前位置，配一个温柔的标题与简短描述。',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'gen_roast',
    title: '毒舌生成器',
    emoji: '🤖',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    prompt: '做一个毒舌点评生成器：用户输入名字，点击按钮生成一段犀利又搞笑的点评，文字用打字机效果逐字显示，深紫色霓虹风格。',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'memory_capsule',
    title: '时光胶囊',
    emoji: '⏰',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    prompt: '做一个时光胶囊：用户写下一段话给未来的自己，点击封存后显示"将在一年后开启"，并触发彩色粒子庆祝动画。',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'game_dodge',
    title: '躲避障碍',
    emoji: '🎯',
    gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    prompt: '做一个竖屏躲避障碍小游戏：方块从顶部随机下落，手指拖动或鼠标控制底部角色左右躲避，越玩越快，碰撞结束并显示得分与最高记录。',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'card_birthday',
    title: '生日贺卡',
    emoji: '🎂',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    prompt: '做一个动态生日贺卡：蛋糕持续弹跳，点击蛋糕变成礼物并冒出音符，下方按钮触发彩色纸屑从顶部洒落的烟花动画。',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'gen_quote',
    title: '语录卡片',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
    prompt: '做一个随机语录生成器：点击"换一句"按钮随机展示一句励志或搞笑语录，卡片有淡入淡出动画，提供一个"复制"按钮。',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'game_memory',
    title: '翻牌记忆',
    emoji: '🃏',
    gradient: 'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
    prompt: '做一个 4x4 翻牌记忆游戏：16 张卡片两两配对 emoji，玩家翻开两张，相同则保留否则翻回；顶部显示步数与用时，全部配对完成显示恭喜页面与"再来一局"。',
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
