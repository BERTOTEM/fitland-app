import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════
//  ASSET BASE URL
// ═══════════════════════════════════════════════════
const RAW = "https://cdn.jsdelivr.net/gh/BERTOTEM/fitland-assets@main";

const HERO_IMG = {
  warrior:  { base: `${RAW}/Personajes/Guerrero/Base.PNG`,  spec1: `${RAW}/Personajes/Guerrero/Especializacion_1_Campeon.PNG`,       spec2: `${RAW}/Personajes/Guerrero/Especializacion_2_Berserker.PNG` },
  ranger:   { base: `${RAW}/Personajes/Explorador/Base.PNG`,spec1: `${RAW}/Personajes/Explorador/Especializacion_1_Cazador.PNG`,     spec2: `${RAW}/Personajes/Explorador/Especializacion_2_Sombra.PNG` },
  monk:     { base: `${RAW}/Personajes/Monje/Base.PNG`,     spec1: `${RAW}/Personajes/Monje/Especializacion_1_Sanador.PNG`,          spec2: `${RAW}/Personajes/Monje/Especializacion_2_Asceta.PNG` },
  paladin:  { base: `${RAW}/Personajes/Paladin/Base.PNG`,   spec1: `${RAW}/Personajes/Paladin/Especializacion_1_Templario.PNG`,      spec2: `${RAW}/Personajes/Paladin/Especializacion_2_Cruzado.PNG` },
  assassin: { base: `${RAW}/Personajes/Asesino/Base.PNG`,   spec1: `${RAW}/Personajes/Asesino/Especializacion_1_Sombra_letal.PNG`,  spec2: `${RAW}/Personajes/Asesino/Especializacion_2_Dualista_veloz.PNG` },
  druid:    { base: `${RAW}/Personajes/Druida/Base.PNG`,    spec1: `${RAW}/Personajes/Druida/Especializacion_1_Chaman.PNG`,          spec2: `${RAW}/Personajes/Druida/Especializacion_2_Archon.PNG` },
};

const ZONE_IMG = {
  valley:  { mob1: `${RAW}/Zonas/Valle_del_inicio/Mob_1.PNG`,   mob2: `${RAW}/Zonas/Valle_del_inicio/Mob_2.PNG`,   miniboss: `${RAW}/Zonas/Valle_del_inicio/Mini_Boss.PNG`,   boss: `${RAW}/Zonas/Valle_del_inicio/Boss.PNG`,   map: `${RAW}/Zonas/Valle_del_inicio/Mapa.png` },
  forest:  { mob1: `${RAW}/Zonas/Bosque_sombrio/Mob_1.PNG`,     mob2: `${RAW}/Zonas/Bosque_sombrio/Mob_2.PNG`,     miniboss: `${RAW}/Zonas/Bosque_sombrio/Mini_Boss.PNG`,     boss: `${RAW}/Zonas/Bosque_sombrio/Boss.PNG`,     map: `${RAW}/Zonas/Bosque_sombrio/Mapa.png` },
  cave:    { mob1: `${RAW}/Zonas/Cueva_cristal/Mob_1.PNG`,      mob2: `${RAW}/Zonas/Cueva_cristal/Mob_2.PNG`,      miniboss: `${RAW}/Zonas/Cueva_cristal/Mini_Boss.PNG`,      boss: `${RAW}/Zonas/Cueva_cristal/Boss.PNG`,      map: `${RAW}/Zonas/Cueva_cristal/Mapa.png` },
  castle:  { mob1: `${RAW}/Zonas/Castillo_Maldito/Mob_1.PNG`,   mob2: `${RAW}/Zonas/Castillo_Maldito/Mob_2.PNG`,   miniboss: `${RAW}/Zonas/Castillo_Maldito/Mini_Boss.PNG`,   boss: `${RAW}/Zonas/Castillo_Maldito/Boss.PNG`,   map: `${RAW}/Zonas/Castillo_Maldito/Mapa.png` },
  abyss:   { mob1: `${RAW}/Zonas/El_abismo/Mob_1.PNG`,          mob2: `${RAW}/Zonas/El_abismo/Mob_2.PNG`,          miniboss: `${RAW}/Zonas/El_abismo/Mini_Boss.PNG`,          boss: `${RAW}/Zonas/El_abismo/Boss.PNG`,          map: `${RAW}/Zonas/El_abismo/Mapa.png` },
};

// ═══════════════════════════════════════════════════
//  GAME DATA
// ═══════════════════════════════════════════════════
const XP_PER_LEVEL   = 100;
const STAMINA_PER_XP = 2;
const MAX_STAMINA    = 500;
const SPEC_LEVEL     = 10;

const LEVEL_TITLES = ["Novato","Aprendiz","Iniciado","Aventurero","Veterano","Experto","Maestro","Gran Maestro","Élite","Legendario"];

const STAT_CFG = {
  fuerza:    { label:"Fuerza",    icon:"⚔️", color:"#e74c3c", glow:"#ff6b6b", exercises:["Pesas libres","Press banca","Sentadillas","Peso muerto","Dominadas","Press militar","Remo con barra"], xpPerUnit:10, unit:"kg"  },
  velocidad: { label:"Velocidad", icon:"💨", color:"#3498db", glow:"#74b9ff", exercises:["Correr","Bicicleta","Saltar cuerda","Sprints","HIIT","Elíptica","Natación"],                          xpPerUnit:5,  unit:"min" },
  vitalidad: { label:"Vitalidad", icon:"💚", color:"#2ecc71", glow:"#55efc4", exercises:["Yoga","Pilates","Natación","Plancha","Estiramientos","Meditación","Wim Hof"],                          xpPerUnit:8,  unit:"min" },
};

