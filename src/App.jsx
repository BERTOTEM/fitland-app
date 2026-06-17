import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════
//  ASSET BASE URL
// ═══════════════════════════════════════════════════
const RAW = "https://cdn.jsdelivr.net/gh/BERTOTEM/fitland-assets@main";

const HERO_IMG = {
  warrior:  { base: `${RAW}/Personajes/Guerrero/Base.PNG`,   spec1: `${RAW}/Personajes/Guerrero/Especializacion_1_Berserker.PNG`,           spec2: `${RAW}/Personajes/Guerrero/Especializacion_2_Caballero_Negro.PNG` },
  ranger:   { base: `${RAW}/Personajes/Explorador/Base.PNG`, spec1: `${RAW}/Personajes/Explorador/Especializacion_1_Cazador.PNG`,            spec2: `${RAW}/Personajes/Explorador/Especializacion_2_Saqueador.PNG` },
  monk:     { base: `${RAW}/Personajes/Monje/Base.PNG`,      spec1: `${RAW}/Personajes/Monje/Especializacion_1_Maestro_espiritual.PNG`,      spec2: `${RAW}/Personajes/Monje/Especializacion_2_Puño_fuego.PNG` },
  paladin:  { base: `${RAW}/Personajes/Paladin/Base.PNG`,    spec1: `${RAW}/Personajes/Paladin/Especializacion_1_Paladin_Luz.PNG`,           spec2: `${RAW}/Personajes/Paladin/Especializacion_2_Caballero_Crepuscular.PNG` },
  assassin: { base: `${RAW}/Personajes/Asesino/Base.PNG`,    spec1: `${RAW}/Personajes/Asesino/Especializacion_1_Sombra_letal.PNG`,         spec2: `${RAW}/Personajes/Asesino/Especializacion_2_Dualista_veloz.PNG` },
  druid:    { base: `${RAW}/Personajes/Druida/Base.PNG`,     spec1: `${RAW}/Personajes/Druida/Especializacion_1_Forma_feral.PNG`,           spec2: `${RAW}/Personajes/Druida/Especializacion_2_Maestro_elementos.PNG` },
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
//  Difficulty: ~2 months per zone at 5x/week training
//  Daily avg: 120 XP → 2400 XP/month at 5x/week
//  Zone unlocks: 0 / 4800 / 9600 / 16800 / 26400 XP
// ═══════════════════════════════════════════════════
const XP_PER_LEVEL   = 300;   // harder to level up
const STAMINA_PER_XP = 1;     // less stamina per XP (was 2)
const MAX_STAMINA    = 300;   // lower cap
const SPEC_LEVEL     = 15;    // need more training to specialize

const LEVEL_TITLES = ["Novato","Aprendiz","Iniciado","Aventurero","Veterano","Experto","Maestro","Gran Maestro","Élite","Legendario","Héroe","Campeón","Leyenda Viva","Inmortal","Dios del Gym"];

// ── STAT CONFIG — more exercises, realistic units ──
const STAT_CFG = {
  fuerza: {
    label:"Fuerza", icon:"⚔️", color:"#e74c3c", glow:"#ff6b6b",
    exercises:[
      "Press banca","Sentadillas","Peso muerto","Press militar",
      "Remo con barra","Dominadas","Curl de bíceps","Fondos",
      "Hip thrust","Prensa de piernas","Jalón al pecho","Aperturas",
    ],
    xpPerUnit:10, unit:"kg",
    hint:"Registra el peso total levantado (ej: 4 series × 80kg = 320kg)"
  },
  velocidad: {
    label:"Velocidad", icon:"💨", color:"#3498db", glow:"#74b9ff",
    exercises:[
      "Correr","Bicicleta","Saltar cuerda","HIIT","Sprints",
      "Natación","Elíptica","Remo ergómetro","Escaladora",
      "Kickboxing","Jump rope intervals","Tabata",
    ],
    xpPerUnit:5, unit:"min",
    hint:"Registra minutos de cardio continuo o en intervalos"
  },
  vitalidad: {
    label:"Vitalidad", icon:"💚", color:"#2ecc71", glow:"#55efc4",
    exercises:[
      "Yoga","Pilates","Plancha","Estiramientos","Meditación",
      "Natación lenta","Caminata","Wim Hof","Respiración 4-7-8",
      "Foam roller","Movilidad articular","Tai chi",
    ],
    xpPerUnit:8, unit:"min",
    hint:"Registra minutos de recuperación activa o movilidad"
  },
};

const CLASSES = [
  { id:"warrior",  label:"Guerrero",   icon:"⚔️", primary:"fuerza",    color:"#e74c3c", accent:"#ff6b6b", desc:"Maestro del acero. Cada rep forja su leyenda.",        statBonus:{atk:1.5,def:1.2,spd:0.9,hp:1.3}, skills:[{id:"slash",   name:"Tajo Profundo",   icon:"⚔️", cost:30, dmgMult:2.0, desc:"Golpe preciso"},{id:"berserk", name:"Furia Berserker",  icon:"🔥", cost:80, dmgMult:4.0, desc:"Daño devastador"}], specs:[{id:"berserker",      label:"Berserker",         icon:"🔥", desc:"Ataque doble en combo. Sin piedad."},{id:"caballero_negro", label:"Caballero Negro",   icon:"⚫", desc:"DEF máxima. Tanque imparable."}] },
  { id:"ranger",   label:"Explorador", icon:"🏹", primary:"velocidad", color:"#3498db", accent:"#74b9ff", desc:"Veloz como el viento. Ninguna distancia lo detiene.",   statBonus:{atk:1.2,def:0.9,spd:1.6,hp:1.0}, skills:[{id:"arrow",   name:"Flecha Rápida",   icon:"🏹", cost:25, dmgMult:1.8, desc:"Ataque veloz"},{id:"barrage",  name:"Lluvia de Flechas",icon:"🌧️", cost:70, dmgMult:3.2, desc:"Múltiples impactos"}], specs:[{id:"cazador",         label:"Cazador",           icon:"🦅", desc:"+60% XP en cardio. Crítico en sprints."},{id:"saqueador",       label:"Saqueador",         icon:"💰", desc:"Doble oro en combate."}] },
  { id:"monk",     label:"Monje",      icon:"🌿", primary:"vitalidad", color:"#2ecc71", accent:"#55efc4", desc:"Equilibrio perfecto entre cuerpo y mente.",             statBonus:{atk:1.0,def:1.1,spd:1.2,hp:1.6}, skills:[{id:"chi",     name:"Golpe de Chi",    icon:"💫", cost:28, dmgMult:1.7, heal:15, desc:"Cura + daño"},{id:"zen",      name:"Zen Nova",         icon:"☯️",  cost:65, dmgMult:2.8, heal:30, desc:"Onda curativa"}], specs:[{id:"maestro_espiritual",label:"Maestro Espiritual",icon:"🌟", desc:"Curación doble. Nunca te cansas."},{id:"puno_fuego",      label:"Puño de Fuego",     icon:"🔥", desc:"+50% ATK. Golpe ardiente."}] },
  { id:"paladin",  label:"Paladín",    icon:"🛡️", primary:"fuerza",    color:"#f39c12", accent:"#ffeaa7", desc:"Fuerza y honor. Un bastión inquebrantable.",           statBonus:{atk:1.2,def:1.8,spd:0.8,hp:1.5}, skills:[{id:"smite",   name:"Castigo Sagrado", icon:"✨", cost:35, dmgMult:1.9, desc:"Daño sagrado"},{id:"holy",     name:"Ira Divina",        icon:"👼", cost:90, dmgMult:3.8, desc:"Golpe celestial"}], specs:[{id:"paladin_luz",      label:"Paladín de Luz",    icon:"☀️", desc:"Curación en cada golpe sagrado."},{id:"caballero_crepuscular",label:"Cab. Crepuscular",icon:"🌑", desc:"Daño oscuro + velocidad."}] },
  { id:"assassin", label:"Asesino",    icon:"🗡️", primary:"velocidad", color:"#9b59b6", accent:"#d2a8ff", desc:"Sombra y rapidez. Golpea antes de que te vean.",       statBonus:{atk:1.8,def:0.7,spd:1.5,hp:0.9}, skills:[{id:"backstab",name:"Puñalada Crítica",icon:"🗡️", cost:22, dmgMult:2.5, desc:"Siempre crítico"},{id:"death",    name:"Sombra Mortal",    icon:"💀", cost:65, dmgMult:4.5, desc:"Daño extremo"}], specs:[{id:"sombra_letal",    label:"Sombra Letal",      icon:"💀", desc:"+70% XP en HIIT. Crítico garantizado."},{id:"dualista_veloz",  label:"Dualista Veloz",    icon:"⚡", desc:"Velocidad se transfiere a ATK."}] },
  { id:"druid",    label:"Druida",     icon:"🍃", primary:"vitalidad", color:"#1abc9c", accent:"#81ecec", desc:"La naturaleza fluye por sus venas.",                    statBonus:{atk:1.0,def:1.3,spd:1.1,hp:1.4}, skills:[{id:"thorns",  name:"Espinas",         icon:"🌿", cost:28, dmgMult:1.7, desc:"Daño natural"},{id:"storm",    name:"Tormenta",          icon:"⚡", cost:70, dmgMult:3.0, desc:"Furia elemental"}], specs:[{id:"forma_feral",     label:"Forma Feral",       icon:"🐺", desc:"+ATK masivo. Forma animal."},{id:"maestro_elementos",label:"Maestro Elementos",  icon:"🌊", desc:"Todos los elementos a tu favor."}] },
];

// ── ZONES — 2 months per zone at 5x/week (~120 XP/day) ──
// Month 1-2: Valle  (0 → 4800 XP)
// Month 3-4: Bosque (4800 → 9600 XP)
// Month 5-7: Cueva  (9600 → 16800 XP)
// Month 8-11: Castillo (16800 → 26400 XP)
// Month 12+: Abismo (26400 XP)
const ZONES = [
  { id:"valley",  name:"Valle del Inicio",   emoji:"🌄", unlockXP:0,     bg:"#0a1a08", accent:"#3a7a20",
    desc:"Primeras 2 semanas. Aprende el sistema.", stamBase:40,
    monsters:[
      { name:"Elemental joven",    type:"mob1",     hp:80,   atk:10,  def:2,   xpR:10,  goldR:5,   level:1,  stamCost:40  },
      { name:"Espiritu del bosque",  type:"mob2",     hp:160,   atk:16,  def:4,   xpR:18,  goldR:9,   level:1,  stamCost:50  },
      { name:"Mantis real",     type:"miniboss", hp:300,  atk:26,  def:8,   xpR:35,  goldR:18,  level:2,  stamCost:70  },
      { name:"Señor del Valle", type:"boss",     hp:500,  atk:38,  def:14,  xpR:70,  goldR:40,  level:3,  stamCost:100, isBoss:true },
    ]
  },
  { id:"forest",  name:"Bosque Sombrío",     emoji:"🌲", unlockXP:6800,  bg:"#080f08", accent:"#1a5a10",
    desc:"2 meses de entreno constante requeridos.", stamBase:70,
    monsters:[
      { name:"Araña Sombría",    type:"mob1",     hp:520,  atk:52,  def:18,  xpR:40,  goldR:20,  level:4,  stamCost:70  },
      { name:"Monstruo de espinas",  type:"mob2",     hp:620,  atk:66,  def:24,  xpR:58,  goldR:30,  level:5,  stamCost:85  },
      { name:"Troll arboleo",     type:"miniboss", hp:740,  atk:82,  def:34,  xpR:90,  goldR:50,  level:6,  stamCost:120 },
      { name:"Reina de espinas",type:"boss",     hp:1200, atk:108, def:48,  xpR:180, goldR:100, level:7,  stamCost:180, isBoss:true },
    ]
  },
  { id:"cave",    name:"Cueva de Cristal",   emoji:"💎", unlockXP:12600,  bg:"#080814", accent:"#2a2a8a",
    desc:"4 meses acumulados. Solo los dedicados.", stamBase:110,
    monsters:[
      { name:"Medusa",      type:"mob1",     hp:760,  atk:90,  def:36,  xpR:70,  goldR:38,  level:8,  stamCost:110 },
      { name:"Ojo de cristal",  type:"mob2",     hp:880,  atk:112, def:46,  xpR:90,  goldR:50,  level:9,  stamCost:130 },
      { name:"Troll fungico",      type:"miniboss", hp:1200, atk:135, def:62,  xpR:140, goldR:80,  level:10, stamCost:170 },
      { name:"Armadillo de Cristal",type:"boss",     hp:2060, atk:170, def:85,  xpR:280, goldR:160, level:12, stamCost:250, isBoss:true },
    ]
  },
  { id:"castle",  name:"Castillo Maldito",   emoji:"🏰", unlockXP:26800, bg:"#100810", accent:"#5a1a6a",
    desc:"7 meses acumulados. Las fuerzas oscuras reinan.", stamBase:160,
    monsters:[
      { name:"Caballero Oscuro",type:"mob1",     hp:2000, atk:162, def:80,  xpR:120, goldR:70,  level:13, stamCost:160 },
      { name:"Caballero Jefe",    type:"mob2",     hp:1080,  atk:198, def:62,  xpR:145, goldR:85,  level:14, stamCost:180 },
      { name:"Golem Jefe",  type:"miniboss", hp:1740, atk:225, def:102, xpR:220, goldR:130, level:15, stamCost:230 },
      { name:"Golem tocado por el abismo ",   type:"boss",     hp:2800, atk:266, def:128, xpR:400, goldR:240, level:17, stamCost:300, isBoss:true },
    ]
  },
  { id:"abyss",   name:"El Abismo",          emoji:"🌑", unlockXP:36400, bg:"#050508", accent:"#3a0a5a",
    desc:"11 meses+ Solo los legendarios llegan aquí.", stamBase:220,
    monsters:[
      { name:"Demonio Guardián",type:"mob1",     hp:2000, atk:270, def:135, xpR:200, goldR:120, level:18, stamCost:220 },
      { name:"Ángel Caído",     type:"mob2",     hp:2500, atk:306, def:148, xpR:230, goldR:140, level:19, stamCost:250 },
      { name:"Señor Demoníaco", type:"miniboss", hp:3200, atk:342, def:170, xpR:340, goldR:200, level:20, stamCost:300 },
      { name:"Rey Eterno",   type:"boss",     hp:8000, atk:496, def:298, xpR:600, goldR:400, level:22, stamCost:400, isBoss:true, isFinal:true },
    ]
  },
];

// ═══════════════════════════════════════════════════
//  WORKOUT SYSTEM
// ═══════════════════════════════════════════════════
// Exercise library
const EXERCISE_LIB = {
  fuerza: [
    { id:"bench",    name:"Press Banca",       icon:"🏋️", defaultSets:4, defaultReps:10, defaultKg:60 },
    { id:"squat",    name:"Sentadillas",        icon:"🦵", defaultSets:4, defaultReps:8,  defaultKg:80 },
    { id:"deadlift", name:"Peso Muerto",        icon:"⚡", defaultSets:3, defaultReps:5,  defaultKg:100 },
    { id:"ohp",      name:"Press Militar",      icon:"💪", defaultSets:4, defaultReps:10, defaultKg:40 },
    { id:"row",      name:"Remo con Barra",     icon:"🚣", defaultSets:4, defaultReps:10, defaultKg:60 },
    { id:"pullup",   name:"Dominadas",          icon:"🙌", defaultSets:4, defaultReps:8,  defaultKg:0  },
    { id:"curl",     name:"Curl Bíceps",        icon:"💪", defaultSets:3, defaultReps:12, defaultKg:15 },
    { id:"dip",      name:"Fondos",             icon:"🤸", defaultSets:3, defaultReps:12, defaultKg:0  },
    { id:"lunges",   name:"Zancadas",           icon:"🦿", defaultSets:3, defaultReps:12, defaultKg:20 },
    { id:"hipthrust",name:"Hip Thrust",         icon:"🍑", defaultSets:4, defaultReps:12, defaultKg:60 },
  ],
  velocidad: [
    { id:"run",      name:"Correr",             icon:"🏃", defaultSets:1, defaultReps:30, defaultKg:0, isCardio:true, unit:"min" },
    { id:"bike",     name:"Bicicleta",          icon:"🚴", defaultSets:1, defaultReps:45, defaultKg:0, isCardio:true, unit:"min" },
    { id:"hiit",     name:"HIIT",               icon:"⚡", defaultSets:5, defaultReps:1,  defaultKg:0, isCardio:true, unit:"rondas" },
    { id:"jump",     name:"Saltar Cuerda",      icon:"🪢", defaultSets:5, defaultReps:2,  defaultKg:0, isCardio:true, unit:"min" },
    { id:"sprint",   name:"Sprints",            icon:"💨", defaultSets:8, defaultReps:1,  defaultKg:0, isCardio:true, unit:"x40m" },
    { id:"swim",     name:"Natación",           icon:"🏊", defaultSets:1, defaultReps:30, defaultKg:0, isCardio:true, unit:"min" },
    { id:"rowing",   name:"Remo Ergómetro",     icon:"🚣", defaultSets:1, defaultReps:20, defaultKg:0, isCardio:true, unit:"min" },
  ],
  vitalidad: [
    { id:"yoga",     name:"Yoga",               icon:"🧘", defaultSets:1, defaultReps:45, defaultKg:0, isCardio:true, unit:"min" },
    { id:"plank",    name:"Plancha",            icon:"🪨", defaultSets:4, defaultReps:60, defaultKg:0, isCardio:true, unit:"seg" },
    { id:"stretch",  name:"Estiramientos",      icon:"🤸", defaultSets:1, defaultReps:30, defaultKg:0, isCardio:true, unit:"min" },
    { id:"breath",   name:"Respiración 4-7-8",  icon:"💨", defaultSets:3, defaultReps:5,  defaultKg:0, isCardio:true, unit:"rondas" },
    { id:"pilates",  name:"Pilates",            icon:"🌀", defaultSets:1, defaultReps:45, defaultKg:0, isCardio:true, unit:"min" },
    { id:"walk",     name:"Caminata",           icon:"🚶", defaultSets:1, defaultReps:30, defaultKg:0, isCardio:true, unit:"min" },
  ],
};

const ALL_EXERCISES = [...EXERCISE_LIB.fuerza,...EXERCISE_LIB.velocidad,...EXERCISE_LIB.vitalidad];

// Workout templates
const WORKOUT_TEMPLATES = [
  {
    id:"push",    name:"Push Day",    icon:"💥", color:"#e74c3c",
    desc:"Pecho, hombros y tríceps",
    exercises:["bench","ohp","dip","curl"],
  },
  {
    id:"pull",    name:"Pull Day",    icon:"🔥", color:"#9b59b6",
    desc:"Espalda y bíceps",
    exercises:["row","pullup","deadlift","curl"],
  },
  {
    id:"legs",    name:"Leg Day",     icon:"🦵", color:"#e67e22",
    desc:"Piernas completo",
    exercises:["squat","deadlift","lunges","hipthrust"],
  },
  {
    id:"full",    name:"Full Body",   icon:"⚡", color:"#f39c12",
    desc:"Todo el cuerpo",
    exercises:["bench","squat","row","ohp"],
  },
  {
    id:"cardio",  name:"Cardio",      icon:"🏃", color:"#3498db",
    desc:"Resistencia y velocidad",
    exercises:["run","hiit","jump","sprint"],
  },
  {
    id:"recovery",name:"Recovery",   icon:"🌿", color:"#2ecc71",
    desc:"Movilidad y vitalidad",
    exercises:["yoga","stretch","plank","breath"],
  },
];

// XP calculator for a completed workout exercise
function calcExerciseXP(ex, sets) {
  const lib = ALL_EXERCISES.find(e=>e.id===ex.id);
  if(!lib) return 0;
  const stat = EXERCISE_LIB.fuerza.find(e=>e.id===ex.id) ? "fuerza"
    : EXERCISE_LIB.velocidad.find(e=>e.id===ex.id) ? "velocidad" : "vitalidad";
  const cfg = STAT_CFG[stat];
  if(lib.isCardio){
    // total minutes/units × xpPerUnit / 10
    const total = sets.filter(s=>s.done).reduce((a,s)=>a+Number(s.reps||0),0);
    return Math.max(0, Math.round(total * cfg.xpPerUnit / 10));
  } else {
    // volume = sets × reps × kg, xpPerUnit/10 per 10kg of volume
    const volume = sets.filter(s=>s.done).reduce((a,s)=>a+(Number(s.reps||0)*Number(s.kg||0)),0);
    return Math.max(0, Math.round(volume * cfg.xpPerUnit / 100));
  }
}

function getStatForExercise(exId) {
  if(EXERCISE_LIB.fuerza.find(e=>e.id===exId))    return "fuerza";
  if(EXERCISE_LIB.velocidad.find(e=>e.id===exId)) return "velocidad";
  return "vitalidad";
}

// ═══════════════════════════════════════════════════
//  SHOP — equipment, potions, permanent upgrades
// ═══════════════════════════════════════════════════
const SHOP_ITEMS = [
  // ── WEAPONS (boost ATK) ──
  { id:"sword_iron",    category:"weapon", name:"Espada de Hierro",    icon:"⚔️",  price:80,   bonus:{atk:8},              desc:"+8 ATK",                    reqZone:0 },
  { id:"sword_steel",   category:"weapon", name:"Espada de Acero",     icon:"🗡️",  price:250,  bonus:{atk:20},             desc:"+20 ATK",                   reqZone:1 },
  { id:"sword_magic",   category:"weapon", name:"Espada Mágica",       icon:"✨",   price:600,  bonus:{atk:45},             desc:"+45 ATK",                   reqZone:2 },
  { id:"sword_dragon",  category:"weapon", name:"Espadón del Dragón",  icon:"🐉",  price:1400, bonus:{atk:100},            desc:"+100 ATK",                  reqZone:3 },
  // ── ARMOR (boost DEF + HP) ──
  { id:"armor_leather", category:"armor",  name:"Armadura de Cuero",   icon:"🥋",  price:60,   bonus:{def:6,hp:30},        desc:"+6 DEF +30 HP",             reqZone:0 },
  { id:"armor_chain",   category:"armor",  name:"Cota de Malla",       icon:"🛡️",  price:200,  bonus:{def:18,hp:80},       desc:"+18 DEF +80 HP",            reqZone:1 },
  { id:"armor_plate",   category:"armor",  name:"Armadura de Placas",  icon:"⚙️",  price:500,  bonus:{def:40,hp:180},      desc:"+40 DEF +180 HP",           reqZone:2 },
  { id:"armor_divine",  category:"armor",  name:"Armadura Divina",     icon:"👼",  price:1200, bonus:{def:90,hp:400},      desc:"+90 DEF +400 HP",           reqZone:3 },
  // ── ACCESSORIES (mixed) ──
  { id:"ring_speed",    category:"access", name:"Anillo de Velocidad",  icon:"💍",  price:150,  bonus:{spd:0.1},            desc:"+0.1 velocidad combate",    reqZone:0 },
  { id:"amulet_life",   category:"access", name:"Amuleto de Vida",      icon:"📿",  price:300,  bonus:{hp:120},             desc:"+120 HP máx",               reqZone:1 },
  { id:"boots_swift",   category:"access", name:"Botas Veloces",        icon:"👟",  price:450,  bonus:{spd:0.2,def:10},     desc:"+0.2 velocidad +10 DEF",    reqZone:2 },
  { id:"crown_power",   category:"access", name:"Corona del Poder",     icon:"👑",  price:1000, bonus:{atk:30,def:30,hp:150},desc:"+30ATK +30DEF +150HP",     reqZone:3 },
  // ── POTIONS (consumables, used in battle) ──
  { id:"potion_small",  category:"potion", name:"Poción Pequeña",       icon:"🧪",  price:25,   heal:80,  maxStack:5,       desc:"Restaura 80 HP en combate", reqZone:0 },
  { id:"potion_medium", category:"potion", name:"Poción Media",         icon:"⚗️",  price:70,   heal:200, maxStack:5,       desc:"Restaura 200 HP en combate",reqZone:1 },
  { id:"potion_large",  category:"potion", name:"Poción Grande",        icon:"🔮",  price:180,  heal:500, maxStack:3,       desc:"Restaura 500 HP en combate",reqZone:2 },
  // ── PERMANENT UPGRADES ──
  { id:"perm_atk1",  category:"perm", name:"Entrenamiento Ofensivo I",  icon:"💪",  price:400,  bonus:{atk:15},  desc:"+15 ATK permanente",  reqZone:0, maxBuy:3 },
  { id:"perm_def1",  category:"perm", name:"Temple de Acero I",         icon:"🏋️",  price:400,  bonus:{def:12},  desc:"+12 DEF permanente",  reqZone:0, maxBuy:3 },
  { id:"perm_hp1",   category:"perm", name:"Vitalidad Extrema I",       icon:"❤️",  price:400,  bonus:{hp:100},  desc:"+100 HP permanente",  reqZone:0, maxBuy:3 },
  { id:"perm_atk2",  category:"perm", name:"Entrenamiento Ofensivo II", icon:"⚡",  price:900,  bonus:{atk:35},  desc:"+35 ATK permanente",  reqZone:2, maxBuy:2 },
  { id:"perm_def2",  category:"perm", name:"Temple de Acero II",        icon:"🔰",  price:900,  bonus:{def:28},  desc:"+28 DEF permanente",  reqZone:2, maxBuy:2 },
];

const ITEM_CATEGORIES = [
  { id:"weapon", label:"⚔️ Armas"    },
  { id:"armor",  label:"🛡️ Armadura" },
  { id:"access", label:"💍 Accesorios"},
  { id:"potion", label:"🧪 Pociones" },
  { id:"perm",   label:"📈 Mejoras"  },
];

// ═══════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════
const getLevel    = xp => Math.floor(xp/XP_PER_LEVEL)+1;
const getXpPct    = xp => (xp%XP_PER_LEVEL)/XP_PER_LEVEL*100;
const getLvTitle  = lv => LEVEL_TITLES[Math.min(lv-1,LEVEL_TITLES.length-1)];
const rand        = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
const totalXP     = s => Object.values(s).reduce((a,v)=>a+v.xp,0);

function heroStats(hero, stats, equipment=[]) {
  const cls = CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  const fLv=getLevel(stats.fuerza.xp), vLv=getLevel(stats.velocidad.xp), viLv=getLevel(stats.vitalidad.xp);
  // Base stats from training
  const base = {
    atk: Math.round((12+fLv*3.5)*cls.statBonus.atk),
    def: Math.round((6+viLv*2.2)*cls.statBonus.def),
    spd: Math.min(3.0,(1.0+vLv*0.06)*cls.statBonus.spd),
    hp:  Math.round((70+viLv*9+fLv*4)*cls.statBonus.hp),
  };
  // Add equipment bonuses
  if (equipment && equipment.length > 0) {
    equipment.forEach(itemId => {
      const item = SHOP_ITEMS.find(i=>i.id===itemId);
      if (item?.bonus) {
        if (item.bonus.atk) base.atk += item.bonus.atk;
        if (item.bonus.def) base.def += item.bonus.def;
        if (item.bonus.hp)  base.hp  += item.bonus.hp;
        if (item.bonus.spd) base.spd = Math.min(3.0, base.spd + item.bonus.spd);
      }
    });
  }
  return base;
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
function BattleScreen({ hero, hStats, zone, stamina, inventory={}, onBack, onReward, onStaminaUsed, onUsePotion }) {
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
    <div style={{height:"100vh",maxHeight:"100vh",color:"#e8e0ff",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <style>{`
        @keyframes floatDmg{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-70px) scale(1.5)}}
        @keyframes skillPulse{0%,100%{box-shadow:0 0 8px #f39c1244}50%{box-shadow:0 0 28px #f39c1299}}
        @keyframes heroIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes enemyIdle{0%,100%{transform:translateY(0) scaleX(-1)}50%{transform:translateY(-6px) scaleX(-1)}}
      `}</style>

      {/* ── FULL BG SCENE ── */}
      {bgImg && <img src={bgImg} crossOrigin="anonymous" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",zIndex:0,pointerEvents:"none"}}/>}
      {/* subtle darkening only at bottom for UI readability */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"55%",background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",zIndex:1,pointerEvents:"none"}}/>
      {!bgImg && <div style={{position:"absolute",inset:0,background:zone.bg,zIndex:0}}/>}

      {/* ── TOP HUD — zone name + enemy info ── */}
      <div style={{position:"relative",zIndex:3,padding:"10px 16px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",border:"1px solid #ffffff22",color:"#e8e0ff",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9,letterSpacing:1}}>← SALIR</button>
        {/* Enemy HP floating top-center */}
        <div style={{flex:1,textAlign:"center",padding:"0 12px"}}>
          <div style={{fontSize:9,color:monster.isBoss?"#f39c12":"rgba(255,255,255,0.6)",letterSpacing:2,marginBottom:2}}>{monster.isBoss?"👑 JEFE":"ENEMIGO"} · LV.{monster.level}</div>
          <div style={{fontSize:15,fontWeight:800,color:monster.isBoss?"#f39c12":"#fff",marginBottom:6,textShadow:"0 2px 8px rgba(0,0,0,0.8)"}}>{monster.name}</div>
          <div style={{background:"rgba(0,0,0,0.5)",borderRadius:999,height:8,overflow:"hidden",border:`1px solid ${monster.isBoss?"#f39c1266":"#e74c3c44"}`,maxWidth:220,margin:"0 auto"}}>
            <div style={{width:`${mHpPct}%`,height:"100%",background:mHpPct>50?"linear-gradient(90deg,#c0392b,#e74c3c)":mHpPct>25?"linear-gradient(90deg,#e67e22,#f39c12)":"linear-gradient(90deg,#8B0000,#e74c3c)",borderRadius:999,transition:"width 0.35s",boxShadow:`0 0 6px ${mHpPct>50?"#e74c3c":"#f39c12"}88`}}/>
          </div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.5)",marginTop:3}}>{Math.max(0,monHP)}/{monster.hp} HP</div>
        </div>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",background:"rgba(0,0,0,0.4)",borderRadius:8,padding:"6px 10px"}}>⚡{stamina}</div>
      </div>

      {/* ── BATTLE SCENE — hero left, enemy right, both on ground ── */}
      <div style={{position:"relative",zIndex:2,flex:1,display:"flex",alignItems:"flex-end",justifyContent:"space-between",padding:"0 8% 20px"}}>

        {/* HERO — left side, standing on ground */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
          {/* damage floats */}
          {floats.filter(f=>f.side==="hero").map(f=>(
            <div key={f.id} style={{position:"absolute",top:-30,left:"50%",transform:"translateX(-50%)",color:f.color,fontWeight:900,fontSize:16,animation:"floatDmg 0.9s ease forwards",pointerEvents:"none",textShadow:"0 0 12px currentColor",whiteSpace:"nowrap",zIndex:10}}>{f.txt}</div>
          ))}
          <div style={{animation:"heroIdle 2s ease-in-out infinite"}}>
            <HeroImg hero={hero} size={130} flip={false} shake={shakeH} flash={flashH}/>
          </div>
          {/* hero name tag */}
          <div style={{marginTop:4,background:"rgba(0,0,0,0.6)",borderRadius:6,padding:"2px 8px",fontSize:9,color:cls.color,fontWeight:800,letterSpacing:1,backdropFilter:"blur(4px)"}}>{hero.name}</div>
        </div>

        {/* ENEMY — right side, standing on ground */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",position:"relative"}}>
          {floats.filter(f=>f.side==="monster").map(f=>(
            <div key={f.id} style={{position:"absolute",top:-30,left:"50%",transform:"translateX(-50%)",color:f.color,fontWeight:900,fontSize:18,animation:"floatDmg 0.9s ease forwards",pointerEvents:"none",textShadow:"0 0 12px currentColor",whiteSpace:"nowrap",zIndex:10}}>{f.txt}</div>
          ))}
          {/* enemy sprite — natural size, facing left (flip=true) */}
          <div style={{animation:outcome==="victory"?undefined:"enemyIdle 2.4s ease-in-out infinite",filter:outcome==="victory"?"grayscale(1) opacity(0.3)":"none",transition:"filter 0.4s"}}>
            <EnemyImg zone={zone} monsterType={monster.type} size={monster.isBoss?220:170} shake={shakeM} flash={flashM} defeated={false}/>
          </div>
          <div style={{marginTop:4,background:"rgba(0,0,0,0.6)",borderRadius:6,padding:"2px 8px",fontSize:9,color:monster.isBoss?"#f39c12":"rgba(255,255,255,0.6)",fontWeight:800,letterSpacing:1,backdropFilter:"blur(4px)"}}>{monster.name}</div>
        </div>

        {/* OUTCOME OVERLAYS */}
        {outcome==="zone_clear"&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",zIndex:10}}>
            <div style={{textAlign:"center",padding:24,background:"rgba(0,0,0,0.6)",borderRadius:16,border:"1px solid #f39c1244",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:40,marginBottom:10}}>🏆</div>
              <div style={{color:"#f39c12",fontSize:14,fontWeight:800,letterSpacing:2,marginBottom:16}}>¡ZONA COMPLETADA!</div>
              <button onClick={onBack} style={{background:"linear-gradient(90deg,#f39c12,#ffeaa7)",border:"none",color:"#000",borderRadius:10,padding:"10px 24px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:800,letterSpacing:1}}>VOLVER AL MAPA</button>
            </div>
          </div>
        )}
        {outcome==="defeat"&&(
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.8)",zIndex:10}}>
            <div style={{textAlign:"center",padding:24,background:"rgba(0,0,0,0.6)",borderRadius:16,border:"1px solid #e74c3c44",backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:40,marginBottom:10}}>💀</div>
              <div style={{color:"#e74c3c",fontSize:14,fontWeight:800,marginBottom:6}}>HAS CAÍDO</div>
              <div style={{color:"rgba(255,255,255,0.5)",fontSize:10,marginBottom:16}}>Entrena más y vuelve más fuerte</div>
              <button onClick={onBack} style={{background:"#e74c3c",border:"none",color:"#fff",borderRadius:10,padding:"10px 24px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:800}}>RETIRARSE</button>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM UI PANEL ── */}
      <div style={{position:"relative",zIndex:3,background:"rgba(6,6,18,0.88)",backdropFilter:"blur(12px)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"12px 14px 14px"}}>

        {/* Hero HP + Gauge */}
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:38,height:38,borderRadius:8,overflow:"hidden",flexShrink:0,border:`1px solid ${cls.color}44`}}>
            <HeroImg hero={hero} size={38} flip={false}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:10,fontWeight:800,color:cls.color}}>{hero.name}</span>
              <span style={{fontSize:9,color:"rgba(255,255,255,0.4)"}}>HP {Math.max(0,heroHP)}/{hStats.hp}</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:999,height:7,overflow:"hidden",marginBottom:4}}>
              <div style={{width:`${hpPct}%`,height:"100%",background:hpPct>50?"linear-gradient(90deg,#27ae60,#2ecc71)":hpPct>25?"linear-gradient(90deg,#e67e22,#f39c12)":"linear-gradient(90deg,#c0392b,#e74c3c)",borderRadius:999,transition:"width 0.35s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontSize:8,color:"#f39c12"}}>GAUGE</span>
              <span style={{fontSize:8,color:"rgba(255,255,255,0.3)"}}>{Math.round(gauge)}/100</span>
            </div>
            <div style={{background:"rgba(255,255,255,0.06)",borderRadius:999,height:5,overflow:"hidden"}}>
              <div style={{width:`${gauge}%`,height:"100%",background:"linear-gradient(90deg,#e67e22,#f39c12)",borderRadius:999,transition:"width 0.4s",boxShadow:gauge>=cls.skills[0].cost?"0 0 8px #f39c12":"none"}}/>
            </div>
          </div>
        </div>

        {/* Skills + Potion */}
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {cls.skills.map((sk,i)=>{
            const ready=gauge>=sk.cost&&phase==="idle"&&!outcome;
            return (
              <button key={sk.id} onClick={()=>castSkill(i)} style={{
                flex:1, padding:"8px 4px", borderRadius:10, cursor:ready?"pointer":"not-allowed",
                border:`2px solid ${ready?"#f39c12":"rgba(255,255,255,0.06)"}`,
                background:ready?"rgba(240,140,0,0.12)":"rgba(255,255,255,0.03)",
                color:ready?"#f39c12":"rgba(255,255,255,0.2)",
                fontFamily:"'Courier New',monospace", fontSize:9, fontWeight:800,
                animation:ready?"skillPulse 1.5s ease-in-out infinite":undefined,
                transition:"all 0.2s", display:"flex", flexDirection:"column", alignItems:"center", gap:2,
              }}>
                <span style={{fontSize:18}}>{sk.icon}</span>
                <span>{sk.name}</span>
                <span style={{fontSize:7,color:ready?"#e67e22":"rgba(255,255,255,0.15)"}}>{sk.cost} GAUGE</span>
              </button>
            );
          })}
          {/* Potion buttons */}
          {SHOP_ITEMS.filter(i=>i.category==="potion"&&(inventory[i.id]||0)>0).slice(0,1).map(potion=>(
            <button key={potion.id} onClick={()=>{
              if(phase!=="idle"||outcome) return;
              setHeroHP(h=>Math.min(hStats.hp,h+potion.heal));
              onUsePotion(potion.id);
              addLog(`${hero.name} usa ${potion.name} → +${potion.heal} HP`,"#2ecc71");
            }} style={{
              width:56, padding:"8px 4px", borderRadius:10, cursor:phase==="idle"&&!outcome?"pointer":"not-allowed",
              border:"2px solid #2ecc7166", background:"rgba(46,204,113,0.1)",
              color:"#2ecc71", fontFamily:"'Courier New',monospace", fontSize:9, fontWeight:800,
              display:"flex", flexDirection:"column", alignItems:"center", gap:2, flexShrink:0,
            }}>
              <span style={{fontSize:18}}>{potion.icon}</span>
              <span style={{fontSize:7}}>×{inventory[potion.id]}</span>
            </button>
          ))}
        </div>

        {/* Battle log */}
        <div style={{background:"rgba(0,0,0,0.3)",borderRadius:8,padding:"6px 10px",maxHeight:56,overflowY:"auto",fontSize:9,lineHeight:1.6,border:"1px solid rgba(255,255,255,0.04)"}}>
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
//  WORKOUT SCREEN — Hevy-style interactive training
// ═══════════════════════════════════════════════════
function WorkoutScreen({ hero, stats, onFinish, onBack }) {
  const cls = CLASSES.find(c=>c.id===hero.class)||CLASSES[0];

  // Phase: "select" | "active" | "summary"
  const [phase, setPhase]     = useState("select");
  const [template, setTemplate] = useState(null);

  // Active workout state
  const [exercises, setExercises] = useState([]); // [{id, sets:[{reps,kg,done}]}]
  const [activeEx,  setActiveEx]  = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsed,   setElapsed]   = useState(0);

  // Rest timer
  const [restActive, setRestActive]   = useState(false);
  const [restTotal,  setRestTotal]    = useState(90);
  const [restLeft,   setRestLeft]     = useState(90);
  const restRef = useRef(null);

  // Add exercise picker
  const [showPicker, setShowPicker]   = useState(false);
  const [pickerStat, setPickerStat]   = useState("fuerza");

  // Summary
  const [summary, setSummary] = useState(null);

  // Elapsed timer
  useEffect(()=>{
    if(phase!=="active"||!startTime) return;
    const t=setInterval(()=>setElapsed(Math.floor((Date.now()-startTime)/1000)),1000);
    return()=>clearInterval(t);
  },[phase,startTime]);

  // Rest countdown
  useEffect(()=>{
    if(!restActive) return;
    restRef.current=setInterval(()=>{
      setRestLeft(l=>{
        if(l<=1){
          clearInterval(restRef.current);
          setRestActive(false);
          // Beep via AudioContext
          try{
            const ctx=new(window.AudioContext||window.webkitAudioContext)();
            [0,200,400].forEach(d=>setTimeout(()=>{
              const o=ctx.createOscillator(),g=ctx.createGain();
              o.connect(g);g.connect(ctx.destination);
              o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);
              g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
              o.start();o.stop(ctx.currentTime+0.3);
            },d));
          }catch(e){}
          return 0;
        }
        return l-1;
      });
    },1000);
    return()=>clearInterval(restRef.current);
  },[restActive]);

  function startFromTemplate(tmpl) {
    const exs = tmpl.exercises.map(id=>{
      const lib=ALL_EXERCISES.find(e=>e.id===id);
      if(!lib) return null;
      const sets=[...Array(lib.defaultSets)].map(()=>({
        reps: lib.isCardio ? lib.defaultReps : lib.defaultReps,
        kg:   lib.defaultKg,
        done: false,
      }));
      return{id,sets};
    }).filter(Boolean);
    setExercises(exs);
    setTemplate(tmpl);
    setStartTime(Date.now());
    setElapsed(0);
    setPhase("active");
    setActiveEx(0);
  }

  function startCustom() {
    setExercises([]);
    setTemplate({id:"custom",name:"Entreno Custom",icon:"✏️",color:cls.color,desc:"Tu rutina personalizada"});
    setStartTime(Date.now());
    setElapsed(0);
    setPhase("active");
    setActiveEx(0);
    setShowPicker(true);
  }

  function toggleSet(exIdx, setIdx) {
    setExercises(prev=>{
      const next=[...prev];
      const s={...next[exIdx].sets[setIdx]};
      const wasDone=s.done;
      s.done=!s.done;
      next[exIdx]={...next[exIdx],sets:next[exIdx].sets.map((ss,i)=>i===setIdx?s:ss)};
      // Start rest timer when marking done
      if(!wasDone && s.done) {
        setRestLeft(restTotal);
        setRestActive(true);
      }
      return next;
    });
  }

  function updateSet(exIdx, setIdx, field, val) {
    setExercises(prev=>{
      const next=[...prev];
      const sets=[...next[exIdx].sets];
      sets[setIdx]={...sets[setIdx],[field]:val};
      next[exIdx]={...next[exIdx],sets};
      return next;
    });
  }

  function addSet(exIdx) {
    setExercises(prev=>{
      const next=[...prev];
      const last=next[exIdx].sets[next[exIdx].sets.length-1]||{reps:10,kg:0,done:false};
      next[exIdx]={...next[exIdx],sets:[...next[exIdx].sets,{reps:last.reps,kg:last.kg,done:false}]};
      return next;
    });
  }

  function removeSet(exIdx, setIdx) {
    setExercises(prev=>{
      const next=[...prev];
      next[exIdx]={...next[exIdx],sets:next[exIdx].sets.filter((_,i)=>i!==setIdx)};
      return next;
    });
  }

  function addExercise(exId) {
    const lib=ALL_EXERCISES.find(e=>e.id===exId);
    if(!lib||exercises.find(e=>e.id===exId)) return;
    const sets=[...Array(lib.defaultSets)].map(()=>({reps:lib.defaultReps,kg:lib.defaultKg,done:false}));
    setExercises(prev=>[...prev,{id:exId,sets}]);
    setShowPicker(false);
  }

  function finishWorkout() {
    // Calculate XP per stat
    const xpMap={fuerza:0,velocidad:0,vitalidad:0};
    exercises.forEach(ex=>{
      const stat=getStatForExercise(ex.id);
      xpMap[stat]+=calcExerciseXP(ex,ex.sets);
    });
    const totalSets=exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
    const totalXpGained=Object.values(xpMap).reduce((a,v)=>a+v,0);
    setSummary({xpMap,totalSets,duration:elapsed,totalXp:totalXpGained});
    setPhase("summary");
    onFinish(xpMap, elapsed);
  }

  const fmt=s=>`${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const totalDoneSets=exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalSets=exercises.reduce((a,e)=>a+e.sets.length,0);
  const liveXP=exercises.reduce((a,ex)=>a+calcExerciseXP(ex,ex.sets),0);

  // ── SELECT TEMPLATE ──
  if(phase==="select") return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",paddingBottom:40}}>
      <div style={{background:"linear-gradient(160deg,#0e0820,#0a1228)",borderBottom:`1px solid ${cls.color}22`,padding:"14px 16px"}}>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onBack} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9}}>← VOLVER</button>
          <div style={{fontSize:12,color:cls.color,letterSpacing:2,fontWeight:800}}>💪 INICIAR ENTRENO</div>
          <div style={{width:60}}/>
        </div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:16}}>
        <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:12}}>PLANTILLAS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          {WORKOUT_TEMPLATES.map(tmpl=>(
            <button key={tmpl.id} onClick={()=>startFromTemplate(tmpl)}
              style={{background:`${tmpl.color}11`,border:`1px solid ${tmpl.color}44`,borderRadius:12,padding:"16px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",fontFamily:"'Courier New',monospace"}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${tmpl.color}22`;e.currentTarget.style.border=`1px solid ${tmpl.color}88`;}}
              onMouseLeave={e=>{e.currentTarget.style.background=`${tmpl.color}11`;e.currentTarget.style.border=`1px solid ${tmpl.color}44`;}}>
              <div style={{fontSize:24,marginBottom:6}}>{tmpl.icon}</div>
              <div style={{fontSize:12,fontWeight:800,color:tmpl.color,marginBottom:3}}>{tmpl.name}</div>
              <div style={{fontSize:9,color:"#6b7280"}}>{tmpl.desc}</div>
              <div style={{fontSize:8,color:"#4b5563",marginTop:6}}>
                {tmpl.exercises.map(id=>ALL_EXERCISES.find(e=>e.id===id)?.name).filter(Boolean).slice(0,2).join(", ")}...
              </div>
            </button>
          ))}
        </div>
        <button onClick={startCustom}
          style={{width:"100%",padding:14,borderRadius:12,cursor:"pointer",border:`2px dashed ${cls.color}44`,background:"transparent",color:cls.color,fontFamily:"'Courier New',monospace",fontSize:12,fontWeight:800,letterSpacing:2}}>
          ✏️ CREAR RUTINA PERSONALIZADA
        </button>
      </div>
    </div>
  );

  // ── SUMMARY ──
  if(phase==="summary"&&summary) return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{maxWidth:440,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:48,marginBottom:16}}>⚔️</div>
        <div style={{fontSize:10,color:cls.color,letterSpacing:4,marginBottom:8}}>ENTRENAMIENTO COMPLETADO</div>
        <div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:4}}>{template?.name}</div>
        <div style={{fontSize:11,color:"#6b7280",marginBottom:24}}>Duración: {fmt(summary.duration)} · {summary.totalSets} sets completados</div>

        {/* XP earned per stat */}
        <div style={{background:"#0e0e1c",border:"1px solid #2d2060",borderRadius:14,padding:16,marginBottom:16}}>
          <div style={{fontSize:9,color:"#7c3aed",letterSpacing:3,marginBottom:12}}>XP GANADO</div>
          {Object.entries(summary.xpMap).filter(([,v])=>v>0).map(([stat,xp])=>{
            const cfg=STAT_CFG[stat];
            return(
              <div key={stat} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:18}}>{cfg.icon}</span>
                <span style={{flex:1,fontSize:12,color:cfg.color,fontWeight:800}}>{cfg.label}</span>
                <span style={{fontSize:16,fontWeight:800,color:cfg.color}}>+{xp} XP</span>
              </div>
            );
          })}
          <div style={{borderTop:"1px solid #1e1e3a",marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:11,color:"#9ca3af"}}>TOTAL</span>
            <span style={{fontSize:18,fontWeight:800,color:"#f39c12"}}>+{summary.totalXp} XP ⚡+{summary.totalXp} STAMINA</span>
          </div>
        </div>

        <button onClick={onBack} style={{width:"100%",padding:14,borderRadius:12,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${cls.color},${cls.accent})`,color:"#fff",fontWeight:800,fontSize:14,fontFamily:"'Courier New',monospace",letterSpacing:2,boxShadow:`0 4px 20px ${cls.color}55`}}>
          ¡ÉPICO! VOLVER AL MAPA →
        </button>
      </div>
    </div>
  );

  // ── ACTIVE WORKOUT ──
  const currentEx = exercises[activeEx];
  const currentLib = currentEx ? ALL_EXERCISES.find(e=>e.id===currentEx.id) : null;

  return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",paddingBottom:100}}>
      <style>{`
        @keyframes restPulse{0%,100%{opacity:1}50%{opacity:0.6}}
        @keyframes xpFloat{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
        .set-row:hover{background:#0e0e1c!important;}
      `}</style>

      {/* Header */}
      <div style={{background:"#0a0818",borderBottom:`1px solid ${cls.color}22`,padding:"10px 16px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
            <button onClick={()=>{if(window.confirm("¿Terminar entrenamiento?"))finishWorkout();}} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9}}>TERMINAR</button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:11,color:cls.color,fontWeight:800}}>{template?.icon} {template?.name}</div>
              <div style={{fontSize:10,color:"#6b7280"}}>⏱ {fmt(elapsed)}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#f39c12",fontWeight:800}}>+{liveXP} XP</div>
              <div style={{fontSize:9,color:"#6b7280"}}>{totalDoneSets}/{totalSets} sets</div>
            </div>
          </div>
          {/* Overall progress bar */}
          <div style={{background:"#1a1a2e",borderRadius:999,height:4,overflow:"hidden"}}>
            <div style={{width:`${totalSets>0?(totalDoneSets/totalSets)*100:0}%`,height:"100%",background:`linear-gradient(90deg,${cls.color},${cls.accent})`,borderRadius:999,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {restActive&&(
        <div style={{position:"fixed",bottom:80,left:"50%",transform:"translateX(-50%)",zIndex:50,background:"#0a0818",border:"2px solid #3498db",borderRadius:16,padding:"12px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 32px #3498db44",animation:"restPulse 1s ease-in-out infinite"}}>
          {/* Circle timer SVG */}
          <svg width={48} height={48}>
            <circle cx={24} cy={24} r={20} fill="none" stroke="#1e1e3a" strokeWidth={4}/>
            <circle cx={24} cy={24} r={20} fill="none" stroke="#3498db" strokeWidth={4}
              strokeDasharray={`${2*Math.PI*20}`}
              strokeDashoffset={`${2*Math.PI*20*(1-restLeft/restTotal)}`}
              strokeLinecap="round"
              style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dashoffset 1s linear"}}/>
            <text x={24} y={28} textAnchor="middle" fill="#fff" fontSize={13} fontWeight="bold" fontFamily="'Courier New',monospace">{restLeft}</text>
          </svg>
          <div>
            <div style={{fontSize:11,color:"#3498db",fontWeight:800,letterSpacing:1}}>DESCANSANDO</div>
            <div style={{fontSize:9,color:"#6b7280"}}>Próximo set en {restLeft}s</div>
          </div>
          <button onClick={()=>{clearInterval(restRef.current);setRestActive(false);}}
            style={{background:"#3498db22",border:"1px solid #3498db44",color:"#3498db",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:9,fontFamily:"'Courier New',monospace"}}>
            SALTAR
          </button>
          {/* Rest time selector */}
          <div style={{display:"flex",gap:4}}>
            {[60,90,120].map(t=>(
              <button key={t} onClick={()=>{setRestTotal(t);setRestLeft(t);}}
                style={{background:restTotal===t?"#3498db22":"none",border:`1px solid ${restTotal===t?"#3498db":"#2d2060"}`,color:restTotal===t?"#3498db":"#4b5563",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:8,fontFamily:"'Courier New',monospace"}}>
                {t}s
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{maxWidth:480,margin:"0 auto",padding:"12px 16px"}}>
        {/* Exercise tabs */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:12,scrollbarWidth:"none"}}>
          {exercises.map((ex,i)=>{
            const lib=ALL_EXERCISES.find(e=>e.id===ex.id);
            const done=ex.sets.every(s=>s.done)&&ex.sets.length>0;
            const partial=ex.sets.some(s=>s.done)&&!done;
            return(
              <button key={ex.id} onClick={()=>setActiveEx(i)}
                style={{flexShrink:0,padding:"6px 12px",borderRadius:8,cursor:"pointer",border:`2px solid ${activeEx===i?cls.color:done?"#2ecc7166":"#1e1e3a"}`,background:activeEx===i?`${cls.color}22`:done?"#0a1a0a":"#0e0e1c",color:activeEx===i?cls.color:done?"#2ecc71":"#6b7280",fontSize:9,fontWeight:800,fontFamily:"'Courier New',monospace",whiteSpace:"nowrap"}}>
                {done?"✅":partial?"🔄":lib?.icon||"💪"} {lib?.name||ex.id}
              </button>
            );
          })}
          <button onClick={()=>setShowPicker(true)}
            style={{flexShrink:0,padding:"6px 12px",borderRadius:8,cursor:"pointer",border:"2px dashed #2d2060",background:"transparent",color:"#4b5563",fontSize:9,fontWeight:800,fontFamily:"'Courier New',monospace",whiteSpace:"nowrap"}}>
            + ADD
          </button>
        </div>

        {/* Exercise picker modal */}
        {showPicker&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",zIndex:100,display:"flex",flexDirection:"column",padding:16}}>
            <div style={{maxWidth:480,margin:"0 auto",width:"100%",flex:1,display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontSize:12,color:"#e8e0ff",fontWeight:800}}>Agregar ejercicio</div>
                <button onClick={()=>setShowPicker(false)} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:10}}>✕</button>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {["fuerza","velocidad","vitalidad"].map(s=>(
                  <button key={s} onClick={()=>setPickerStat(s)}
                    style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",border:`2px solid ${pickerStat===s?STAT_CFG[s].color:"#1e1e3a"}`,background:pickerStat===s?`${STAT_CFG[s].color}22`:"#0e0e1c",color:pickerStat===s?STAT_CFG[s].color:"#6b7280",fontSize:9,fontWeight:800,fontFamily:"'Courier New',monospace"}}>
                    {STAT_CFG[s].icon} {STAT_CFG[s].label.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{overflowY:"auto",flex:1}}>
                {EXERCISE_LIB[pickerStat].map(ex=>{
                  const alreadyAdded=exercises.find(e=>e.id===ex.id);
                  return(
                    <button key={ex.id} onClick={()=>!alreadyAdded&&addExercise(ex.id)}
                      style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,marginBottom:6,background:alreadyAdded?"#0a0a0a":"#0e0e1c",border:`1px solid ${alreadyAdded?"#1e1e3a":STAT_CFG[pickerStat].color+"33"}`,cursor:alreadyAdded?"not-allowed":"pointer",textAlign:"left",fontFamily:"'Courier New',monospace",opacity:alreadyAdded?0.4:1}}>
                      <span style={{fontSize:24}}>{ex.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:800,color:"#e8e0ff"}}>{ex.name}</div>
                        <div style={{fontSize:9,color:"#6b7280"}}>{ex.defaultSets} sets · {ex.isCardio?`${ex.defaultReps} ${ex.unit||"min"}`:`${ex.defaultReps} reps · ${ex.defaultKg}kg`}</div>
                      </div>
                      {alreadyAdded?<span style={{fontSize:9,color:"#4b5563"}}>YA AGREGADO</span>:<span style={{fontSize:18,color:STAT_CFG[pickerStat].color}}>+</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Current exercise */}
        {currentEx&&currentLib&&(
          <div style={{background:"#0e0e1c",border:`1px solid ${cls.color}22`,borderRadius:14,padding:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <span style={{fontSize:28}}>{currentLib.icon}</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:"#e8e0ff"}}>{currentLib.name}</div>
                <div style={{fontSize:9,color:"#6b7280"}}>{getStatForExercise(currentEx.id)==="fuerza"?"⚔️ Fuerza":getStatForExercise(currentEx.id)==="velocidad"?"💨 Velocidad":"💚 Vitalidad"}</div>
              </div>
              <div style={{marginLeft:"auto",fontSize:11,color:"#f39c12",fontWeight:800}}>
                +{calcExerciseXP(currentEx,currentEx.sets)} XP
              </div>
            </div>

            {/* Sets table header */}
            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 1fr 40px 32px",gap:6,marginBottom:6,padding:"0 4px"}}>
              <div style={{fontSize:8,color:"#4b5563",textAlign:"center"}}>SET</div>
              <div style={{fontSize:8,color:"#4b5563",textAlign:"center"}}>{currentLib.isCardio?(currentLib.unit||"MIN"):"REPS"}</div>
              {!currentLib.isCardio&&<div style={{fontSize:8,color:"#4b5563",textAlign:"center"}}>KG</div>}
              {currentLib.isCardio&&<div style={{fontSize:8,color:"#4b5563"}}/>}
              <div style={{fontSize:8,color:"#4b5563",textAlign:"center"}}>✓</div>
              <div/>
            </div>

            {/* Sets rows */}
            {currentEx.sets.map((set,si)=>(
              <div key={si} className="set-row" style={{display:"grid",gridTemplateColumns:"32px 1fr 1fr 40px 32px",gap:6,marginBottom:6,background:set.done?"#0a180a":"#060612",borderRadius:8,padding:"6px 4px",border:`1px solid ${set.done?"#2ecc7144":"#1e1e3a"}`,transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#6b7280",fontWeight:800}}>{si+1}</div>
                <input
                  type="number" min="0"
                  value={set.reps}
                  onChange={e=>updateSet(activeEx,si,"reps",e.target.value)}
                  style={{background:"#0a0a18",border:"1px solid #2d2060",color:"#e8e0ff",borderRadius:6,padding:"6px 4px",fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"'Courier New',monospace",width:"100%",boxSizing:"border-box"}}
                />
                {!currentLib.isCardio?(
                  <input
                    type="number" min="0" step="2.5"
                    value={set.kg}
                    onChange={e=>updateSet(activeEx,si,"kg",e.target.value)}
                    style={{background:"#0a0a18",border:"1px solid #2d2060",color:"#e8e0ff",borderRadius:6,padding:"6px 4px",fontSize:13,fontWeight:800,textAlign:"center",fontFamily:"'Courier New',monospace",width:"100%",boxSizing:"border-box"}}
                  />
                ):<div/>}
                <button onClick={()=>toggleSet(activeEx,si)}
                  style={{background:set.done?"#2ecc71":"#1a1a2e",border:`2px solid ${set.done?"#2ecc71":"#2d2060"}`,borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,transition:"all 0.15s"}}>
                  {set.done?"✅":"○"}
                </button>
                <button onClick={()=>removeSet(activeEx,si)}
                  style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  ×
                </button>
              </div>
            ))}

            <button onClick={()=>addSet(activeEx)}
              style={{width:"100%",padding:"8px",borderRadius:8,cursor:"pointer",border:`1px dashed ${cls.color}44`,background:"transparent",color:cls.color,fontFamily:"'Courier New',monospace",fontSize:10,fontWeight:800,marginTop:4}}>
              + AGREGAR SET
            </button>
          </div>
        )}

        {exercises.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0",color:"#4b5563",fontSize:11}}>
            Agrega ejercicios con el botón + ADD
          </div>
        )}

        {/* Finish button */}
        {exercises.length>0&&(
          <button onClick={finishWorkout}
            style={{width:"100%",padding:14,borderRadius:12,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${cls.color},${cls.accent})`,color:"#fff",fontWeight:800,fontSize:13,fontFamily:"'Courier New',monospace",letterSpacing:2,marginTop:16,boxShadow:`0 4px 20px ${cls.color}44`}}>
            ⚔️ FINALIZAR ENTRENO (+{liveXP} XP)
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  SHOP SCREEN
// ═══════════════════════════════════════════════════
function ShopScreen({ gold, equipment, inventory, stats, shopCat, setShopCat, onBuy, onBack }) {
  const txp = totalXP(stats);
  const filteredItems = SHOP_ITEMS.filter(i=>i.category===shopCat);

  function isOwned(item) {
    if(item.category==="potion") return false;
    if(item.category==="perm") return equipment.filter(id=>id===item.id).length>=(item.maxBuy||1);
    const catItems = SHOP_ITEMS.filter(i=>i.category===item.category).map(i=>i.id);
    return equipment.some(id=>id===item.id);
  }
  function isEquipped(item) {
    if(item.category==="potion"||item.category==="perm") return false;
    return equipment.includes(item.id);
  }

  return (
    <div style={{minHeight:"100vh",background:"#060612",color:"#e8e0ff",fontFamily:"'Courier New',monospace",paddingBottom:40}}>
      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#0e0820,#0a1228)",borderBottom:"1px solid #f39c1222",padding:"14px 16px"}}>
        <div style={{maxWidth:480,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onBack} style={{background:"none",border:"1px solid #2d2060",color:"#6b7280",borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'Courier New',monospace",fontSize:9}}>← VOLVER</button>
          <div style={{fontSize:12,color:"#f39c12",letterSpacing:2,fontWeight:800}}>🏪 TIENDA</div>
          <div style={{fontSize:12,color:"#f39c12",fontWeight:800}}>🪙 {gold}</div>
        </div>
      </div>

      <div style={{maxWidth:480,margin:"0 auto",padding:16}}>
        {/* Equipped panel */}
        <div style={{background:"#0e0e1c",border:"1px solid #f39c1222",borderRadius:12,padding:14,marginBottom:14}}>
          <div style={{fontSize:8,color:"#f39c12",letterSpacing:3,marginBottom:10}}>TU EQUIPAMIENTO ACTUAL</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
            {["weapon","armor","access"].map(cat=>{
              const catLabel={"weapon":"⚔️ Arma","armor":"🛡️ Armadura","access":"💍 Accesorio"}[cat];
              const equipped=SHOP_ITEMS.find(i=>i.category===cat&&equipment.includes(i.id));
              return(
                <div key={cat} style={{background:"#060612",borderRadius:8,padding:"8px 10px",border:`1px solid ${equipped?"#f39c1244":"#1e1e3a"}`}}>
                  <div style={{fontSize:7,color:"#4b5563",letterSpacing:2,marginBottom:3}}>{catLabel}</div>
                  {equipped?(
                    <div>
                      <div style={{fontSize:11,color:"#f39c12",fontWeight:800}}>{equipped.icon} {equipped.name}</div>
                      <div style={{fontSize:8,color:"#6b7280",marginTop:2}}>{equipped.desc}</div>
                    </div>
                  ):<div style={{fontSize:10,color:"#2d2d4e"}}>— Sin equipo —</div>}
                </div>
              );
            })}
            {/* Potions in inventory */}
            <div style={{background:"#060612",borderRadius:8,padding:"8px 10px",border:"1px solid #1e1e3a"}}>
              <div style={{fontSize:7,color:"#4b5563",letterSpacing:2,marginBottom:3}}>🧪 POCIONES</div>
              {SHOP_ITEMS.filter(i=>i.category==="potion"&&(inventory[i.id]||0)>0).length===0
                ?<div style={{fontSize:10,color:"#2d2d4e"}}>— Sin pociones —</div>
                :SHOP_ITEMS.filter(i=>i.category==="potion"&&(inventory[i.id]||0)>0).map(i=>(
                  <div key={i.id} style={{fontSize:10,color:"#2ecc71"}}>{i.icon} {i.name} ×{inventory[i.id]}</div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {ITEM_CATEGORIES.map(cat=>(
            <button key={cat.id} onClick={()=>setShopCat(cat.id)}
              style={{padding:"6px 10px",borderRadius:8,cursor:"pointer",border:`1px solid ${shopCat===cat.id?"#f39c12":"#1e1e3a"}`,background:shopCat===cat.id?"#1a0f00":"#0e0e1c",color:shopCat===cat.id?"#f39c12":"#6b7280",fontFamily:"'Courier New',monospace",fontSize:9,fontWeight:800,transition:"all 0.15s"}}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Items */}
        {filteredItems.map(item=>{
          const unlocked=txp>=ZONES[item.reqZone].unlockXP;
          const owned=isOwned(item);
          const equipped=isEquipped(item);
          const qty=inventory[item.id]||0;
          const canBuy=unlocked&&!owned&&gold>=item.price;
          return(
            <div key={item.id} style={{background:"#0e0e1c",border:`1px solid ${equipped?"#f39c1266":owned&&item.category!=="potion"?"#2ecc7133":"#1e1e3a"}`,borderRadius:10,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12,opacity:unlocked?1:0.5}}>
              <div style={{fontSize:28,flexShrink:0}}>{item.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:800,color:equipped?"#f39c12":owned&&item.category!=="potion"?"#2ecc71":"#e8e0ff"}}>{item.name}</span>
                  {equipped&&<span style={{fontSize:7,background:"#f39c1222",color:"#f39c12",borderRadius:4,padding:"1px 5px",letterSpacing:1}}>EQUIPADO</span>}
                  {owned&&!equipped&&item.category!=="perm"&&item.category!=="potion"&&<span style={{fontSize:7,background:"#2ecc7122",color:"#2ecc71",borderRadius:4,padding:"1px 5px",letterSpacing:1}}>TIENES</span>}
                  {item.category==="potion"&&qty>0&&<span style={{fontSize:7,background:"#3498db22",color:"#3498db",borderRadius:4,padding:"1px 5px",letterSpacing:1}}>×{qty}/{item.maxStack}</span>}
                </div>
                <div style={{fontSize:9,color:"#6b7280"}}>{item.desc}</div>
                {!unlocked&&<div style={{fontSize:8,color:"#e74c3c",marginTop:2}}>🔒 Requiere {ZONES[item.reqZone].name}</div>}
                {item.maxBuy&&<div style={{fontSize:8,color:"#9ca3af",marginTop:1}}>Comprable {equipment.filter(id=>id===item.id).length}/{item.maxBuy} veces</div>}
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                <div style={{fontSize:11,color:"#f39c12",fontWeight:800,marginBottom:4}}>🪙{item.price}</div>
                <button onClick={()=>onBuy(item)} disabled={!canBuy}
                  style={{padding:"6px 12px",borderRadius:8,cursor:canBuy?"pointer":"not-allowed",border:"none",background:canBuy?"linear-gradient(90deg,#f39c12,#ffeaa7)":owned&&item.category!=="potion"?"#1a2a1a":"#1a1a2e",color:canBuy?"#000":owned&&item.category!=="potion"?"#2ecc71":"#4b5563",fontFamily:"'Courier New',monospace",fontSize:9,fontWeight:800,letterSpacing:1,whiteSpace:"nowrap"}}>
                  {!unlocked?"🔒":owned&&item.category!=="potion"?"✓ LISTO":"COMPRAR"}
                </button>
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
  // Equipment: list of owned item IDs (equipped = passive always active)
  const [equipment, setEquipment] = useState([]);
  // Inventory: { itemId: qty } for consumables
  const [inventory, setInventory] = useState({});
  const [shopCat,   setShopCat]   = useState("weapon");

  useEffect(()=>{
    try{
        const h=localStorage.getItem("rpgv6_hero");
        const s=localStorage.getItem("rpgv6_stats");
        const l=localStorage.getItem("rpgv6_log");
        const g=localStorage.getItem("rpgv6_gold");
        const st=localStorage.getItem("rpgv6_stamina");
        const eq=localStorage.getItem("rpgv6_equipment");
        const inv=localStorage.getItem("rpgv6_inventory");
        if(h){setHero(JSON.parse(h));setScreen("main");}else setScreen("create");
        if(s)setStats(JSON.parse(s));
        if(l)setWlog(JSON.parse(l));
        if(g)setGold(Number(g));
        if(st)setStamina(Math.min(MAX_STAMINA,Number(st)));
        if(eq)setEquipment(JSON.parse(eq));
        if(inv)setInventory(JSON.parse(inv));
      }catch{setScreen("create");}
  },[]);

  useEffect(()=>{
    if(!hero||!["main","map","battle","shop"].includes(screen)) return;
    localStorage.setItem("rpgv6_hero",JSON.stringify(hero));
    localStorage.setItem("rpgv6_stats",JSON.stringify(stats));
    localStorage.setItem("rpgv6_log",JSON.stringify(wlog));
    localStorage.setItem("rpgv6_gold",String(gold));
    localStorage.setItem("rpgv6_stamina",String(stamina));
    localStorage.setItem("rpgv6_equipment",JSON.stringify(equipment));
    localStorage.setItem("rpgv6_inventory",JSON.stringify(inventory));
  },[hero,stats,wlog,gold,stamina,equipment,inventory,screen]);

  function toast(msg,color,icon="⚡"){setNotif({msg,color,icon});setTimeout(()=>setNotif(null),3000);}

  function handleBuyItem(item) {
    if(gold < item.price){ toast("Oro insuficiente","#e74c3c","💰"); return; }
    const txp = totalXP(stats);
    const zoneUnlocked = ZONES[item.reqZone].unlockXP <= txp;
    if(!zoneUnlocked){ toast(`Requiere zona ${ZONES[item.reqZone].name}`,"#e74c3c","🔒"); return; }
    if(item.category==="potion"){
      const cur=inventory[item.id]||0;
      if(cur>=(item.maxStack||5)){ toast("Inventario lleno para esta poción","#e74c3c","⚠️"); return; }
      setInventory(inv=>({...inv,[item.id]:(inv[item.id]||0)+1}));
      setGold(g=>g-item.price);
      toast(`Compraste ${item.name}!`,  "#2ecc71","🧪");
    } else if(item.category==="perm"){
      const timesOwned = equipment.filter(id=>id===item.id).length;
      if(timesOwned>=(item.maxBuy||1)){ toast("Ya tienes el máximo de esta mejora","#e74c3c","⚠️"); return; }
      setEquipment(eq=>[...eq,item.id]);
      setGold(g=>g-item.price);
      toast(`¡${item.name} activado!`,"#9b59b6","📈");
    } else {
      // weapon/armor/access — only one per category
      const catItems = SHOP_ITEMS.filter(i=>i.category===item.category).map(i=>i.id);
      const newEq = equipment.filter(id=>!catItems.includes(id));
      newEq.push(item.id);
      setEquipment(newEq);
      setGold(g=>g-item.price);
      toast(`¡${item.name} equipado!`,"#f39c12","⚔️");
    }
  }

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
    const hs=heroStats(hero,stats,equipment);
    return <BattleScreen hero={hero} hStats={hs} zone={ZONES[battleZI]} stamina={stamina} inventory={inventory}
      onBack={()=>setScreen("main")}
      onReward={(xp,g,stat)=>{setStats(s=>({...s,[stat]:{xp:s[stat].xp+xp}}));setGold(prev=>prev+g);}}
      onStaminaUsed={cost=>setStamina(s=>Math.max(0,s-cost))}
      onUsePotion={(itemId)=>setInventory(inv=>({...inv,[itemId]:Math.max(0,(inv[itemId]||0)-1)}))}
    />;
  }
  if(screen==="workout") return <WorkoutScreen hero={hero} stats={stats}
    onFinish={(xpMap, dur)=>{
      setStats(s=>({
        fuerza:   {xp:s.fuerza.xp   +(xpMap.fuerza||0)},
        velocidad:{xp:s.velocidad.xp +(xpMap.velocidad||0)},
        vitalidad:{xp:s.vitalidad.xp +(xpMap.vitalidad||0)},
      }));
      const totalGained=Object.values(xpMap).reduce((a,v)=>a+v,0);
      setStamina(st=>Math.min(MAX_STAMINA,st+totalGained*STAMINA_PER_XP));
      // Log single entry
      const entry={id:Date.now(),stat:"fuerza",exercise:"Entrenamiento completo",
        amount:dur,xp:totalGained,stamina:Math.min(MAX_STAMINA-stamina,totalGained*STAMINA_PER_XP),
        date:new Date().toLocaleDateString("es-CO",{day:"2-digit",month:"short"}),
        time:new Date().toLocaleTimeString("es-CO",{hour:"2-digit",minute:"2-digit"}),
        note:`Fuerza:+${xpMap.fuerza||0} Velocidad:+${xpMap.velocidad||0} Vitalidad:+${xpMap.vitalidad||0}`};
      setWlog(p=>[entry,...p].slice(0,60));
    }}
    onBack={()=>setScreen("main")}/>;
  if(screen==="shop") return <ShopScreen gold={gold} equipment={equipment} inventory={inventory} stats={stats} shopCat={shopCat} setShopCat={setShopCat} onBuy={handleBuyItem} onBack={()=>setScreen("main")}/>;

  const cls=CLASSES.find(c=>c.id===hero.class)||CLASSES[0];
  const spec=cls.specs.find(s=>s.id===hero.specialization);
  const txp=totalXP(stats);
  const heroLv=Math.max(1,Math.round(Object.values(stats).reduce((a,s)=>a+getLevel(s.xp),0)/3));
  const hs=heroStats(hero,stats,equipment);
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

      {/* COMBAT + SHOP CTAs */}
      <div style={{maxWidth:480,margin:"12px auto 0",padding:"0 16px",display:"flex",gap:8}}>
        <button onClick={()=>setScreen("map")} style={{flex:3,padding:13,borderRadius:12,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${cls.color}cc,${cls.accent}cc)`,color:"#fff",fontWeight:800,fontSize:12,fontFamily:"'Courier New',monospace",letterSpacing:2,boxShadow:`0 4px 20px ${cls.color}44`,transition:"all 0.2s"}}>
          ⚔️ COMBATE
        </button>
        <button onClick={()=>setScreen("shop")} style={{flex:2,padding:13,borderRadius:12,cursor:"pointer",border:"1px solid #f39c1244",background:"#0e0820",color:"#f39c12",fontWeight:800,fontSize:12,fontFamily:"'Courier New',monospace",letterSpacing:1,transition:"all 0.2s"}}>
          🏪 TIENDA
        </button>
      </div>

      {/* TABS */}
      <div style={{borderBottom:"1px solid #1e1e3a",marginTop:12}}>
        <div style={{display:"flex",padding:"0 12px",gap:10,maxWidth:480,margin:"0 auto"}}>
          {[["hero","⚔ HÉROE"],["train","💪 ENTRENAR"],["stats","📊 STATS"],["log","📜 LOG"]].map(([t,l])=>(
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
                const pct=z.unlockXP===0?100:Math.min(100,(txp/z.unlockXP)*100);
                return(
                  <div key={z.id} style={{marginBottom:10,opacity:unlocked?1:0.6}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:14}}>{unlocked?"✅":txp>0&&txp<z.unlockXP?"🔄":"🔒"}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:unlocked?"#e8e0ff":"#4b5563",fontWeight:700}}>{z.emoji} {z.name}</div>
                        <div style={{fontSize:7,color:"#4b5563"}}>{z.desc}</div>
                      </div>
                      <div style={{fontSize:8,color:unlocked?cls.color:"#4b5563",fontWeight:800,whiteSpace:"nowrap"}}>{unlocked?"✓":`${txp}/${z.unlockXP}`}</div>
                    </div>
                    {!unlocked&&z.unlockXP>0&&(
                      <div style={{background:"#0a0a18",borderRadius:999,height:3,overflow:"hidden",marginLeft:22}}>
                        <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,#4834d4,#7c3aed)`,borderRadius:999}}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB TRAIN */}
        {tab==="train"&&(
          <div>
            {/* Big workout CTA */}
            <button onClick={()=>setScreen("workout")}
              style={{width:"100%",padding:20,borderRadius:14,cursor:"pointer",border:`2px solid ${cls.color}44`,background:`linear-gradient(135deg,${cls.color}18,#0e0820)`,color:"#fff",fontFamily:"'Courier New',monospace",marginBottom:14,textAlign:"left",transition:"all 0.2s",boxShadow:`0 4px 24px ${cls.color}22`}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:40}}>💪</div>
                <div>
                  <div style={{fontSize:16,fontWeight:800,color:cls.color,letterSpacing:1,marginBottom:4}}>INICIAR ENTRENAMIENTO</div>
                  <div style={{fontSize:10,color:"#9ca3af"}}>Sets × Reps × Peso · Timer de descanso · XP en tiempo real</div>
                  <div style={{fontSize:9,color:"#6b7280",marginTop:4}}>6 plantillas + rutina personalizada</div>
                </div>
              </div>
            </button>

            {/* Quick templates preview */}
            <div style={{fontSize:8,color:"#4b5563",letterSpacing:2,marginBottom:10}}>PLANTILLAS RÁPIDAS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {WORKOUT_TEMPLATES.map(tmpl=>(
                <button key={tmpl.id} onClick={()=>setScreen("workout")}
                  style={{padding:"12px 8px",borderRadius:10,cursor:"pointer",border:`1px solid ${tmpl.color}33`,background:`${tmpl.color}0a`,color:tmpl.color,fontFamily:"'Courier New',monospace",fontSize:9,fontWeight:800,textAlign:"center",transition:"all 0.15s",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <span style={{fontSize:20}}>{tmpl.icon}</span>
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>

            {/* Quick log — for manual entry */}
            <div style={{background:"#0e0e1c",border:"1px solid #1e1e3a",borderRadius:12,padding:14}}>
              <div style={{fontSize:8,color:"#4b5563",letterSpacing:2,marginBottom:10}}>REGISTRO RÁPIDO MANUAL</div>
              <div style={{display:"flex",gap:8,marginBottom:10}}>
                {Object.entries(STAT_CFG).map(([key,cfg])=>(
                  <button key={key} onClick={()=>setForm(f=>({...f,stat:key,exercise:""}))}
                    style={{flex:1,padding:"8px 4px",borderRadius:8,cursor:"pointer",border:`2px solid ${form.stat===key?cfg.color:"#1e1e3a"}`,background:form.stat===key?`${cfg.color}22`:"#060612",color:form.stat===key?cfg.color:"#4b5563",fontFamily:"'Courier New',monospace",fontSize:8,fontWeight:800,display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.15s"}}>
                    <span style={{fontSize:14}}>{cfg.icon}</span>{cfg.label.toUpperCase()}
                  </button>
                ))}
              </div>
              <select className="inp" value={form.exercise} onChange={e=>setForm(f=>({...f,exercise:e.target.value}))} style={{marginBottom:8}}>
                <option value="">-- Ejercicio --</option>
                {STAT_CFG[form.stat].exercises.map(ex=><option key={ex} value={ex}>{ex}</option>)}
                <option value="__otro">Otro...</option>
              </select>
              {form.exercise==="__otro"&&<input className="inp" style={{marginBottom:8}} placeholder="Ejercicio..." onChange={e=>setForm(f=>({...f,exercise:e.target.value}))}/>}
              <input className="inp" type="number" min="0" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder={`Cantidad (${STAT_CFG[form.stat].unit})`} style={{marginBottom:8}}/>
              <button onClick={handleLog} style={{width:"100%",padding:10,borderRadius:8,cursor:"pointer",border:"none",background:`linear-gradient(90deg,${STAT_CFG[form.stat].color},${STAT_CFG[form.stat].glow})`,color:"#fff",fontWeight:800,fontSize:11,fontFamily:"'Courier New',monospace",letterSpacing:1}}>
                ⚡ REGISTRAR
              </button>
            </div>
          </div>
        )}

        {/* TAB STATS — detailed statistics */}
        {tab==="stats"&&(()=>{
          // Calculate streak & best streak
          const today = new Date().toDateString();
          const daySet = new Set(wlog.map(e=>new Date(e.id).toDateString()));
          let streak=0, bestStreak=0, cur=0;
          const sorted=[...daySet].sort((a,b)=>new Date(a)-new Date(b));
          for(let i=0;i<sorted.length;i++){
            if(i===0){ cur=1; }
            else {
              const diff=(new Date(sorted[i])-new Date(sorted[i-1]))/(1000*60*60*24);
              if(diff<=1.5) cur++;
              else cur=1;
            }
            if(cur>bestStreak) bestStreak=cur;
          }
          // Check if today was trained
          streak = daySet.has(today) ? cur : (cur>0 && (new Date()-new Date(sorted[sorted.length-1]))/(1000*60*60*24)<1.5 ? cur : 0);
          const totalByStr = Object.entries(STAT_CFG).reduce((a,[k,cfg])=>({...a,[k]:wlog.filter(e=>e.stat===k).reduce((s,e)=>s+e.xp,0)}),{});
          const thisWeek = wlog.filter(e=>new Date()-new Date(e.id)<7*24*60*60*1000);
          const weekXP = thisWeek.reduce((a,e)=>a+e.xp,0);
          const weekDays = new Set(thisWeek.map(e=>new Date(e.id).toDateString())).size;
          // Last 14 days calendar
          const last14 = [...Array(14)].map((_,i)=>{
            const d=new Date(); d.setDate(d.getDate()-13+i);
            const ds=d.toDateString();
            const xpDay=wlog.filter(e=>new Date(e.id).toDateString()===ds).reduce((a,e)=>a+e.xp,0);
            return {ds,xpDay,day:d.toLocaleDateString("es",{weekday:"short"}).slice(0,2)};
          });
          return (
            <div>
              {/* Streak cards */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
                {[
                  {label:"RACHA ACTUAL",value:`${streak}d`,color:streak>0?"#f39c12":"#4b5563",icon:streak>0?"🔥":"💤"},
                  {label:"MEJOR RACHA", value:`${bestStreak}d`,color:"#9b59b6",icon:"🏆"},
                  {label:"DÍAS ACTIVOS",value:daySet.size,color:"#3498db",icon:"📅"},
                ].map(c=>(
                  <div key={c.label} style={{background:"#0e0e1c",border:`1px solid ${c.color}33`,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:20,marginBottom:4}}>{c.icon}</div>
                    <div style={{fontSize:18,fontWeight:800,color:c.color}}>{c.value}</div>
                    <div style={{fontSize:7,color:"#4b5563",letterSpacing:1,marginTop:2}}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* This week */}
              <div style={{background:"#0e0e1c",border:"1px solid #2d2060",borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{fontSize:8,color:"#7c3aed",letterSpacing:3,marginBottom:10}}>ESTA SEMANA</div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#e8e0ff"}}>{weekXP}</div>
                    <div style={{fontSize:7,color:"#4b5563"}}>XP GANADOS</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#e8e0ff"}}>{weekDays}</div>
                    <div style={{fontSize:7,color:"#4b5563"}}>DÍAS ENTRENADOS</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#e8e0ff"}}>{thisWeek.length}</div>
                    <div style={{fontSize:7,color:"#4b5563"}}>SESIONES</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:18,fontWeight:800,color:weekDays>=5?"#2ecc71":"#e74c3c"}}>{weekDays>=5?"✅":"⚠️"}</div>
                    <div style={{fontSize:7,color:"#4b5563"}}>META 5/7</div>
                  </div>
                </div>
                {/* Weekly progress bar */}
                <div style={{background:"#0a0a18",borderRadius:999,height:6,overflow:"hidden"}}>
                  <div style={{width:`${Math.min(100,(weekDays/5)*100)}%`,height:"100%",background:weekDays>=5?"linear-gradient(90deg,#27ae60,#2ecc71)":"linear-gradient(90deg,#e67e22,#f39c12)",borderRadius:999,transition:"width 0.5s"}}/>
                </div>
                <div style={{fontSize:7,color:"#4b5563",marginTop:3,textAlign:"right"}}>{weekDays}/5 días para meta semanal</div>
              </div>

              {/* Last 14 days calendar */}
              <div style={{background:"#0e0e1c",border:"1px solid #1e1e3a",borderRadius:12,padding:14,marginBottom:12}}>
                <div style={{fontSize:8,color:"#7c3aed",letterSpacing:3,marginBottom:10}}>ÚLTIMAS 2 SEMANAS</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
                  {last14.map((d,i)=>{
                    const intensity = d.xpDay===0?0:d.xpDay<50?1:d.xpDay<100?2:d.xpDay<150?3:4;
                    const colors=["#0a0a18","#1a3a1a","#2a6a2a","#3aaa3a","#2ecc71"];
                    return(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                        <div style={{width:"100%",aspectRatio:"1",borderRadius:4,background:colors[intensity],border:`1px solid ${intensity>0?"#2ecc7122":"#1a1a2a"}`,title:d.ds}}/>
                        <div style={{fontSize:6,color:"#4b5563"}}>{d.day}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{display:"flex",gap:6,marginTop:8,alignItems:"center"}}>
                  <span style={{fontSize:7,color:"#4b5563"}}>Menos</span>
                  {["#0a0a18","#1a3a1a","#2a6a2a","#3aaa3a","#2ecc71"].map((c,i)=>(
                    <div key={i} style={{width:10,height:10,borderRadius:2,background:c,border:"1px solid #1a1a2a"}}/>
                  ))}
                  <span style={{fontSize:7,color:"#4b5563"}}>Más</span>
                </div>
              </div>

              {/* XP by stat */}
              <div style={{background:"#0e0e1c",border:"1px solid #1e1e3a",borderRadius:12,padding:14}}>
                <div style={{fontSize:8,color:"#7c3aed",letterSpacing:3,marginBottom:10}}>XP TOTAL POR STAT</div>
                {Object.entries(STAT_CFG).map(([key,cfg])=>{
                  const xpSt=totalByStr[key]||0;
                  const maxSt=Math.max(...Object.values(totalByStr),1);
                  return(
                    <div key={key} style={{marginBottom:10}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:10,color:cfg.color,fontWeight:800}}>{cfg.icon} {cfg.label}</span>
                        <span style={{fontSize:9,color:"#6b7280"}}>{xpSt} XP · LV.{getLevel(stats[key].xp)}</span>
                      </div>
                      <div style={{background:"#0a0a18",borderRadius:999,height:8,overflow:"hidden",border:`1px solid ${cfg.color}18`}}>
                        <div style={{width:`${(xpSt/maxSt)*100}%`,height:"100%",borderRadius:999,background:`linear-gradient(90deg,${cfg.color},${cfg.glow})`,transition:"width 0.7s",boxShadow:`0 0 6px ${cfg.color}55`}}/>
                      </div>
                      <div style={{fontSize:7,color:"#4b5563",marginTop:2}}>
                        {wlog.filter(e=>e.stat===key).length} sesiones · Último: {wlog.find(e=>e.stat===key)?.date||"—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

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
