// Original pixel drawings and melodies for Super Scratch. No downloaded artwork.
// Deterministic, dependency-free PNG/WAV source; regenerate only these two demo packs.
import {mkdirSync,writeFileSync} from 'node:fs';
import {Pixels} from './pixel-art.mjs';
const themes={
 'midnight-city':{sea:false,sky:'#10172f',far:'#202b4b',mid:'#304365',dark:'#111b31',ground:'#26364b',edge:'#69e5dc',accent:'#fbc35b',pink:'#ef6b9d'},
 'deep-sea-treasure':{sea:true,sky:'#103c64',far:'#165974',mid:'#267d87',dark:'#123d54',ground:'#b78a65',edge:'#f2c88e',accent:'#ffc45b',pink:'#fa8396'}
};
function hero(t,frame){const p=new Pixels(48,48),o=t.dark,bob=frame===1||frame===3?1:0,step=frame===2?-3:frame===3?3:0,jump=frame===4,fall=frame===5,hurt=frame===6,victory=frame===7;const y=bob;
 if(t.sea){ // Copper diving helmet, visible face, tank, gloves and two articulated flippers.
 p.rect(9,22+y,8,17,o);p.rect(10,23+y,5,13,'#94cbb4');p.rect(12,23+y,2,13,'#e1edc0');
 p.rect(17,29+y,16,13,o);p.rect(19,29+y,12,11,'#e77559');p.rect(22,31+y,4,7,'#f8be75');p.rect(17,38+y,16,3,'#f3c05e');
 p.ellipse(25,19+y,13,13,o);p.ellipse(25,18+y,11,11,'#f3c05e');p.ellipse(26,18+y,8,8,'#a3633e');p.ellipse(27,18+y,7,7,'#184d66');p.ellipse(28,19+y,5,5,'#65ced0');p.rect(27,14+y,5,2,'#c9f8df');p.rect(29,19+y,3,2,o);p.rect(16,17+y,2,3,'#ffe5a0');
 p.line(16,30+y,12,jump||victory?20:35+y,o,5);p.line(33,30+y,36,victory?20:jump?24:36+y,o,5);p.rect(12,jump||victory?18:34+y,5,5,'#ffc86d');p.rect(36,victory?18:jump?22:35+y,5,5,'#ffc86d');
 p.rect(19,40,5,jump?3:5+Math.max(0,step),o);p.rect(28,40,5,fall?3:5-Math.min(0,step),o);p.rect(14-step,jump?42:45,11,3,'#70d7b4');p.rect(28+step,fall?42:45,12,3,'#70d7b4');
 if(fall||jump){p.ellipse(39,8,3,3,'#82d6e0');p.ellipse(40,7,1,1,'#e0fbdf');}
 }else{
 p.rect(21,4+y,3,6,o);p.ellipse(22,4+y,3,3,victory?'#fff5c7':t.pink);
 p.rect(11,10+y,27,21,o);p.rect(13,11+y,23,17,'#96b9c9');p.rect(15,12+y,19,3,'#d5e9e2');p.rect(15,16+y,19,10,o);p.rect(17,18+y,5,hurt?1:4,t.edge);p.rect(27,18+y,5,hurt?1:4,t.edge);p.rect(21,25+y,7,2,'#547a99');
 p.rect(15,31+y,19,11,o);p.rect(17,31+y,15,9,'#668ba7');p.rect(22,32+y,6,6,t.accent);p.rect(23,33+y,4,2,'#fff2b4');
 p.line(13,32+y,8,victory?20:jump?27:37+y,o,5);p.line(34,32+y,39,victory?20:jump?27:37+y,o,5);p.rect(7,victory?17:jump?24:36+y,6,5,'#9bbfcc');p.rect(38,victory?17:jump?24:36+y,6,5,'#9bbfcc');
 p.rect(17,40,6,5,o);p.rect(28,40,6,5,o);p.rect(14-step,jump?42:45,10,3,'#7396ac');p.rect(27+step,fall?42:45,11,3,'#7396ac');
 }
 if(hurt){p.line(4,12,8,8,'#fff6c2',2);p.line(40,13,44,9,t.pink,2);}if(victory){p.line(40,2,40,8,t.accent);p.line(37,5,43,5,t.accent);}return p;
}
function enemy(t,f){const p=new Pixels(32,32),y=f%2,dead=f===5;
 if(dead){p.ellipse(16,28,13,3,t.pink);p.rect(9,25,3,3,t.accent);p.rect(22,24,3,3,t.accent);return p;}
 if(t.sea){p.poly([[2,8+y],[10,14+y],[2,25+y]],'#eb7d83');p.ellipse(19,17+y,11,9,t.dark);p.ellipse(19,16+y,10,8,'#f5b765');p.poly([[14,9+y],[20,3+y],[23,10+y]],'#ed797b');p.poly([[14,23+y],[20,28+y],[25,23+y]],'#e37b82');p.rect(17,10+y,3,12,'#fae2a3');p.ellipse(25,14+y,3,3,'#fcf4d3');p.rect(26,13+y,2,3,t.dark);p.line(27,20+y,30,f===4?23:20+y,'#ae5867');}
 else{p.rect(6,12+y,23,14,t.dark);p.rect(8,13+y,19,10,'#be6584');p.rect(10,14+y,15,3,'#f0a5b8');p.rect(21,18+y,5,3,t.accent);p.rect(5,23+y,23,5,t.dark);for(let i=0;i<4;i++)p.rect(7+i*5,25+y,3,3,'#7894ab');p.line(15,11+y,15,5+y,t.dark,2);p.rect(f%2?5:9,3+y,f%2?23:15,2,t.edge);if(f===4)p.rect(28,18+y,4,3,t.accent);}
 return p;
}
function icon(t,f){const p=new Pixels(32,32),o=t.dark;
 if(f<4){if(t.sea){p.ellipse(16,21,13,8,'#b36b94');p.poly([[3,20],[6,13],[26,13],[29,20]],'#f4a2ae');for(let x=8;x<28;x+=5)p.line(16,26,x,14,'#ffe1c7');p.ellipse(16,13,7-(f%2),7,o);p.ellipse(16,12,6-(f%2),6,'#e8f8ec');p.rect(14,8,3,3,'#ffffff');}else{p.rect(10+f%2,3,13-f%2*2,26,o);p.rect(12+f%2,5,9-f%2*2,22,t.edge);p.rect(14,1,5,3,'#c4dbd3');p.rect(14,9,5,11,'#f1ffd0');p.rect(14,11,2,5,t.accent);p.rect(12,23,9,3,'#4fa5a3');}return p;}
 if(f===4){p.poly([[4,8],[9,4],[15,8],[21,4],[27,8],[27,16],[15,28],[4,16]],o);p.poly([[6,9],[10,7],[15,11],[21,7],[25,10],[25,15],[15,25],[6,15]],'#f57a93');p.rect(8,9,4,3,'#ffcfbd');}
 if(f===5){p.ellipse(11,10,8,8,o);p.ellipse(11,10,6,6,t.accent);p.ellipse(11,10,3,3,o);p.line(15,15,27,27,o,5);p.line(16,15,28,27,t.accent,3);p.rect(22,23,4,6,t.accent);}
 if(f>=6&&f<=10){p.ellipse(16,16,14,14,o);p.ellipse(16,15,12,12,[t.accent,t.edge,'#ba95ec','#ef83a0','#90dfa5'][f-6]);p.ellipse(16,15,9,9,t.dark);if(f===6||f===7)p.poly([[16,5],[19,12],[27,12],[21,17],[23,25],[16,21],[9,25],[11,17],[5,12],[13,12]],'#fff2bc');if(f===8)p.poly([[9,23],[9,14],[5,14],[16,5],[27,14],[23,14],[23,23]],'#d3b4fa');if(f===9)p.poly([[18,5],[9,18],[16,18],[13,27],[25,12],[18,12]],'#ffafbf');if(f===10)p.poly([[7,7],[16,10],[25,7],[23,21],[16,27],[9,21]],'#a4ebbc');}
 if(f===11){p.ellipse(16,16,10,10,t.accent);p.ellipse(16,16,6,6,'#fff4bf');}
 return p;
}
function tile(t,f){const p=new Pixels(32,32);p.rect(0,0,32,32,t.ground);p.rect(0,0,32,3,t.edge);p.rect(0,3,32,3,t.mid);for(let y=10;y<32;y+=11){p.rect(0,y,32,1,t.dark);for(let x=(y%2)*8;x<32;x+=16){p.rect(x,y-8,1,8,t.dark);p.rect(x+3,y-6,4,1,t.mid);}}
 if(f===1){p.rect(0,0,32,32,t.dark);p.rect(1,2,30,26,t.mid);p.rect(2,2,28,3,t.edge);p.rect(3,8,25,2,t.ground);for(let x=4;x<30;x+=10)p.rect(x,19,3,3,t.accent);}
 if(f===2){p.rect(0,0,32,32,t.dark);p.rect(2,2,28,28,t.sea?'#8a6177':'#875466');p.line(2,2,28,28,t.accent,3);p.line(2,28,28,2,t.accent,3);p.rect(13,12,7,7,t.dark);}
 if(f===3){p.p.fill(0);for(let x=0;x<32;x+=8){p.poly([[x,31],[x+4,3],[x+8,31]],t.pink);p.line(x+4,6,x+6,29,'#ffd2b7');}p.rect(0,29,32,3,t.dark);}
 if(f===4){p.rect(0,0,32,32,t.sea?'#7e517d':'#79475f');for(let x=0;x<32;x+=8)p.poly([[x,16],[x+4,3],[x+8,16]],t.pink);p.rect(0,20,32,2,t.accent);p.rect(0,27,32,3,t.pink);}
 if(f===5){p.p.fill(0);p.rect(2,25,28,6,t.dark);for(let y=7;y<27;y+=6){p.line(6,y,26,y+3,t.edge,2);p.line(26,y+3,6,y+6,t.edge,2);}p.rect(1,2,30,5,t.pink);p.rect(2,2,28,2,'#ffd1b9');}
 return p;
}
function prop(t,f){const p=new Pixels(64,96);
 if(f===0||f===1){ // Gate, then lit/open gate.
 p.rect(5,8,54,88,t.dark);p.rect(9,12,46,84,t.ground);p.rect(14,18,36,78,f?'#142a3c':t.mid);p.rect(9,12,46,4,t.edge);p.rect(11,20,3,74,t.edge);p.rect(50,20,3,74,t.edge);if(!f){for(let y=24;y<90;y+=12)p.rect(17,y,30,3,t.dark);p.rect(40,48,5,7,t.accent);}else{p.ellipse(32,51,11,15,t.mid);p.ellipse(32,51,7,11,t.edge);}}
 if(f===2||f===3){p.rect(29,13,5,80,t.dark);p.rect(30,14,2,76,t.edge);p.poly([[34,15],[60,22],[53,34],[34,37]],f===3?t.accent:t.pink);p.rect(34,19,10,4,'#fff2bf');p.rect(19,88,27,8,t.dark);p.rect(23,86,19,5,t.mid);}
 if(f===4){p.rect(8,51,48,41,t.dark);p.rect(11,54,42,34,'#aa755d');p.rect(12,53,40,13,t.accent);p.rect(14,69,36,3,t.dark);p.rect(17,54,4,34,t.accent);p.rect(44,54,4,34,t.accent);p.rect(28,64,9,12,t.dark);p.rect(30,66,5,7,t.edge);}
 if(f===5){if(t.sea){p.line(29,94,29,26,'#d96b8e',7);p.line(29,66,12,47,'#d96b8e',6);p.line(13,48,12,31,'#f29aa5',4);p.line(29,52,47,34,'#d96b8e',6);p.line(47,35,47,17,'#f29aa5',4);p.line(30,81,51,64,'#d96b8e',5);p.line(51,66,53,51,'#f29aa5',4);p.ellipse(30,92,23,4,t.ground);}else{p.rect(29,23,5,73,t.dark);p.rect(30,25,2,66,t.mid);p.rect(15,17,33,8,t.dark);p.rect(18,19,27,4,t.edge);p.line(16,23,8,53,'#69e5dc22',4);p.line(47,23,55,53,'#69e5dc22',4);p.rect(22,90,19,6,t.mid);}}
 return p;
}
function background(t,near=false){const p=new Pixels(512,270);if(!near){for(let y=0;y<270;y++)p.rect(0,y,512,1,y<80?t.sky:y<160?t.far:t.mid);if(!t.sea){p.ellipse(405,45,21,21,'#f7d89a');p.ellipse(412,39,20,19,t.sky);for(let i=0;i<65;i++)p.rect((i*79)%512,(i*37)%150,i%3===0?2:1,1,'#8494b2');}else{for(let i=0;i<6;i++)p.poly([[i*104,0],[i*104+25,0],[i*104+110,220],[i*104+50,220]],'#20647b');for(let i=0;i<38;i++){let x=(i*79)%512,y=(i*47)%200;p.ellipse(x,y,2,3,'#5a9da4');p.dot(x,y-1,'#add8ce');}}}
 for(let i=0;i<14;i++){let x=i*40-12,h=40+(i*31)%110,y=270-h;if(t.sea){p.poly([[x,270],[x+7,y+30],[x+19,y],[x+31,y+42],[x+43,270]],near?'#184958':'#236a7b');for(let n=0;n<3;n++)p.line(x+20,270,x+15+n*9,y+50+n*8,near?'#277875':'#377f88',3);}else{p.rect(x,y,34,h,near?'#172640':'#223653');p.rect(x+3,y-5,28,5,near?'#2d4561':'#2b4260');p.rect(x+17,y-15,2,11,'#45617b');for(let yy=y+8;yy<265;yy+=12)for(let xx=x+5;xx<x+31;xx+=8)if((xx+yy)%5)p.rect(xx,yy,3,5,near?((xx+yy)%3?t.edge:t.pink):'#52737f');if(near&&i%4===0){p.rect(x+4,y+21,25,12,t.pink);p.rect(x+7,y+24,19,2,'#ffe0ba');}}}return p;}