const CLASSES = [
  { id:"warrior",  label:"Guerrero",   icon:"⚔️", primary:"fuerza",    color:"#e74c3c", accent:"#ff6b6b", desc:"Maestro del acero. Cada rep forja su leyenda.",        statBonus:{atk:1.5,def:1.2,spd:0.9,hp:1.3}, skills:[{id:"slash",   name:"Tajo Profundo",   icon:"⚔️", cost:30, dmgMult:2.0, desc:"Golpe preciso"},{id:"berserk", name:"Furia Berserker",  icon:"🔥", cost:80, dmgMult:4.0, desc:"Daño devastador"}], specs:[{id:"campeon",  label:"Campeón",       icon:"🏆", desc:"+50% XP en Fuerza. Golpe definitivo más potente."},{id:"berserker",label:"Berserker",      icon:"🔥", desc:"Ataque doble en combo. Sin piedad."}] },
  { id:"ranger",   label:"Explorador", icon:"🏹", primary:"velocidad", color:"#3498db", accent:"#74b9ff", desc:"Veloz como el viento. Ninguna distancia lo detiene.",   statBonus:{atk:1.2,def:0.9,spd:1.6,hp:1.0}, skills:[{id:"arrow",   name:"Flecha Rápida",   icon:"🏹", cost:25, dmgMult:1.8, desc:"Ataque veloz"},{id:"barrage",  name:"Lluvia de Flechas",icon:"🌧️", cost:70, dmgMult:3.2, desc:"Múltiples impactos"}], specs:[{id:"cazador",  label:"Cazador",       icon:"🦅", desc:"+60% XP en cardio. Crítico en sprints."},{id:"sombra",   label:"Sombra",        icon:"🌑", desc:"Velocidad se convierte en evasión."}] },
  { id:"monk",     label:"Monje",      icon:"🌿", primary:"vitalidad", color:"#2ecc71", accent:"#55efc4", desc:"Equilibrio perfecto entre cuerpo y mente.",             statBonus:{atk:1.0,def:1.1,spd:1.2,hp:1.6}, skills:[{id:"chi",     name:"Golpe de Chi",    icon:"💫", cost:28, dmgMult:1.7, heal:15, desc:"Cura + daño"},{id:"zen",      name:"Zen Nova",         icon:"☯️",  cost:65, dmgMult:2.8, heal:30, desc:"Onda curativa"}], specs:[{id:"sanador",  label:"Sanador",       icon:"💊", desc:"Curación doble. Nunca te cansas."},{id:"asceta",   label:"Asceta",        icon:"☯️",  desc:"+30% a todos los stats."}] },
  { id:"paladin",  label:"Paladín",    icon:"🛡️", primary:"fuerza",    color:"#f39c12", accent:"#ffeaa7", desc:"Fuerza y honor. Un bastión inquebrantable.",           statBonus:{atk:1.2,def:1.8,spd:0.8,hp:1.5}, skills:[{id:"smite",   name:"Castigo Sagrado", icon:"✨", cost:35, dmgMult:1.9, desc:"Daño sagrado"},{id:"holy",     name:"Ira Divina",        icon:"👼", cost:90, dmgMult:3.8, desc:"Golpe celestial"}], specs:[{id:"templario",label:"Templario",     icon:"✝️", desc:"Fuerza y Vitalidad juntas."},{id:"cruzado",  label:"Cruzado",       icon:"⚔️", desc:"+60% XP en peso muerto."}] },
  { id:"assassin", label:"Asesino",    icon:"🗡️", primary:"velocidad", color:"#9b59b6", accent:"#d2a8ff", desc:"Sombra y rapidez. Golpea antes de que te vean.",       statBonus:{atk:1.8,def:0.7,spd:1.5,hp:0.9}, skills:[{id:"backstab",name:"Puñalada Crítica",icon:"🗡️", cost:22, dmgMult:2.5, desc:"Siempre crítico"},{id:"death",    name:"Sombra Mortal",    icon:"💀", cost:65, dmgMult:4.5, desc:"Daño extremo"}], specs:[{id:"sombra_letal",label:"Sombra Letal",icon:"💀", desc:"+70% XP en HIIT. Crítico garantizado."},{id:"dualista",  label:"Dualista Veloz", icon:"⚡", desc:"Velocidad se transfiere a ATK."}] },
  { id:"druid",    label:"Druida",     icon:"🍃", primary:"vitalidad", color:"#1abc9c", accent:"#81ecec", desc:"La naturaleza fluye por sus venas.",                    statBonus:{atk:1.0,def:1.3,spd:1.1,hp:1.4}, skills:[{id:"thorns",  name:"Espinas",         icon:"🌿", cost:28, dmgMult:1.7, desc:"Daño natural"},{id:"storm",    name:"Tormenta",          icon:"⚡", cost:70, dmgMult:3.0, desc:"Furia elemental"}], specs:[{id:"chaman",   label:"Chamán",        icon:"🌊", desc:"+50% XP en yoga y natación."},{id:"archon",   label:"Archon",        icon:"⚡", desc:"Todos los stats +20%."}] },
];

const ZONES = [
  { id:"valley",  name:"Valle del Inicio",   emoji:"🌄", unlockXP:0,    bg:"#0a1a08", accent:"#3a7a20", desc:"Tus primeros pasos.", stamBase:20,
    monsters:[
      { name:"Rata Gigante",    type:"mob1",     hp:25,  atk:4,  def:1,  xpR:8,   goldR:4,   level:1,  stamCost:20 },
      { name:"Goblin Salvaje",  type:"mob2",     hp:40,  atk:7,  def:2,  xpR:14,  goldR:7,   level:1,  stamCost:25 },
      { name:"Orco Brutal",     type:"miniboss", hp:70,  atk:12, def:4,  xpR:28,  goldR:15,  level:2,  stamCost:35 },
      { name:"Señor del Valle", type:"boss",     hp:120, atk:18, def:7,  xpR:55,  goldR:30,  level:3,  stamCost:55, isBoss:true },
    ]
  },
  { id:"forest",  name:"Bosque Sombrío",     emoji:"🌲", unlockXP:400,  bg:"#080f08", accent:"#1a5a10", desc:"La oscuridad crece.", stamBase:35,
    monsters:[
      { name:"Lobo Sombrío",    type:"mob1",     hp:80,  atk:16, def:6,  xpR:25,  goldR:13,  level:3,  stamCost:35 },
      { name:"Jabalí Rabioso",  type:"mob2",     hp:110, atk:22, def:9,  xpR:38,  goldR:20,  level:3,  stamCost:45 },
      { name:"Troll Menor",     type:"miniboss", hp:160, atk:28, def:13, xpR:60,  goldR:35,  level:4,  stamCost:65 },
      { name:"Troll del Bosque",type:"boss",     hp:280, atk:38, def:18, xpR:120, goldR:70,  level:5,  stamCost:100, isBoss:true },
    ]
  },
  { id:"cave",    name:"Cueva de Cristal",   emoji:"💎", unlockXP:1200, bg:"#080814", accent:"#2a2a8a", desc:"Criaturas cristalizadas.", stamBase:55,
    monsters:[
      { name:"Murciélago",      type:"mob1",     hp:150, atk:30, def:12, xpR:45,  goldR:25,  level:5,  stamCost:55 },
      { name:"Araña Venenosa",  type:"mob2",     hp:180, atk:38, def:16, xpR:60,  goldR:35,  level:6,  stamCost:65 },
      { name:"Mini Gólem",      type:"miniboss", hp:260, atk:44, def:22, xpR:90,  goldR:55,  level:7,  stamCost:90 },
      { name:"Gólem de Cristal",type:"boss",     hp:450, atk:58, def:32, xpR:180, goldR:110, level:8,  stamCost:140, isBoss:true },
    ]
  },
  { id:"castle",  name:"Castillo Maldito",   emoji:"🏰", unlockXP:3500, bg:"#100810", accent:"#5a1a6a", desc:"Las fuerzas oscuras reinan.", stamBase:80,
    monsters:[
      { name:"Caballero Oscuro",type:"mob1",     hp:260, atk:55, def:28, xpR:80,  goldR:50,  level:8,  stamCost:80 },
      { name:"Mago Sombrío",    type:"mob2",     hp:220, atk:68, def:20, xpR:95,  goldR:60,  level:9,  stamCost:90 },
      { name:"Caballero Jefe",  type:"miniboss", hp:380, atk:75, def:36, xpR:140, goldR:90,  level:10, stamCost:120 },
      { name:"Liche Supremo",   type:"boss",     hp:650, atk:90, def:46, xpR:260, goldR:160, level:11, stamCost:180, isBoss:true },
    ]
  },
  { id:"abyss",   name:"El Abismo",          emoji:"🌑", unlockXP:8000, bg:"#050508", accent:"#3a0a5a", desc:"Solo los legendarios llegan aquí.", stamBase:110,
    monsters:[
      { name:"Demonio Guardián",type:"mob1",     hp:400, atk:90, def:45, xpR:130, goldR:80,  level:12, stamCost:110 },
      { name:"Ángel Caído",     type:"mob2",     hp:380, atk:100,def:50, xpR:150, goldR:95,  level:13, stamCost:120 },
      { name:"Señor Demoníaco", type:"miniboss", hp:580, atk:110,def:58, xpR:220, goldR:140, level:14, stamCost:160 },
      { name:"Dragón Eterno",   type:"boss",     hp:1000,atk:130,def:65, xpR:400, goldR:250, level:15, stamCost:220, isBoss:true, isFinal:true },
    ]
  },
];

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const getLevel    = xp => Math.floor(xp/XP_PER_LEVEL)+1;
const getXpPct    = xp => (xp%XP_PER_LEVEL)/XP_PER_LEVEL*100;
const getLvTitle  = lv => LEVEL_TITLES[Math.min(lv-1,LEVEL_TITLES.length-1)];
const rand        = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const totalXP     = s => Object.values(s).reduce((a,v)=>a+v.xp,0);

function heroStats(hero, stats) {
  const cls = CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  const fLv=getLevel(stats.fuerza.xp), vLv=getLevel(stats.velocidad.xp), viLv=getLevel(stats.vitalidad.xp);
  return {
    atk: Math.round((12+fLv*3.5)*cls.statBonus.atk),
    def: Math.round((6+viLv*2.2)*cls.statBonus.def),
    spd: Math.min(3.0,(1.0+vLv*0.06)*cls.statBonus.spd),
    hp:  Math.round((70+viLv*9+fLv*4)*cls.statBonus.hp),
  };
}

function heroImgSrc(hero) {
  const imgs = HERO_IMG[hero.class];
  if (!imgs) return "";
  if (hero.specialization) {
    const cls = CLASSES.find(c=>c.id===hero.class);
    const specIdx = cls?.specs.findIndex(s=>s.id===hero.specialization);
    if (specIdx===0) return imgs.spec1;
    if (specIdx===1) return imgs.spec2;
  }
  return imgs.base;
}

// ═══════════════════════════════════════════════════
//  SPRITE — simple img with crossOrigin (assets already have transparent bg)
// ═══════════════════════════════════════════════════
function Sprite({ src, size=120, flip=false, shake=false, flash="", defeated=false, alt="" }) {
  const f = [
    flash   ? `drop-shadow(0 0 10px ${flash}) brightness(1.5)` : "",
    defeated? "grayscale(1) opacity(0.3)" : "",
  ].filter(Boolean).join(" ");
  return (
    <div style={{
      width:size, height:size, flexShrink:0, position:"relative",
      animation: shake ? "imgShake 0.3s ease" : undefined,
      filter: f || undefined,
      transition:"filter 0.15s",
    }}>
      <img
        src={src}
        crossOrigin="anonymous"
        alt={alt}
        style={{
          width:"100%", height:"100%", objectFit:"contain",
          transform: flip ? "scaleX(-1)" : undefined,
          imageRendering:"auto",
          display:"block",
        }}
      />
    </div>
  );
}

function HeroImg({ hero, size=120, flip=false, shake=false, flash="" }) {
  return <Sprite src={heroImgSrc(hero)} size={size} flip={flip} shake={shake} flash={flash} alt={hero.class}/>;
}

function EnemyImg({ zone, monsterType, size=120, shake=false, flash="", defeated=false }) {
  const src = ZONE_IMG[zone.id]?.[monsterType] || "";
  return <Sprite src={src} size={size} flip={true} shake={shake} flash={flash} defeated={defeated} alt={monsterType}/>;
}