function sheet(frames){const s=new Pixels(frames[0].w*frames.length,frames[0].h);frames.forEach((p,i)=>s.blit(p,i*p.w,0));return s;}
function wav(path,sea,effect=false,finish=false){const rate=22050,duration=effect?(finish?1.1:.22):8,length=Math.floor(rate*duration),data=Buffer.alloc(length*2),notes=sea?[62,69,74,77,76,69,65,69,60,67,72,76,74,67,64,67]:[57,64,69,72,76,72,69,64,53,60,65,69,72,69,65,60];for(let i=0;i<length;i++){const time=i/rate,beat=Math.floor(time/.25),local=time%.25,note=effect?76+Math.floor(time*20)*3:notes[beat%16],f=440*2**((note-69)/12),envelope=effect?Math.max(0,1-time/duration):Math.min(1,local/.008)*Math.max(0,1-local/.25);let value=(Math.sin(time*f*2*Math.PI)*.65+Math.sin(time*f*4*Math.PI)*.12)*envelope*.3;if(!effect)value+=Math.sin(time*(440*2**(((sea?38:33)+(Math.floor(time/2)%2)*5-69)/12))*Math.PI*2)*.12*Math.min(1,local/.01);data.writeInt16LE(Math.round(Math.max(-1,Math.min(1,value))*32767),i*2);}const h=Buffer.alloc(44);h.write('RIFF');h.writeUInt32LE(36+data.length,4);h.write('WAVEfmt ',8);h.writeUInt32LE(16,16);h.writeUInt16LE(1,20);h.writeUInt16LE(1,22);h.writeUInt32LE(rate,24);h.writeUInt32LE(rate*2,28);h.writeUInt16LE(2,32);h.writeUInt16LE(16,34);h.write('data',36);h.writeUInt32LE(data.length,40);writeFileSync(path,Buffer.concat([h,data]));}
for(const [id,t] of Object.entries(themes)){const dir=`public/assets/${id}`;mkdirSync(dir,{recursive:true});const save=(name,p)=>p.save(`${dir}/${name}.png`);save('hero',sheet(Array.from({length:8},(_,f)=>hero(t,f))));save('enemies',sheet(Array.from({length:6},(_,f)=>enemy(t,f))));save('items',sheet(Array.from({length:12},(_,f)=>icon(t,f))));save('tiles',sheet(Array.from({length:6},(_,f)=>tile(t,f))));save('props',sheet(Array.from({length:6},(_,f)=>prop(t,f))));save('background',background(t));save('near',background(t,true));
 const fore=new Pixels(512,270);for(let i=0;i<5;i++){if(t.sea){fore.line(i*110+20,270,i*110+14,232-i*3,'#123d54',5);fore.line(i*110+14,249,i*110,237,'#123d54',4);}else{fore.rect(i*120,260,4,10,t.dark);fore.line(i*120,262,i*120+100,262,t.dark,2);}}save('foreground',fore);
 const cards=[];for(let f=0;f<4;f++){const card=new Pixels(512,288);card.blit(background(t),0,0);card.blit(background(t,true),0,25);card.rect(0,250,512,38,t.ground);for(let x=0;x<512;x+=32)card.blit(tile(t,0),x,250);card.blit(prop(t,5),30,154);card.blit(prop(t,5),410,154);card.blit(hero(t,f===3?7:f),180,106,3);card.blit(icon(t,f),315,177,2);card.blit(enemy(t,f),360,218);cards.push(card);}save('card',cards[0]);save('story',cards[1]);save('completion',cards[3]);save('intro',sheet(cards));
 for(let a=0;a<2;a++){const p=new Pixels(48,48);p.rect(0,0,48,48,a?t.mid:t.far);p.blit(a?enemy(t,0):hero(t,7),a?8:0,a?8:0);save('avatar-'+(a+1),p);}wav(`${dir}/music.wav`,t.sea);wav(`${dir}/collect.wav`,t.sea,true);wav(`${dir}/finish.wav`,t.sea,true,true);
 writeFileSync(`${dir}/CREDITS.txt`,'Original pixel art and original synthesized melodies created for Super Scratch V2.1. Source: scripts/generate-demo-assets.mjs. No third-party images, samples or characters. Demonstration maker avatars, not real student portraits.\n');console.log(`Generated ${id}`);
}