// ═══════════════════════════════════════════════════
//  CHARACTER CREATOR
// ═══════════════════════════════════════════════════
function CharacterCreator({ onDone, initial }) {
  const [step, setStep]   = useState(0);
  const [hero, setHero]   = useState(initial || { name:"", class:"warrior", specialization:null });
  const cls = CLASSES.find(c=>c.id===hero.class) || CLASSES[0];

  return (
    <div style={{minHeight:"100vh",background:"#060612",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'Courier New',monospace"}}>
      {/* Stars */}
      <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none"}}>
        {[...Array(50)].map((_,i)=>(
          <div key={i} style={{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:Math.random()<0.6?1:2,height:Math.random()<0.6?1:2,borderRadius:"50%",background:"#fff",opacity:0.1+Math.random()*0.4,animation:`tw ${2+Math.random()*4}s ease-in-out infinite`,animationDelay:`${Math.random()*4}s`}}/>
        ))}
      </div>
      <style>{`
        @keyframes tw{0%,100%{opacity:0.1}50%{opacity:0.7}}
        @keyframes floatHero{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes imgShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        .ci{background:#0e0e1c;border:2px solid #2d2060;color:#e8e0ff;border-radius:8px;padding:12px 16px;font-size:16px;font-family:'Courier New',monospace;width:100%;box-sizing:border-box;outline:none;text-align:center;letter-spacing:3px;transition:border-color 0.2s;}
        .ci:focus{border-color:#7c3aed;}
        .cb{width:100%;padding:13px;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:'Courier New',monospace;letter-spacing:2px;transition:all 0.15s;}
        .cb:hover{transform:translateY(-2px);}
        .inp{background:#0e0e1c;border:1px solid #1e1e3a;color:#e8e0ff;border-radius:8px;padding:10px 14px;font-size:12px;font-family:'Courier New',monospace;width:100%;box-sizing:border-box;outline:none;transition:border-color 0.2s;}
        .inp:focus{border-color:#7c3aed;}
        .tab{background:none;border:none;cursor:pointer;padding:8px 0;font-family:'Courier New',monospace;font-size:9px;letter-spacing:1.5px;border-bottom:2px solid transparent;transition:all 0.2s;white-space:nowrap;}
        .tab.on{color:#a78bfa;border-bottom-color:#a78bfa;}
        .tab:not(.on){color:#4b5563;}
        .tab:hover:not(.on){color:#7c3aed;}
      `}</style>

      <div style={{maxWidth:440,width:"100%",position:"relative",zIndex:1}}>
        {/* Steps */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:20}}>
          {["Nombre","Clase"].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,background:i<=step?"#7c3aed":"#1a1a2e",border:`2px solid ${i<=step?"#7c3aed":"#2d2d4e"}`,color:i<=step?"#fff":"#4b5563"}}>{i+1}</div>
              <span style={{fontSize:9,color:i===step?"#c4b5fd":"#4b5563",letterSpacing:1}}>{s.toUpperCase()}</span>
              {i<1&&<div style={{width:16,height:1,background:i<step?"#7c3aed":"#2d2d4e"}}/>}
            </div>
          ))}
        </div>

        {/* Hero preview */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
          <div style={{animation:"floatHero 3s ease-in-out infinite", width:160, height:160}}>
            <HeroImg hero={hero} size={160}/>
          </div>
          <div style={{marginTop:8,fontSize:9,color:cls.color,letterSpacing:2}}>{cls.icon} {cls.label.toUpperCase()}</div>
        </div>

        {step===0 && (
          <div>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:16,color:"#e8e0ff",marginBottom:4}}>¿Cuál es tu nombre, héroe?</div>
              <div style={{fontSize:10,color:"#6b7280"}}>Con este nombre serás conocido en Fitland</div>
            </div>
            <input className="ci" placeholder="TU NOMBRE..." maxLength={14} value={hero.name}
              onChange={e=>setHero({...hero,name:e.target.value})}
              onKeyDown={e=>{if(e.key==="Enter"&&hero.name.trim())setStep(1);}}/>
            <button className="cb" style={{marginTop:12,background:hero.name.trim()?"linear-gradient(90deg,#7c3aed,#a78bfa)":"#1a1a2e",color:hero.name.trim()?"#fff":"#4b5563"}}
              onClick={()=>{if(hero.name.trim())setStep(1);}}>CONTINUAR →</button>
          </div>
        )}

        {step===1 && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {CLASSES.map(c=>(
                <button key={c.id} onClick={()=>setHero({...hero,class:c.id,specialization:null})}
                  style={{padding:"10px 4px",borderRadius:10,cursor:"pointer",border:`2px solid ${hero.class===c.id?c.color:"#1e1e3a"}`,background:hero.class===c.id?`${c.color}22`:"#0e0e1c",color:hero.class===c.id?c.color:"#6b7280",fontFamily:"'Courier New',monospace",fontSize:9,fontWeight:800,display:"flex",flexDirection:"column",alignItems:"center",gap:3,boxShadow:hero.class===c.id?`0 0 12px ${c.color}44`:"none",transition:"all 0.15s"}}>
                  <span style={{fontSize:16}}>{c.icon}</span>{c.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{background:`${cls.color}11`,border:`1px solid ${cls.color}33`,borderRadius:10,padding:"10px 14px",marginBottom:12,textAlign:"center"}}>
              <div style={{color:cls.color,fontSize:11,fontWeight:800}}>{cls.desc}</div>
              <div style={{fontSize:9,color:STAT_CFG[cls.primary].color,marginTop:4}}>PRIMARIO: {STAT_CFG[cls.primary].label.toUpperCase()}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="cb" style={{background:"#1a1a2e",color:"#6b7280",flex:1}} onClick={()=>setStep(0)}>← VOLVER</button>
              <button className="cb" style={{background:`linear-gradient(90deg,${cls.color},${cls.accent})`,color:"#fff",flex:2}} onClick={()=>onDone(hero)}>¡EMPEZAR! ⚡</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  SPECIALIZATION MODAL
// ═══════════════════════════════════════════════════
function SpecModal({ hero, onChoose, onClose }) {
  const cls = CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:400,width:"100%",background:"#0e0820",border:`2px solid ${cls.color}`,borderRadius:20,padding:24,textAlign:"center",boxShadow:`0 0 60px ${cls.color}44`}}>
        <div style={{fontSize:28,marginBottom:8}}>🌟</div>
        <div style={{fontSize:11,color:cls.color,letterSpacing:3,marginBottom:6}}>ESPECIALIZACIÓN DISPONIBLE</div>
        <div style={{fontSize:18,color:"#e8e0ff",fontWeight:800,marginBottom:4}}>¡Elige tu camino, {hero.name}!</div>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:20}}>Esta decisión es permanente.</div>
        {/* show hero image changing */}
        <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:20}}>
          {cls.specs.map((sp,i)=>(
            <button key={sp.id} onClick={()=>onChoose(sp.id)}
              style={{flex:1,padding:"14px 8px",borderRadius:12,cursor:"pointer",border:`2px solid ${cls.color}44`,background:`${cls.color}11`,color:"#e8e0ff",fontFamily:"'Courier New',monospace",textAlign:"center",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.border=`2px solid ${cls.color}`;e.currentTarget.style.background=`${cls.color}22`;}}
              onMouseLeave={e=>{e.currentTarget.style.border=`2px solid ${cls.color}44`;e.currentTarget.style.background=`${cls.color}11`;}}>
              <div style={{fontSize:24,marginBottom:6}}>{sp.icon}</div>
              <div style={{fontSize:11,fontWeight:800,color:cls.color,marginBottom:4}}>{sp.label}</div>
              <div style={{fontSize:9,color:"#9ca3af"}}>{sp.desc}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:10}}>MÁS TARDE</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  BATTLE SCREEN
// ═══════════════════════════════════════════════════
function BattleScreen({ hero, hStats, zone, stamina, onBack, onReward, onStaminaUsed }) {
  const cls      = CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  const [mIdx,   setMIdx]   = useState(0);
  const monster  = zone.monsters[mIdx];

  const [heroHP, setHeroHP] = useState(hStats.hp);
  const [monHP,  setMonHP]  = useState(monster.hp);
  const [gauge,  setGauge]  = useState(0);
  const [log,    setLog]    = useState([{msg:`⚔️ Entraste a ${zone.name}`,color:"#a78bfa",id:0}]);
  const [phase,  setPhase]  = useState("idle");
  const [shakeH, setShakeH] = useState(false);
  const [shakeM, setShakeM] = useState(false);
  const [flashH, setFlashH] = useState("");
  const [flashM, setFlashM] = useState("");
  const [floats, setFloats] = useState([]);
  const [outcome,setOutcome]= useState(null);
  const tickRef = useRef(null);

  const addLog = (msg,color="#e8e0ff") => setLog(p=>[{msg,color,id:Date.now()+Math.random()},...p].slice(0,12));
  const float  = (txt,color,side) => { const id=Date.now()+Math.random(); setFloats(p=>[...p,{id,txt,color,side}]); setTimeout(()=>setFloats(p=>p.filter(f=>f.id!==id)),900); };

  const doBattle = useCallback(()=>{
    if(phase!=="idle"||outcome) return;
    setPhase("atk");
    const dmg = Math.max(1,rand(hStats.atk-4,hStats.atk+6)-monster.def);
    setMonHP(hp=>{
      const nHp = Math.max(0,hp-dmg);
      float(`-${dmg}`,"#ff6b6b","monster");
      setShakeM(true); setTimeout(()=>setShakeM(false),280);
      setFlashM("#e74c3c"); setTimeout(()=>setFlashM(""),280);
      addLog(`${hero.name} → ${dmg} daño`,cls.color);
      if(nHp<=0){ setTimeout(()=>setOutcome("victory"),300); return 0; }
      setTimeout(()=>{
        const mDmg=Math.max(1,rand(monster.atk-3,monster.atk+4)-hStats.def);
        setHeroHP(hhp=>{
          const nHhp=Math.max(0,hhp-mDmg);
          float(`-${mDmg}`,"#ff4444","hero");
          setShakeH(true); setTimeout(()=>setShakeH(false),280);
          setFlashH("#e74c3c"); setTimeout(()=>setFlashH(""),280);
          addLog(`${monster.name} → ${mDmg} daño`,"#e74c3c");
          if(nHhp<=0){ setTimeout(()=>setOutcome("defeat"),300); return 0; }
          setPhase("idle"); return nHhp;
        });
      },700);
      return nHp;
    });
    setGauge(g=>Math.min(100,g+rand(10,18)));
  },[phase,outcome,hStats,monster,hero,cls]);

  useEffect(()=>{
    if(outcome) return;
    const ms = Math.max(700,Math.round(1600/hStats.spd));
    tickRef.current = setTimeout(()=>{ if(phase==="idle") doBattle(); },ms);
    return ()=>clearTimeout(tickRef.current);
  },[phase,doBattle,hStats.spd,outcome]);

  useEffect(()=>{
    if(outcome!=="victory") return;
    onReward(monster.xpR,monster.goldR,cls.primary);
    addLog(`✅ +${monster.xpR}XP +${monster.goldR}🪙`,"#f39c12");
    setTimeout(()=>{
      if(mIdx<zone.monsters.length-1){
        const ni=mIdx+1;
        const nm=zone.monsters[ni];
        setMIdx(ni); setMonHP(nm.hp); onStaminaUsed(nm.stamCost);
        setOutcome(null); setPhase("idle");
        addLog(`${nm.isBoss?"👑 JEFE: ":""}${nm.name} aparece!`,nm.isBoss?"#f39c12":"#e8e0ff");
      } else {
        setOutcome("zone_clear");
      }
    },1200);
  },[outcome,mIdx]);

  function castSkill(idx){
    const sk=cls.skills[idx];
    if(gauge<sk.cost||phase!=="idle"||outcome) return;
    setGauge(g=>g-sk.cost); setPhase("skill");
    const dmg=Math.max(1,Math.round((hStats.atk+rand(3,10))*sk.dmgMult)-monster.def);
    addLog(`✨ ${sk.name} → ${dmg}${sk.heal?` · Cura ${sk.heal}HP`:""}!`,"#f39c12");
    setTimeout(()=>{
      setMonHP(hp=>{
        const nHp=Math.max(0,hp-dmg);
        float(`${sk.icon} -${dmg}`,"#ffeaa7","monster");
        setShakeM(true); setTimeout(()=>setShakeM(false),400);
        setFlashM("#f39c12"); setTimeout(()=>setFlashM(""),400);
        if(nHp<=0){ setTimeout(()=>setOutcome("victory"),400); return 0; }
        return nHp;
      });
      if(sk.heal) setHeroHP(h=>Math.min(hStats.hp,h+sk.heal));
      setTimeout(()=>setPhase("idle"),500);
    },350);
  }

  const hpPct  = (heroHP/hStats.hp)*100;
  const mHpPct = (monHP/monster.hp)*100;
  const bgImg  = ZONE_IMG[zone.id]?.map;

  return (
    <div style={{minHeight:"100vh",color:"#e8e0ff",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      {/* Zone BG — img tag with crossOrigin handles CORS correctly */}
      {bgImg&&<img src={bgImg} crossOrigin="anonymous" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",filter:"brightness(0.32) saturate(0.6)",zIndex:0,pointerEvents:"none"}}/>}
      <div style={{position:"absolute",inset:0,background:`linear-gradient(to bottom,${zone.bg}${bgImg?"99":"ff"},${zone.bg}ff)`,zIndex:1}}/>

      <style>{`
        @keyframes floatDmg{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-52px) scale(1.4)}}
        @keyframes skillPulse{0%,100%{box-shadow:0 0 8px #f39c1244}50%{box-shadow:0 0 24px #f39c1299}}
      `}</style>

      {/* Header */}
      <div style={{position:"relative",zIndex:2,background:"#00000055",borderBottom:"1px solid #ffffff11",padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"none",border:"1px solid #ffffff22",color:"#9ca3af",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9,letterSpacing:1}}>← SALIR</button>
        <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2}}>{zone.emoji} {zone.name.toUpperCase()}</div>
        <div style={{fontSize:9,color:"#6b7280"}}>⚡{stamina}</div>
      </div>

      <div style={{position:"relative",zIndex:2,flex:1,display:"flex",flexDirection:"column",padding:"12px 14px",gap:10,maxWidth:480,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

        {/* MONSTER AREA */}
        <div style={{textAlign:"center",position:"relative",minHeight:160}}>
          <div style={{fontSize:9,color:monster.isBoss?"#f39c12":"#6b7280",letterSpacing:2,marginBottom:4}}>
            {monster.isBoss?"👑 JEFE":"ENEMIGO"} · LV.{monster.level}
          </div>
          <div style={{fontSize:14,color:monster.isBoss?"#f39c12":"#e8e0ff",fontWeight:800,marginBottom:6}}>{monster.name}</div>
          {/* Monster HP bar */}
          <div style={{background:"#111122",borderRadius:999,height:10,overflow:"hidden",border:"1px solid #e74c3c33",marginBottom:4,maxWidth:300,margin:"0 auto 8px"}}>
            <div style={{width:`${mHpPct}%`,height:"100%",background:mHpPct>50?"linear-gradient(90deg,#c0392b,#e74c3c)":mHpPct>25?"linear-gradient(90deg,#e67e22,#f39c12)":"linear-gradient(90deg,#8B0000,#e74c3c)",borderRadius:999,transition:"width 0.35s"}}/>
          </div>
          <div style={{fontSize:9,color:"#e74c3c",marginBottom:10}}>{Math.max(0,monHP)}/{monster.hp} HP</div>

          {/* Monster sprite */}
          <div style={{display:"flex",justifyContent:"center",position:"relative"}}>
            <EnemyImg zone={zone} monsterType={monster.type} size={130} shake={shakeM} flash={flashM} defeated={outcome==="victory"}/>
            {floats.filter(f=>f.side==="monster").map(f=>(
              <div key={f.id} style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",color:f.color,fontWeight:900,fontSize:16,animation:"floatDmg 0.9s ease forwards",pointerEvents:"none",textShadow:"0 0 10px currentColor",whiteSpace:"nowrap",zIndex:10}}>{f.txt}</div>
            ))}
          </div>

          {/* Outcome overlays */}
          {outcome==="zone_clear"&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#00000099",borderRadius:12,zIndex:5}}>
              <div style={{textAlign:"center",padding:20}}>
                <div style={{fontSize:32,marginBottom:8}}>🏆</div>
                <div style={{color:"#f39c12",fontSize:13,fontWeight:800,letterSpacing:2}}>¡ZONA COMPLETADA!</div>
                <button onClick={onBack} style={{marginTop:12,background:"linear-gradient(90deg,#f39c12,#ffeaa7)",border:"none",color:"#000",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:800}}>VOLVER AL MAPA</button>
              </div>
            </div>
          )}
          {outcome==="defeat"&&(
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#000000cc",borderRadius:12,zIndex:5}}>
              <div style={{textAlign:"center",padding:20}}>
                <div style={{fontSize:32,marginBottom:8}}>💀</div>
                <div style={{color:"#e74c3c",fontSize:13,fontWeight:800}}>HAS CAÍDO</div>
                <div style={{color:"#9ca3af",fontSize:10,marginTop:4}}>Entrena más y vuelve</div>
                <button onClick={onBack} style={{marginTop:12,background:"#e74c3c",border:"none",color:"#fff",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:11,fontWeight:800}}>RETIRARSE</button>
              </div>
            </div>
          )}
        </div>

        {/* VS */}
        <div style={{textAlign:"center",fontSize:9,color:"#2d2d4e",letterSpacing:4}}>⎯⎯ VS ⎯⎯</div>

        {/* HERO AREA */}
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <div style={{position:"relative",flexShrink:0}}>
            {/* Hero faces right normally, flip so faces left (toward enemy on right) */}
            <HeroImg hero={hero} size={90} flip={true} shake={shakeH} flash={flashH}/>
            {floats.filter(f=>f.side==="hero").map(f=>(
              <div key={f.id} style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",color:f.color,fontWeight:900,fontSize:14,animation:"floatDmg 0.9s ease forwards",pointerEvents:"none",whiteSpace:"nowrap",zIndex:10}}>{f.txt}</div>
            ))}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,fontWeight:800,color:cls.color}}>{hero.name}</div>
            <div style={{fontSize:8,color:"#6b7280",marginBottom:3}}>HP {Math.max(0,heroHP)}/{hStats.hp}</div>
            <div style={{background:"#111122",borderRadius:999,height:8,overflow:"hidden",border:"1px solid #2ecc7133",marginBottom:8}}>
              <div style={{width:`${hpPct}%`,height:"100%",background:hpPct>50?"linear-gradient(90deg,#27ae60,#2ecc71)":hpPct>25?"linear-gradient(90deg,#e67e22,#f39c12)":"linear-gradient(90deg,#c0392b,#e74c3c)",borderRadius:999,transition:"width 0.35s"}}/>
            </div>
            <div style={{fontSize:8,color:"#f39c12",marginBottom:3}}>GAUGE {Math.round(gauge)}/100</div>
            <div style={{background:"#111122",borderRadius:999,height:6,overflow:"hidden",border:"1px solid #f39c1222"}}>
              <div style={{width:`${gauge}%`,height:"100%",background:"linear-gradient(90deg,#e67e22,#f39c12)",borderRadius:999,transition:"width 0.4s",boxShadow:gauge>=cls.skills[0].cost?"0 0 6px #f39c12aa":"none"}}/>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div style={{display:"flex",gap:8}}>
          {cls.skills.map((sk,i)=>{
            const ready=gauge>=sk.cost&&phase==="idle"&&!outcome;
            return (
              <button key={sk.id} onClick={()=>castSkill(i)}
                style={{flex:1,padding:"9px 4px",borderRadius:10,cursor:ready?"pointer":"not-allowed",border:`2px solid ${ready?"#f39c12":"#1e1e3a"}`,background:ready?"#1a0f00":"#080808",color:ready?"#f39c12":"#2d2d4e",fontFamily:"'Courier New',monospace",fontSize:9,fontWeight:800,letterSpacing:0.5,animation:ready?"skillPulse 1.5s ease-in-out infinite":undefined,transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                <span style={{fontSize:16}}>{sk.icon}</span>
                <span>{sk.name}</span>
                <span style={{fontSize:7,color:ready?"#e67e22":"#1e1e3a"}}>{sk.cost} GAUGE</span>
              </button>
            );
          })}
        </div>

        {/* Battle log */}
        <div style={{background:"#00000055",border:"1px solid #ffffff08",borderRadius:8,padding:"8px 12px",maxHeight:80,overflowY:"auto",fontSize:9,lineHeight:1.6}}>
          {log.map(l=><div key={l.id} style={{color:l.color}}>{l.msg}</div>)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  WORLD MAP
// ═══════════════════════════════════════════════════
function WorldMap({ stats, stamina, onSelectZone, onBack }) {
  const txp = totalXP(stats);
  return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",padding:16}}>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
          <button onClick={onBack} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9}}>← VOLVER</button>
          <div style={{fontSize:11,color:"#a78bfa",letterSpacing:2}}>🗺️ MAPA DEL MUNDO</div>
          <div style={{marginLeft:"auto",fontSize:9,color:"#6b7280"}}>⚡{stamina}/{MAX_STAMINA}</div>
        </div>
        {ZONES.map((zone,i)=>{
          const unlocked=txp>=zone.unlockXP;
          const progress=unlocked?100:Math.min(100,(txp/Math.max(1,zone.unlockXP))*100);
          const bgImg=ZONE_IMG[zone.id]?.map;
          return (
            <div key={zone.id} style={{background:unlocked?"#0e0e1c":"#07070f",border:`1px solid ${unlocked?zone.accent+"44":"#111122"}`,borderRadius:12,marginBottom:10,overflow:"hidden",opacity:unlocked?1:0.65}}>
              {/* Map thumbnail */}
              {unlocked&&bgImg&&(
                <div style={{height:80,overflow:"hidden",position:"relative"}}>
                  <img src={bgImg} crossOrigin="anonymous" alt="" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",filter:"brightness(0.5) saturate(0.8)",display:"block"}}/>
                </div>
              )}
              <div style={{padding:14}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:28}}>{zone.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:unlocked?"#e8e0ff":"#4b5563"}}>{zone.name}</div>
                    <div style={{fontSize:9,color:unlocked?"#9ca3af":"#4b5563",marginTop:2}}>{zone.desc}</div>
                    {!unlocked&&(
                      <div style={{marginTop:6}}>
                        <div style={{fontSize:8,color:"#4b5563",marginBottom:3}}>REQUIERE {zone.unlockXP} XP · TIENES {txp}</div>
                        <div style={{background:"#111",borderRadius:999,height:3,overflow:"hidden"}}>
                          <div style={{width:`${progress}%`,height:"100%",background:"linear-gradient(90deg,#7c3aed,#a78bfa)",borderRadius:999}}/>
                        </div>
                      </div>
                    )}
                  </div>
                  {unlocked&&(
                    <button onClick={()=>onSelectZone(i)}
                      style={{background:stamina>=zone.stamBase?`linear-gradient(135deg,${zone.accent},${zone.accent}88)`:"#1a1a2e",border:"none",color:stamina>=zone.stamBase?"#fff":"#4b5563",borderRadius:8,padding:"10px 16px",cursor:stamina>=zone.stamBase?"pointer":"not-allowed",fontFamily:"'Courier New',monospace",fontSize:10,fontWeight:800,letterSpacing:1,whiteSpace:"nowrap"}}>
                      {stamina>=zone.stamBase?"ENTRAR →":"SIN ⚡"}
                    </button>
                  )}
                </div>
                {unlocked&&(
                  <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>
                    {zone.monsters.map(m=>(
                      <div key={m.name} style={{background:"#060612",borderRadius:6,padding:"3px 8px",fontSize:8,color:"#6b7280",display:"flex",alignItems:"center",gap:3}}>
                        {m.isBoss&&<span style={{color:"#f39c12"}}>👑</span>}
                        <span>LV.{m.level}</span> <span style={{color:"#4b5563"}}>{m.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════
export default function App() {
  const [screen,   setScreen]   = useState("loading");
  const [hero,     setHero]     = useState(null);
  const [stats,    setStats]    = useState({fuerza:{xp:0},velocidad:{xp:0},vitalidad:{xp:0}});
  const [stamina,  setStamina]  = useState(0);
  const [gold,     setGold]     = useState(0);
  const [wlog,     setWlog]     = useState([]);
  const [tab,      setTab]      = useState("hero");
  const [form,     setForm]     = useState({stat:"fuerza",exercise:"",amount:"",note:""});
  const [notif,    setNotif]    = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [battleZI, setBattleZI] = useState(0);
  const [showSpec, setShowSpec] = useState(false);

  useEffect(()=>{
    try{
        const h=localStorage.getItem("rpgv6_hero");
        const s=localStorage.getItem("rpgv6_stats");
        const l=localStorage.getItem("rpgv6_log");
        const g=localStorage.getItem("rpgv6_gold");
        const st=localStorage.getItem("rpgv6_stamina");
        if(h){setHero(JSON.parse(h));setScreen("main");}else setScreen("create");
        if(s)setStats(JSON.parse(s));
        if(l)setWlog(JSON.parse(l));
        if(g)setGold(Number(g));
        if(st)setStamina(Math.min(MAX_STAMINA,Number(st)));
      }catch{setScreen("create");}
  },[]);

  useEffect(()=>{
    if(!hero||!["main","map","battle"].includes(screen)) return;
    localStorage.setItem("rpgv6_hero",JSON.stringify(hero));
    localStorage.setItem("rpgv6_stats",JSON.stringify(stats));
    localStorage.setItem("rpgv6_log",JSON.stringify(wlog));
    localStorage.setItem("rpgv6_gold",String(gold));
    localStorage.setItem("rpgv6_stamina",String(stamina));
  },[hero,stats,wlog,gold,stamina,screen]);

  function toast(msg,color,icon="⚡"){setNotif({msg,color,icon});setTimeout(()=>setNotif(null),3000);}

  function handleCreateDone(newHero){
    setHero(newHero); setScreen("main"); setEditMode(false);
    localStorage.setItem("rpgv6_hero",JSON.stringify(newHero));
    toast(`¡Bienvenido, ${newHero.name}!`,"#7c3aed","🎮");
  }

  function handleLog(){
    const{stat,exercise,amount,note}=form;
    if(!exercise||!amount||isNaN(Number(amount))||Number(amount)<=0){toast("Completa ejercicio y cantidad","#e74c3c","⚠️");return;}
    const cfg=STAT_CFG[stat];
    const cls=CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
    const mult=cls.primary===stat?1.5:1;
    const gained=Math.max(1,Math.round(Number(amount)*cfg.xpPerUnit/10*mult));
    const stGain=Math.min(MAX_STAMINA-stamina,gained*STAMINA_PER_XP);
    const prevLv=getLevel(stats[stat].xp);
    const nSt={...stats,[stat]:{xp:stats[stat].xp+gained}};
    const newLv=getLevel(nSt[stat].xp);
    setStats(nSt); setStamina(s=>Math.min(MAX_STAMINA,s+stGain));
    const entry={id:Date.now(),stat,exercise,amount:Number(amount),xp:gained,stamina:stGain,
      date:new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"short"}),
      time:new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),note};
    setWlog(p=>[entry,...p].slice(0,60));
    if(newLv>prevLv){
      if(newLv===SPEC_LEVEL&&!hero.specialization) setShowSpec(true);
      toast(`¡${cfg.label} LVL ${newLv}! ${getLvTitle(newLv)}`,cfg.color,"⬆️");
    } else {
      toast(`+${gained} XP · +${stGain}⚡`,cfg.color,"💪");
    }
    setForm(f=>({...f,exercise:"",amount:"",note:""}));
  }

  function handleSpecChoose(specId){
    const updated={...hero,specialization:specId};
    setHero(updated); setShowSpec(false);
    const cls=CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
    const spec=cls.specs.find(s=>s.id===specId);
    toast(`¡Especialización: ${spec?.label}!`,"#f39c12","🌟");
  }

  if(screen==="loading") return <div style={{minHeight:"100vh",background:"#060612",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Courier New',monospace",color:"#7c3aed",fontSize:12,letterSpacing:3}}>CARGANDO...</div>;
  if(screen==="create"||editMode) return <CharacterCreator onDone={handleCreateDone} initial={editMode?hero:null}/>;
  if(screen==="map") return <WorldMap stats={stats} stamina={stamina} onSelectZone={i=>{setBattleZI(i);setStamina(s=>Math.max(0,s-ZONES[i].monsters[0].stamCost));setScreen("battle");}} onBack={()=>setScreen("main")}/>;
  if(screen==="battle"){
    const hs=heroStats(hero,stats);
    return <BattleScreen hero={hero} hStats={hs} zone={ZONES[battleZI]} stamina={stamina} onBack={()=>setScreen("main")} onReward={(xp,g,stat)=>{setStats(s=>({...s,[stat]:{xp:s[stat].xp+xp}}));setGold(prev=>prev+g);}} onStaminaUsed={cost=>setStamina(s=>Math.max(0,s-cost))}/>;
  }

  const cls=CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  const spec=cls.specs.find(s=>s.id===hero.specialization);
  const txp=totalXP(stats);
  const heroLv=Math.max(1,Math.round(Object.values(stats).reduce((a,s)=>a+getLevel(s.xp),0)/3));
  const hs=heroStats(hero,stats);
  const nextZone=ZONES.find(z=>txp<z.unlockXP);
  const specUnlocked=getLevel(stats[cls.primary].xp)>=SPEC_LEVEL;

  return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",paddingBottom:80}}>
      <style>{`
        @keyframes floatHero{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes fadeDown{from{opacity:0;transform:translateX(-50%) translateY(-16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes specPulse{0%,100%{box-shadow:0 0 10px #f39c1244}50%{box-shadow:0 0 30px #f39c12aa}}
      `}</style>

      {showSpec&&<SpecModal hero={hero} onChoose={handleSpecChoose} onClose={()=>setShowSpec(false)}/>}
      {notif&&<div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",background:notif.color,color:"#fff",padding:"9px 18px",borderRadius:999,fontWeight:800,fontSize:11,zIndex:999,whiteSpace:"nowrap",boxShadow:`0 4px 20px ${notif.color}88`,animation:"fadeDown 0.3s ease",letterSpacing:0.5,fontFamily:"'Courier New',monospace"}}>{notif.icon} {notif.msg}</div>}

      {/* HERO HEADER */}
      <div style={{background:`linear-gradient(160deg,#0e0820 0%,#0a1228 50%,${cls.color}18 100%)`,borderBottom:`1px solid ${cls.color}22`,padding:"16px"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{display:"flex",gap:14,alignItems:"center",marginBottom:14}}>
            {/* Hero image */}
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <div style={{animation:"floatHero 3s ease-in-out infinite"}}>
                <HeroImg hero={hero} size={100}/>
              </div>
              <button onClick={()=>setEditMode(true)} style={{background:"none",border:`1px solid ${cls.color}33`,color:cls.color,borderRadius:6,padding:"2px 8px",fontSize:7,cursor:"pointer",letterSpacing:1,fontFamily:"'Courier New',monospace"}}>EDITAR</button>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:8,color:cls.color,letterSpacing:3,marginBottom:2}}>{cls.icon} {cls.label.toUpperCase()}{spec?` · ${spec.icon} ${spec.label.toUpperCase()}`:""}</div>
              <div style={{fontSize:20,fontWeight:800,color:"#fff",letterSpacing:1,lineHeight:1.1}}>{hero.name}</div>
              <div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>NV.{heroLv} · {getLvTitle(heroLv)}</div>
              <div style={{fontSize:8,color:"#6b7280",marginTop:1}}>🪙{gold} · ⚡{stamina}/{MAX_STAMINA}</div>
              <div style={{background:"#0a0a18",borderRadius:999,height:4,overflow:"hidden",border:"1px solid #f39c1222",marginTop:5}}>
                <div style={{width:`${(stamina/MAX_STAMINA)*100}%`,height:"100%",background:"linear-gradient(90deg,#e67e22,#f39c12)",borderRadius:999,transition:"width 0.5s"}}/>
              </div>
              {specUnlocked&&!hero.specialization&&(
                <button onClick={()=>setShowSpec(true)} style={{marginTop:6,background:"linear-gradient(90deg,#f39c12,#ffeaa7)",border:"none",borderRadius:8,padding:"4px 12px",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"'Courier New',monospace",letterSpacing:1,animation:"specPulse 2s ease-in-out infinite",color:"#000"}}>
                  🌟 ¡ESPECIALIZACIÓN!
                </button>
              )}
              {nextZone&&(
                <div style={{marginTop:6}}>
                  <div style={{fontSize:7,color:"#4b5563",marginBottom:2}}>→ {nextZone.name}: {txp}/{nextZone.unlockXP} XP</div>
                  <div style={{background:"#0a0a18",borderRadius:999,height:3,overflow:"hidden"}}>
                    <div style={{width:`${Math.min(100,(txp/nextZone.unlockXP)*100)}%`,height:"100%",background:"linear-gradient(90deg,#4834d4,#7c3aed)",borderRadius:999,transition:"width 0.5s"}}/>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stat bars */}
          {Object.entries(STAT_CFG).map(([key,cfg])=>{
            const xp=stats[key].xp,lv=getLevel(xp),pct=getXpPct(xp),isPrimary=cls.primary===key;
            return(
              <div key={key} style={{marginBottom:7}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                  <span style={{fontSize:8,fontWeight:800,color:isPrimary?cfg.color:"#4b5563"}}>{isPrimary?"★":""}{cfg.icon} {cfg.label.toUpperCase()}</span>
                  <span style={{fontSize:7,color:"#4b5563"}}>LV.{lv} · {Math.round(xp%XP_PER_LEVEL)}/{XP_PER_LEVEL}</span>
                </div>
                <div style={{background:"#0a0a18",borderRadius:999,height:isPrimary?8:5,overflow:"hidden",border:`1px solid ${cfg.color}18`}}>
                  <div style={{width:`${pct}%`,height:"100%",borderRadius:999,background:`linear-gradient(90deg,${cfg.color},${cfg.glow})`,transition:"width 0.7s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 ${isPrimary?8:4}px ${cfg.color}55`}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMBAT CTA */}
      <div style={{maxWidth:480,margin:"12px auto 0",padding:"0 16px"}}>
        <button onClick={()=>setScreen("map")} style={{width:"100%",padding:13,borderRadius:12,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${cls.color}cc,${cls.accent}cc)`,color:"#fff",fontWeight:800,fontSize:12,fontFamily:"'Courier New',monospace",letterSpacing:2,boxShadow:`0 4px 20px ${cls.color}44`,transition:"all 0.2s"}}>
          ⚔️ IR AL MAPA DE COMBATE
        </button>
      </div>

      {/* TABS */}
      <div style={{borderBottom:"1px solid #1e1e3a",marginTop:12}}>
        <div style={{display:"flex",padding:"0 12px",gap:14,maxWidth:480,margin:"0 auto"}}>
          {[["hero","⚔ HÉROE"],["train","💪 ENTRENAR"],["log","📜 LOG"]].map(([t,l])=>(
            <button key={t} className={`tab ${tab===t?"on":""}`} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:16}}>

        {/* TAB HERO */}
        {tab==="hero"&&(
          <div>
            <div style={{background:"#0e0e1c",border:`1px solid ${cls.color}22`,borderRadius:12,padding:14,marginBottom:12}}>
              <div style={{fontSize:8,color:cls.color,letterSpacing:3,marginBottom:10}}>STATS DE COMBATE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["⚔ ATAQUE",hs.atk],["🛡 DEFENSA",hs.def],["💨 VELOCIDAD",hs.spd.toFixed(2)+"x"],["❤️ HP MÁX",hs.hp],["🪙 ORO",gold],["⚡ STAMINA",`${stamina}/${MAX_STAMINA}`]].map(([k,v])=>(
                  <div key={k} style={{background:"#060612",borderRadius:8,padding:"8px 10px"}}>
                    <div style={{fontSize:7,color:"#4b5563",letterSpacing:2,marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,color:"#e8e0ff",fontWeight:800}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#0e0e1c",border:"1px solid #2d2060",borderRadius:12,padding:14}}>
              <div style={{fontSize:8,color:"#7c3aed",letterSpacing:3,marginBottom:10}}>PROGRESIÓN DE ZONAS</div>
              {ZONES.map(z=>{
                const unlocked=txp>=z.unlockXP;
                return(
                  <div key={z.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,opacity:unlocked?1:0.5}}>
                    <span style={{fontSize:14}}>{unlocked?"✅":txp>0&&txp<z.unlockXP?"🔄":"🔒"}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:unlocked?"#e8e0ff":"#4b5563",fontWeight:700}}>{z.emoji} {z.name}</div>
                      <div style={{fontSize:8,color:"#4b5563"}}>{z.unlockXP===0?"Inicio":`${z.unlockXP} XP (~${Math.round(z.unlockXP/150)} días)`}</div>
                    </div>
                    <div style={{fontSize:8,color:unlocked?cls.color:"#4b5563",fontWeight:800}}>{unlocked?"✓":txp>0?`${txp}/${z.unlockXP}`:"🔒"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB TRAIN */}
        {tab==="train"&&(
          <div style={{background:"#0e0e1c",border:"1px solid #1e1e3a",borderRadius:12,padding:16}}>
            <div style={{fontSize:8,color:"#7c3aed",letterSpacing:3,marginBottom:12}}>REGISTRAR ENTRENAMIENTO</div>
            <div style={{background:"#060612",border:"1px solid #f39c1222",borderRadius:8,padding:"8px 12px",marginBottom:12,fontSize:9,color:"#f39c12"}}>
              ⚡ Cada XP ganado = {STAMINA_PER_XP} STAMINA de combate
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {Object.entries(STAT_CFG).map(([key,cfg])=>(
                <button key={key} onClick={()=>setForm(f=>({...f,stat:key,exercise:""}))}
                  style={{flex:1,padding:"9px 4px",borderRadius:10,cursor:"pointer",border:`2px solid ${form.stat===key?cfg.color:"#1e1e3a"}`,background:form.stat===key?`${cfg.color}22`:"#060612",color:form.stat===key?cfg.color:"#4b5563",fontFamily:"'Courier New',monospace",fontSize:8,fontWeight:800,display:"flex",flexDirection:"column",alignItems:"center",gap:2,boxShadow:form.stat===key?`0 0 10px ${cfg.color}44`:"none",transition:"all 0.15s"}}>
                  <span style={{fontSize:16}}>{cfg.icon}</span>{cfg.label.toUpperCase()}
                  {cls.primary===key&&<span style={{fontSize:7,color:cfg.color}}>★ ×1.5</span>}
                </button>
              ))}
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:7,color:"#4b5563",letterSpacing:2,display:"block",marginBottom:5}}>EJERCICIO</label>
              <select className="inp" value={form.exercise} onChange={e=>setForm(f=>({...f,exercise:e.target.value}))}>
                <option value="">-- Seleccionar --</option>
                {STAT_CFG[form.stat].exercises.map(ex=><option key={ex} value={ex}>{ex}</option>)}
                <option value="__otro">Otro...</option>
              </select>
              {form.exercise==="__otro"&&<input className="inp" style={{marginTop:6}} placeholder="Describe el ejercicio..." onChange={e=>setForm(f=>({...f,exercise:e.target.value}))}/>}
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:7,color:"#4b5563",letterSpacing:2,display:"block",marginBottom:5}}>CANTIDAD ({STAT_CFG[form.stat].unit})</label>
              <input className="inp" type="number" min="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder={form.stat==="fuerza"?"Ej: 80":"Ej: 45"}/>
              {form.amount&&Number(form.amount)>0&&(()=>{
                const xpG=Math.max(1,Math.round(Number(form.amount)*STAT_CFG[form.stat].xpPerUnit/10*(cls.primary===form.stat?1.5:1)));
                const stG=Math.min(MAX_STAMINA-stamina,xpG*STAMINA_PER_XP);
                return <div style={{fontSize:8,color:STAT_CFG[form.stat].color,marginTop:3}}>+{xpG} XP · +{stG} ⚡{cls.primary===form.stat?" (×1.5 BONO)":""}</div>;
              })()}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:7,color:"#4b5563",letterSpacing:2,display:"block",marginBottom:5}}>NOTA</label>
              <input className="inp" placeholder="PR, sensaciones..." value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
            </div>
            <button onClick={handleLog} style={{width:"100%",padding:12,borderRadius:10,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${STAT_CFG[form.stat].color},${STAT_CFG[form.stat].glow})`,color:"#fff",fontWeight:800,fontSize:12,fontFamily:"'Courier New',monospace",letterSpacing:2}}>
              ⚡ REGISTRAR
            </button>
          </div>
        )}

        {/* TAB LOG */}
        {tab==="log"&&(
          <div>
            {wlog.length===0?<div style={{textAlign:"center",color:"#4b5563",padding:"40px 0",fontSize:10}}>¡EMPIEZA A ENTRENAR!</div>:
              wlog.map(e=>{
                const cfg=STAT_CFG[e.stat];
                return(
                  <div key={e.id} style={{background:"#0a0a18",borderLeft:`3px solid ${cfg.color}`,borderRadius:"0 8px 8px 0",padding:"9px 12px",marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:12,color:"#e8e0ff"}}>{cfg.icon} {e.exercise}</div>
                      <div style={{fontSize:8,color:"#6b7280",marginTop:1}}>{e.date} {e.time} · {e.amount} {cfg.unit}</div>
                      {e.note&&<div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>{e.note}</div>}
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:cfg.color,fontWeight:800,fontSize:13}}>+{e.xp} XP</div>
                      <div style={{fontSize:8,color:"#f39c12"}}>+{e.stamina}⚡</div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
