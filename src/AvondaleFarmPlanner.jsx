import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";

// ─── Color Palette ───
const C = {
  bg: "#1a1f16", bgCard: "#232b1e", bgHover: "#2a3424",
  border: "#3a4a30", borderLight: "#4a5a40",
  text: "#e8ead3", textMuted: "#9aaa80", textDim: "#6a7a5a",
  accent: "#8fbf4a", accentDark: "#5a8a2a", accentGlow: "#a4d65a",
  water: "#4a8ab5", waterDim: "#2a5a7a",
  soil: "#8a6a3a", soilLight: "#a88a5a",
  hugel: "#6a5a3a", raised: "#5a7a3a", raisedBed: "#4a6a4a",
  dehydrator: "#9a7a4a", greenhouse: "#3a7a5a",
  warn: "#d4a44a", danger: "#c45a4a",
  spring: "#7abf4a", summer: "#d4a44a", fall: "#c47a3a", winter: "#6a8aaa",
  low: "#5a8a5a", med: "#b89a3a", high: "#c45a3a",
  infra: "#8a7a5a", land: "#2a3a20",
};

const VB = { w: 1200, h: 500 };

// ─── Area Data ───
const AREAS = [
  {
    id: "garden2", name: "Home Garden", acres: 1.1, sqft: 47700,
    desc: "Primary annual vegetable garden with raised rows, hügelkultur beds, greenhouses, and solar dehydrators.",
    systems: ["Buffer & Mounds", "Fertilizer & Soil Amendment"],
    generalCare: [
      { action: "Weed", season: "Spring–Fall", freq: "Bi-weekly", notes: "Hand pull between rows; mulch heavily to suppress" },
      { action: "Nutrient", season: "Spring", freq: "Annual", notes: "Apply amendments per LLHLLM / MLHMMM / HMHMHH codes" },
      { action: "Mulch", season: "Spring", freq: "Annual + touch-up", notes: "3-4\" wood chip mulch on all beds and paths" },
      { action: "Water", season: "Summer", freq: "As needed", notes: "Deep infrequent watering; check irrigation lines" },
      { action: "Soil Test", season: "Fall", freq: "Annual", notes: "pH, NPK, micronutrients after harvest" },
    ],
  },
  {
    id: "a2native", name: "A2 — Native Garden", acres: 0.3, sqft: 13000,
    desc: "Native food forest: elderberry, crabapple, serviceberry guild with understory cranberry, artichoke, nettle.",
    systems: ["Buffer & Mounds", "Fertilizer & Soil Amendment"],
    generalCare: [
      { action: "Weed", season: "Spring–Fall", freq: "Monthly", notes: "Hand pull mugwort, grass runners, woody seedlings" },
      { action: "Prune", season: "Late Winter", freq: "Annual", notes: "Structural pruning crabapple; maintenance on serviceberry" },
      { action: "Mulch", season: "Spring", freq: "Annual", notes: "Refresh 3-4\" cubed mulch rings around all plants" },
      { action: "Protect", season: "Spring", freq: "Annual check", notes: "Trunk guards & cages for deer/rabbit browse" },
      { action: "Water", season: "Summer", freq: "Infrequent deep soak", notes: "Prioritize transplants and shallow-rooted cranberry" },
      { action: "Harvest", season: "Fall", freq: "Once", notes: "Jerusalem artichoke tubers after first frost" },
    ],
  },
  {
    id: "infrastructure", name: "Infrastructure Zone", acres: 0.15, sqft: 6500,
    desc: "Composting, biochar, fermentation, and soil amendment systems adjacent to garden plots.",
    systems: ["Composting", "Fertilizer & Soil Amendment", "Greenhouse & Season Extension"],
    generalCare: [
      { action: "Compost", season: "Year-round", freq: "18-day cycles", notes: "Berkeley hot compost method" },
      { action: "Biochar", season: "Spring–Fall", freq: "As available", notes: "Pyrolysis → quench → charge with compost tea" },
      { action: "KNF FPJ", season: "Spring–Fall", freq: "Seasonal batches", notes: "Tips → brown sugar → 7-10 day ferment → dilute 1:1000" },
      { action: "Nettle Tea", season: "Spring–Fall", freq: "Monthly", notes: "Steep 2-4 weeks → dilute 10:1 → foliar feed" },
    ],
  },
];

// ─── Plot Data ───
const PLOTS = [
  { id: "g2rr1", area: "garden2", name: "Beans + Root Intercrops", type: "Raised Row", sqft: 160, status: "Done", color: C.raised, nutrientCode: "LLHLLM", soil: "Loamy/Light" },
  { id: "g2rr3", area: "garden2", name: "Potatoes", type: "Raised Row", sqft: 140, status: "Planned", color: C.raised, nutrientCode: "MLHLLM", soil: "Loamy/Light" },
  { id: "g2rr4", area: "garden2", name: "Carrots + Mustard", type: "Raised Row", sqft: 100, status: "Planned", color: C.raised, nutrientCode: "LLHLLM", soil: "Light/Sandy" },
  { id: "g2rr2", area: "garden2", name: "Garlic + Onions", type: "Raised Row", sqft: 100, status: "Done", color: C.raised, nutrientCode: "MLHMMM", soil: "Loamy/Light" },
  { id: "g2rr5", area: "garden2", name: "Beets + Mustard", type: "Raised Row", sqft: 100, status: "Planned", color: C.raised, nutrientCode: "MLHLMM", soil: "Loamy/Rich" },
  { id: "g2rr6", area: "garden2", name: "Spinach + Lettuce", type: "Raised Bed", sqft: 80, status: "Planned", color: C.raisedBed, nutrientCode: "MLHLMH", soil: "Rich/Organic" },
  { id: "g2hb2", area: "garden2", name: "Kale + Chard + Broccoli", type: "Hügelkultur", sqft: 90, status: "Planned", color: C.hugel, nutrientCode: "HMHMHH", soil: "Rich/Organic" },
  { id: "g2hb1", area: "garden2", name: "Winter Squash", type: "Hügelkultur", sqft: 100, status: "Planned", color: C.hugel, nutrientCode: "HMHMHH", soil: "Loamy/Rich" },
  { id: "g2hb3", area: "garden2", name: "Hügel Reserve", type: "Hügelkultur", sqft: 80, status: "Planned", color: C.hugel },
  { id: "g2gh1", area: "garden2", name: "Greenhouse 1", type: "Structure", sqft: 200, status: "Planned", color: C.greenhouse },
  { id: "g2gh2", area: "garden2", name: "Greenhouse 2", type: "Structure", sqft: 200, status: "Planned", color: C.greenhouse },
  { id: "g2sd1", area: "garden2", name: "Solar Dehydrator 1", type: "Equipment", sqft: 16, status: "Planned", color: C.dehydrator },
  { id: "g2sd2", area: "garden2", name: "Solar Dehydrator 2", type: "Equipment", sqft: 16, status: "Planned", color: C.dehydrator },
  { id: "a2a", area: "a2native", name: "A2A: Native Bed 1", type: "Food Forest", sqft: 200, status: "Established", color: "#4a6a3a", soil: "Native + biochar, mycorrhizae" },
];

// ─── SVG Map Layout (coordinates in ViewBox space) ───
// Derived from draw.io layout: Home Garden group at (-595,442), Native Garden plants at (-62,629)
const ML = {
  // Area boundaries
  gardenBounds: { x: 80, y: 105, w: 300, h: 290 },
  nativeBounds: { x: 560, y: 325, w: 340, h: 165 },
  infraBounds:  { x: 85, y: 215, w: 82, h: 175 },
  // Full-width crop rows
  beans:    { x: 90, y: 120, w: 280, h: 35 },
  potatoes: { x: 90, y: 162, w: 280, h: 35 },
  // Left crop column (right of infrastructure)
  carrots:  { x: 172, y: 215, w: 98, h: 30 },
  kale:     { x: 172, y: 250, w: 98, h: 35 },
  squash:   { x: 172, y: 290, w: 98, h: 35 },
  hugelRes: { x: 172, y: 330, w: 98, h: 30 },
  // Right crop column — GH at top, then crops descending
  gh1:      { x: 275, y: 215, w: 46, h: 30 },
  gh2:      { x: 325, y: 215, w: 46, h: 30 },
  garlic:   { x: 275, y: 250, w: 95, h: 30 },
  spinach:  { x: 275, y: 285, w: 95, h: 35 },
  beets:    { x: 275, y: 325, w: 95, h: 35 },
  // Solar dehydrators (tiny icons, below greenhouses)
  sd1:      { x: 280, y: 367, w: 16, h: 14 },
  sd2:      { x: 300, y: 367, w: 16, h: 14 },
};

// Plot ID → map position lookup
const PLOT_POS = {
  g2rr1: ML.beans, g2rr3: ML.potatoes,
  g2rr4: ML.carrots, g2rr2: ML.garlic,
  g2hb2: ML.kale, g2rr6: ML.spinach,
  g2hb1: ML.squash, g2rr5: ML.beets,
  g2hb3: ML.hugelRes,
  g2gh1: ML.gh1, g2gh2: ML.gh2,
  g2sd1: ML.sd1, g2sd2: ML.sd2,
};

// Infrastructure sub-zones
const INFRA_ZONES = [
  { id: "compost", label: "Compost", x: 88, y: 220, w: 36, h: 30, color: C.soil },
  { id: "biochar", label: "Biochar", x: 128, y: 220, w: 36, h: 30, color: C.danger },
  { id: "knf", label: "KNF", x: 88, y: 255, w: 36, h: 28, color: C.spring },
  { id: "nettle", label: "Nettle Tea", x: 128, y: 255, w: 36, h: 28, color: C.spring },
  { id: "ghheat", label: "GH Heat", x: 88, y: 288, w: 76, h: 28, color: C.accentDark },
];

// ─── A2 Native Garden: Individual Plant Markers ───
// From draw.io: 3 rows of plants in 120x60 space at (x=-62,y=629)
// Row 1 (y=0): Elderberry(0), Crabapple(40), Serviceberry(90)
// Row 2 (y=20): Cranberry(4), Cranberry(37), Cranberry(63), Serviceberry(90)
// Row 3 (y=40): Nettle(0), J.Artichoke(30), Camas(60), Serviceberry(90)
const A2_MARKERS = [
  { id: "m-elder",  plantId: "elderberry",   x: 585, y: 345, label: "Elderberry",     icon: "tree" },
  { id: "m-crab",   plantId: "crabapple",    x: 655, y: 340, label: "Crabapple",      icon: "tree" },
  { id: "m-serv1",  plantId: "serviceberry", x: 745, y: 338, label: "Serviceberry",   icon: "shrub" },
  { id: "m-cran1",  plantId: "cranberry",    x: 590, y: 390, label: "Cranberry",       icon: "berry" },
  { id: "m-cran2",  plantId: "cranberry",    x: 645, y: 388, label: "Cranberry",       icon: "berry" },
  { id: "m-cran3",  plantId: "cranberry",    x: 700, y: 392, label: "Cranberry",       icon: "berry" },
  { id: "m-serv2",  plantId: "serviceberry", x: 755, y: 385, label: "Serviceberry",   icon: "shrub" },
  { id: "m-nettle", plantId: "nettle",       x: 585, y: 435, label: "Nettle",          icon: "herb" },
  { id: "m-artic",  plantId: "artichoke",    x: 640, y: 432, label: "J. Artichoke",    icon: "herb" },
  { id: "m-camas",  plantId: null,           x: 700, y: 438, label: "Camas",           icon: "herb" },
  { id: "m-serv3",  plantId: "serviceberry", x: 760, y: 430, label: "Serviceberry",   icon: "shrub" },
  // Comfrey markers (C)
  { id: "m-comf1",  plantId: null,           x: 620, y: 365, label: "Comfrey",         icon: "C" },
  { id: "m-comf2",  plantId: null,           x: 725, y: 360, label: "Comfrey",         icon: "C" },
  { id: "m-comf3",  plantId: null,           x: 670, y: 415, label: "Comfrey",         icon: "C" },
  { id: "m-comf4",  plantId: null,           x: 790, y: 410, label: "Comfrey",         icon: "C" },
];

const METHODS = {
  garden2: [
    { name: "Raised Row Planting", system: "Buffer & Mounds", tasks: 40, hours: 48 },
    { name: "Hügelkultur Planting", system: "Buffer & Mounds", tasks: 19, hours: 28 },
    { name: "Solar Dehydrator", system: "Processing & Preservation", tasks: 7, hours: 7 },
    { name: "Hot Composting (Berkeley)", system: "Fertilizer & Soil Amendment", tasks: 8, hours: 12 },
    { name: "Biochar + Compost", system: "Fertilizer & Soil Amendment", tasks: 7, hours: 11 },
    { name: "KNF FPJ", system: "Fertilizer & Soil Amendment", tasks: 7, hours: 4 },
    { name: "Nettle Tea", system: "Fertilizer & Soil Amendment", tasks: 6, hours: 4 },
  ],
  a2native: [
    { name: "Native Garden Establishment", system: "Buffer & Mounds", tasks: 17, hours: 28 },
    { name: "Comfrey Chop & Drop", system: "Fertilizer & Soil Amendment", tasks: 6, hours: 7 },
  ],
  infrastructure: [
    { name: "Compost Heated Greenhouse", system: "Greenhouse & Season Extension", tasks: 8, hours: 24 },
    { name: "Hügelkultur Bed Construction", system: "Buffer & Mounds", tasks: 5, hours: 10 },
  ],
};

const NUTRIENTS = ["Alfalfa Meal", "Basalt/Lava Rock", "Alpaca Compost", "Bone Char", "Ferm. Bladderwrack", "Chip Mulch"];
const LEVEL_COLORS = { L: C.low, M: C.med, H: C.high };
const LEVEL_LABELS = { L: "Low", M: "Medium", H: "High" };
const SEASON_COLORS = { Spring: C.spring, Summer: C.summer, Fall: C.fall, Winter: C.winter };
const ACTION_ICONS = {
  Sow: "\u{1F331}", Harvest: "\u{1F9FA}", Prune: "\u2702\uFE0F", Weed: "\u{1F33F}",
  Water: "\u{1F4A7}", Nutrient: "\u{1F9EA}", Protect: "\u{1F6E1}\uFE0F",
  Compost: "\u267B\uFE0F", Biochar: "\u{1F525}", "KNF FPJ": "\u{1F9EB}",
  "Nettle Tea": "\u{1F375}", "Soil Test": "\u{1F52C}", Mulch: "\u{1FAB5}",
};

// ─── Plant Data ───
const PLANTS = [
  { id: "carrots", name: "Carrots", plot: "g2rr4", type: "Annual", count: "~50 plants", spacing: "2\" apart", depth: "\u00BC\" deep",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Direct sow after soil warms to 45\u00B0F. Light/sandy soil. Succession sow every 3 weeks." },
      { season: "Spring", action: "Weed", notes: "Hand weed carefully \u2014 carrots are slow to establish." },
      { season: "Spring", action: "Nutrient", notes: "LLHLLM: Low Alfalfa, Low Basalt, High Alpaca Compost, Low Bone Char, Low Bladderwrack, Med Mulch" },
      { season: "Summer", action: "Water", notes: "Consistent moisture for straight roots. 1\" per week." },
      { season: "Fall", action: "Harvest", notes: "Pull when shoulders are \u00BD-\u00BE\" diameter. Can leave in ground with heavy mulch." },
    ]},
  { id: "mustard_c", name: "Mustard (companion)", plot: "g2rr4", type: "Companion", count: "Interplanted",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Broadcast between carrot rows as pest deterrent." },
      { season: "Summer", action: "Prune", notes: "Trim if shading carrots. Let some flower for beneficials." },
    ]},
  { id: "potatoes", name: "Potatoes", plot: "g2rr3", type: "Annual", count: "~25 seed potatoes", spacing: "12\" apart", depth: "4\" deep",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Plant seed potatoes after last frost. Cut large ones to 2-3 eyes." },
      { season: "Spring", action: "Nutrient", notes: "MLHLLM: Med Alfalfa, Low Basalt, High Alpaca Compost, Low Bone Char, Low Bladderwrack, Med Mulch" },
      { season: "Spring", action: "Weed", notes: "Hill soil around stems as they grow \u2014 2-3 hillings." },
      { season: "Summer", action: "Water", notes: "1-2\" per week. Critical during flowering (tuber formation)." },
      { season: "Fall", action: "Harvest", notes: "Dig 2-3 weeks after vines die back. Cure in dark 1-2 weeks." },
    ]},
  { id: "beans", name: "Pole Beans + Root Intercrops", plot: "g2rr1", type: "Annual", count: "~40 plants", spacing: "6\" apart",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Direct sow after all frost danger. Soil temp 60\u00B0F+. Install trellis first." },
      { season: "Spring", action: "Nutrient", notes: "LLHLLM: Low amendments \u2014 beans fix their own nitrogen." },
      { season: "Summer", action: "Water", notes: "1\" per week. Water at base, not foliage." },
      { season: "Summer", action: "Harvest", notes: "Pick every 2-3 days for snap beans; leave for dry beans." },
      { season: "Fall", action: "Harvest", notes: "Dry beans: leave pods on vine until brown. Shell and store." },
    ]},
  { id: "garlic", name: "Garlic", plot: "g2rr2", type: "Annual", count: "~25 cloves", spacing: "6\" apart",
    maintenance: [
      { season: "Spring", action: "Weed", notes: "Keep weed-free \u2014 garlic is a poor competitor." },
      { season: "Spring", action: "Nutrient", notes: "MLHMMM: Med Alfalfa, Low Basalt, High Alpaca Compost, Med Bone Char, Med Bladderwrack, Med Mulch" },
      { season: "Spring", action: "Prune", notes: "Cut scapes when they curl (hardneck) \u2014 eat or ferment them." },
      { season: "Summer", action: "Harvest", notes: "When lower 3-4 leaves brown. Cure in shade 2-4 weeks." },
    ]},
  { id: "onions", name: "Onions", plot: "g2rr2", type: "Annual", count: "~30 sets", spacing: "4\" apart",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Plant sets or transplants early spring. Long-day varieties." },
      { season: "Summer", action: "Water", notes: "Consistent moisture until tops start to fall over." },
      { season: "Summer", action: "Harvest", notes: "When 50%+ tops fall over, stop water, pull in 1-2 weeks." },
    ]},
  { id: "beets", name: "Beets", plot: "g2rr5", type: "Annual", count: "~40 plants", spacing: "3-4\" apart",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Direct sow 2-4 weeks before last frost. Soak seeds overnight." },
      { season: "Spring", action: "Nutrient", notes: "MLHLMM: Med Alfalfa, Low Basalt, High Alpaca Compost, Low Bone Char, Med Bladderwrack, Med Mulch" },
      { season: "Summer", action: "Water", notes: "Consistent moisture. Uneven water = woody rings." },
      { season: "Fall", action: "Harvest", notes: "Twist off greens 1\" above root. Store in sand or refrigerate." },
    ]},
  { id: "mustard_b", name: "Mustard (companion)", plot: "g2rr5", type: "Companion", count: "Interplanted",
    maintenance: [{ season: "Spring", action: "Sow", notes: "Interplant as biofumigant and pest deterrent." }] },
  { id: "squash", name: "Winter Squash (trellised)", plot: "g2hb1", type: "Annual", count: "3 mounds",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Direct sow after last frost. H\u00FCgel bed provides heat & moisture." },
      { season: "Spring", action: "Nutrient", notes: "HMHMHH: Heaviest feeders \u2014 full h\u00FCgel amendment suite." },
      { season: "Summer", action: "Water", notes: "Deep water weekly. H\u00FCgel bed retains moisture well." },
      { season: "Summer", action: "Prune", notes: "Train vines up trellis. Use slings for heavy fruit." },
      { season: "Fall", action: "Harvest", notes: "When stem is dry/corky. Cure 2 weeks in sun. Store cool & dry." },
    ]},
  { id: "kale", name: "Kale", plot: "g2hb2", type: "Annual/Biennial", count: "6 transplants", spacing: "18\" apart",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Transplant after last frost into h\u00FCgelkultur bed." },
      { season: "Spring", action: "Nutrient", notes: "HMHMHH: Heavy feeder \u2014 full h\u00FCgel amendment suite." },
      { season: "Summer", action: "Harvest", notes: "Pick lower leaves, leaving growing tip." },
      { season: "Fall", action: "Harvest", notes: "Continues through frost. Row cover to extend into winter." },
    ]},
  { id: "chard", name: "Swiss Chard", plot: "g2hb2", type: "Annual/Biennial", count: "6 transplants",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Succession plant every 3 weeks." },
      { season: "Summer", action: "Harvest", notes: "Cut-and-come-again outer leaves. Leave center 4-5 leaves." },
      { season: "Summer", action: "Water", notes: "Regular water prevents bolting." },
    ]},
  { id: "broccoli", name: "Broccoli", plot: "g2hb2", type: "Annual", count: "4 transplants",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Transplant 2-4 weeks before last frost. Needs cool temps." },
      { season: "Summer", action: "Harvest", notes: "Cut main head when tight. Side shoots continue for weeks." },
    ]},
  { id: "spinach", name: "Spinach", plot: "g2rr6", type: "Annual", count: "~30 plants",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Direct sow as soon as soil can be worked. Succession every 2 weeks." },
      { season: "Spring", action: "Nutrient", notes: "MLHLMH: Med Alfalfa, Low Basalt, High Alpaca Compost, Low Bone Char, Med Bladderwrack, High Mulch" },
      { season: "Spring", action: "Harvest", notes: "Baby leaves at 3-4 weeks; full size 6-8 weeks." },
      { season: "Summer", action: "Water", notes: "Shade cloth once temps hit 75\u00B0F. Bolts in heat." },
      { season: "Fall", action: "Sow", notes: "Fall succession: sow 6-8 weeks before first frost." },
    ]},
  { id: "lettuce", name: "Lettuce", plot: "g2rr6", type: "Annual", count: "~20 plants",
    maintenance: [
      { season: "Spring", action: "Sow", notes: "Interplant with spinach. Needs light to germinate." },
      { season: "Summer", action: "Water", notes: "Keep consistently moist. Shade cloth in heat." },
      { season: "Summer", action: "Harvest", notes: "Cut-and-come-again or harvest full heads." },
      { season: "Fall", action: "Sow", notes: "Fall crop under cold frame or row cover." },
    ]},
  // ── A2 Native Garden Plants ──
  { id: "elderberry", name: "Elderberry", plot: "a2a", type: "Perennial Shrub", count: "1 plant",
    maintenance: [
      { season: "Spring", action: "Prune", notes: "Remove dead/damaged canes. Thin oldest 3+ year canes." },
      { season: "Spring", action: "Weed", notes: "Clear 3ft radius. Refresh mulch ring." },
      { season: "Spring", action: "Nutrient", notes: "Top-dress with compost and FPJ foliar spray." },
      { season: "Summer", action: "Water", notes: "Deep soak during dry spells." },
      { season: "Summer", action: "Harvest", notes: "Berries when deep purple-black. Process same day." },
      { season: "Winter", action: "Prune", notes: "Major structural pruning while dormant." },
    ]},
  { id: "crabapple", name: "Crabapple", plot: "a2a", type: "Perennial Tree", count: "1 tree",
    maintenance: [
      { season: "Spring", action: "Prune", notes: "Remove suckers, watersprouts, broken/rubbing/crossing branches." },
      { season: "Spring", action: "Weed", notes: "Clear mulch ring. Watch for root suckers." },
      { season: "Summer", action: "Water", notes: "Infrequent deep soak if drought stressed." },
      { season: "Fall", action: "Harvest", notes: "Crabapples for jelly, cider, fermentation." },
      { season: "Winter", action: "Prune", notes: "Major structural pruning while fully dormant." },
      { season: "Winter", action: "Protect", notes: "Check trunk guard/cage integrity for winter browse." },
    ]},
  { id: "serviceberry", name: "Serviceberry (3x)", plot: "a2a", type: "Perennial Shrub/Tree", count: "3 plants",
    maintenance: [
      { season: "Spring", action: "Prune", notes: "Light only \u2014 remove dead/broken. Preserve natural form." },
      { season: "Spring", action: "Weed", notes: "Clear mulch rings around all 3." },
      { season: "Summer", action: "Harvest", notes: "Berries when deep purple, June-July. Net if needed." },
      { season: "Summer", action: "Water", notes: "Deep soak during extended dry periods." },
    ]},
  { id: "cranberry", name: "American Cranberry (3x)", plot: "a2a", type: "Perennial Shrub", count: "3 plants",
    maintenance: [
      { season: "Spring", action: "Weed", notes: "Careful weeding \u2014 shallow roots. Hand pull only." },
      { season: "Spring", action: "Nutrient", notes: "Acidic mulch (pine needles). Needs acid soil pH 4.5-5.5." },
      { season: "Summer", action: "Water", notes: "Consistent moisture. Native to bogs \u2014 doesn\u2019t tolerate drought." },
      { season: "Fall", action: "Harvest", notes: "Berries when fully red. Dry harvest. Oct-Nov." },
    ]},
  { id: "artichoke", name: "Jerusalem Artichoke", plot: "a2a", type: "Perennial", count: "1 clump",
    maintenance: [
      { season: "Spring", action: "Weed", notes: "Manage spread \u2014 vigorous. May need containment." },
      { season: "Summer", action: "Water", notes: "Drought-tolerant once established. Grows 6-10ft." },
      { season: "Fall", action: "Harvest", notes: "Dig tubers after first frost kills tops. Leave some for next year." },
      { season: "Winter", action: "Harvest", notes: "Can dig all winter if ground isn\u2019t frozen. Sweetest after cold." },
    ]},
  { id: "nettle", name: "Stinging Nettle", plot: "a2a", type: "Perennial", count: "1 clump",
    maintenance: [
      { season: "Spring", action: "Harvest", notes: "Harvest tops before flowering for tea fertilizer & eating. GLOVES." },
      { season: "Spring", action: "Weed", notes: "Manage spread \u2014 can be aggressive. Define boundary." },
      { season: "Summer", action: "Harvest", notes: "2nd and 3rd cuts for fertilizer tea production." },
      { season: "Fall", action: "Prune", notes: "Cut back dead stems. Mulch crown for winter." },
    ]},
];

// ─── Helper Components ───
const Badge = ({ children, color = C.accent, small = false }) => (
  <span style={{ display: "inline-block", padding: small ? "1px 6px" : "2px 10px", borderRadius: 12,
    fontSize: small ? 10 : 11, fontWeight: 600, background: color + "22", color,
    border: `1px solid ${color}44`, letterSpacing: 0.3 }}>{children}</span>
);

const NutrientBar = ({ code }) => {
  if (!code) return null;
  return (
    <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
      {code.split("").map((l, i) => (
        <div key={i} title={`${NUTRIENTS[i]}: ${LEVEL_LABELS[l]}`}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: LEVEL_COLORS[l], opacity: 0.85,
            border: `1px solid ${LEVEL_COLORS[l]}88` }} />
          <span style={{ fontSize: 8, color: C.textDim }}>{NUTRIENTS[i].split(" ")[0].slice(0,3)}</span>
        </div>
      ))}
    </div>
  );
};

const SeasonTag = ({ season }) => {
  const s = season.split("\u2013")[0].split("/")[0].trim();
  return <Badge color={SEASON_COLORS[s] || C.textMuted} small>{season}</Badge>;
};

const PlantCard = ({ plant, onSelect }) => (
  <div onClick={() => onSelect(plant)} style={{ padding: "10px 12px", background: C.bgCard,
    border: `1px solid ${C.border}`, borderRadius: 8, cursor: "pointer", marginBottom: 6 }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.background = C.bgHover; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.bgCard; }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>{plant.name}</span>
      <Badge color={plant.type.includes("Perennial") ? C.spring : C.summer} small>{plant.type}</Badge>
    </div>
    {plant.count && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{plant.count}{plant.spacing ? ` \u00B7 ${plant.spacing}` : ""}</div>}
  </div>
);

const MaintenanceMatrix = ({ plant }) => {
  const seasons = ["Spring", "Summer", "Fall", "Winter"];
  const actions = [...new Set(plant.maintenance.map(m => m.action))];
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase" }}>Maintenance Calendar</div>
      <div style={{ display: "grid", gridTemplateColumns: `90px repeat(${seasons.length}, 1fr)`, gap: 2 }}>
        <div />
        {seasons.map(s => (
          <div key={s} style={{ padding: "4px 6px", textAlign: "center", fontSize: 10, fontWeight: 700,
            color: SEASON_COLORS[s], background: SEASON_COLORS[s] + "15", borderRadius: 4 }}>{s}</div>
        ))}
        {actions.map(action => (
          <React.Fragment key={action}>
            <div style={{ padding: "6px 4px", fontSize: 11, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 4 }}>
              <span>{ACTION_ICONS[action] || "\u00B7"}</span>{action}
            </div>
            {seasons.map(season => {
              const match = plant.maintenance.find(m => m.season.includes(season) && m.action === action);
              return (
                <div key={season} style={{ padding: 4, fontSize: 10, color: match ? C.text : C.textDim + "44",
                  background: match ? SEASON_COLORS[season] + "12" : "transparent", borderRadius: 4, lineHeight: 1.35,
                  border: match ? `1px solid ${SEASON_COLORS[season]}22` : "1px solid transparent" }}
                  title={match?.notes || ""}>
                  {match ? <span style={{ cursor: "help" }}>{match.notes.length > 60 ? match.notes.slice(0, 57) + "..." : match.notes}</span> : "\u2014"}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Plant Marker for A2 ───
const PlantMarker = ({ marker, active, onClick, onHover, onLeave }) => {
  const r = marker.icon === "tree" ? 10 : marker.icon === "shrub" ? 8 : marker.icon === "C" ? 7 : 6;
  const fill = marker.icon === "tree" ? "#3a6a2a" : marker.icon === "shrub" ? "#4a7a3a" :
    marker.icon === "C" ? C.accent + "66" : marker.icon === "berry" ? "#6a3a5a" : "#5a7a4a";
  return (
    <g onClick={e => { e.stopPropagation(); onClick(); }} onMouseEnter={onHover} onMouseLeave={onLeave}
      style={{ cursor: marker.plantId ? "pointer" : "default" }}>
      {marker.icon === "tree" && <>
        <rect x={marker.x - 1.5} y={marker.y + 4} width={3} height={8} fill="#5a4a2a" rx={1} />
        <circle cx={marker.x} cy={marker.y} r={r} fill={fill} stroke={active ? C.accentGlow : fill} strokeWidth={active ? 2 : 0.5} opacity={0.9} />
      </>}
      {marker.icon === "shrub" && <ellipse cx={marker.x} cy={marker.y} rx={r} ry={r * 0.7} fill={fill}
        stroke={active ? C.accentGlow : fill} strokeWidth={active ? 2 : 0.5} opacity={0.85} />}
      {marker.icon === "berry" && <circle cx={marker.x} cy={marker.y} r={r} fill={fill}
        stroke={active ? C.accentGlow : "#8a4a6a"} strokeWidth={active ? 2 : 0.5} opacity={0.85} />}
      {marker.icon === "herb" && <circle cx={marker.x} cy={marker.y} r={r} fill={fill}
        stroke={active ? C.accentGlow : fill} strokeWidth={active ? 2 : 0.5} opacity={0.8} />}
      {marker.icon === "C" && <>
        <circle cx={marker.x} cy={marker.y} r={r} fill={fill} stroke={C.accent} strokeWidth={0.5} />
        <text x={marker.x} y={marker.y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={C.text}>C</text>
      </>}
      <text x={marker.x} y={marker.y + r + 10} textAnchor="middle" fontSize={6.5} fill={C.textMuted} fontWeight={500}>{marker.label}</text>
    </g>
  );
};

// ─── Main App ───
export default function AvondaleFarmPlanner() {
  const [vb, setVb] = useState({ x: 0, y: 0, w: VB.w, h: VB.h });
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [view, setView] = useState("map");
  const [selectedInfraZone, setSelectedInfraZone] = useState(null);
  const [bottomTab, setBottomTab] = useState("areas");
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ─── Airtable Live Data ───
  const [atTasks, setAtTasks] = useState([]);
  const [atMethods, setAtMethods] = useState([]);
  const [atAreas, setAtAreas] = useState([]);
  const [atPlots, setAtPlots] = useState([]);
  const [atPlantsDB, setAtPlants] = useState([]);
  const AT_TOKEN = "patUuQy8MfVOozGRe.59276185b53c5d0d191809b719b546db0032e455a25d5b58e2a88ddd8a034310";
  const [atLoading, setAtLoading] = useState(false);
  const [atError, setAtError] = useState(null);

  const fetchAirtable = useCallback(async () => {
    setAtLoading(true); setAtError(null);
    const headers = { Authorization: `Bearer ${AT_TOKEN}`, "Content-Type": "application/json" };
    const base = "appQbfU2XIx0UEYIh";
    try {
      const fetchAll = async (tableId, viewName) => {
        let all = [], offset = null;
        do {
          let url = `https://api.airtable.com/v0/${base}/${tableId}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
          if (viewName) url += `&view=${encodeURIComponent(viewName)}`;
          const res = await fetch(url, { headers });
          if (!res.ok) throw new Error(`Airtable ${res.status}: ${res.statusText}`);
          const data = await res.json();
          all = all.concat(data.records);
          offset = data.offset;
        } while (offset);
        return all;
      };
      const [tasks, methods, areas, plots, plants] = await Promise.all([
        fetchAll("tblwxecwIEV6Ehu6F", "Avondale"),
        fetchAll("tblqZKea6J4Thvgtz"),
        fetchAll("tbl7ztPLlm7wevuh9"),
        fetchAll("tblrpebzWu7z2uwaX"),
        fetchAll("tblKRilYEwCOGAfPx"),
      ]);
      setAtTasks(tasks); setAtMethods(methods); setAtAreas(areas); setAtPlots(plots); setAtPlants(plants);
    } catch (err) { setAtError(err.message); }
    setAtLoading(false);
  }, []);

  useEffect(() => { fetchAirtable(); }, [fetchAirtable]);

  // ─── Update task status in Airtable ───
  const updateTaskStatus = useCallback(async (taskId, newStatus) => {
    const headers = { Authorization: `Bearer ${AT_TOKEN}`, "Content-Type": "application/json" };
    try {
      await fetch(`https://api.airtable.com/v0/appQbfU2XIx0UEYIh/tblwxecwIEV6Ehu6F/${taskId}`, {
        method: "PATCH", headers, body: JSON.stringify({ fields: { Status: newStatus } }),
      });
      setAtTasks(prev => prev.map(t => t.id === taskId ? { ...t, fields: { ...t.fields, Status: newStatus } } : t));
    } catch (err) { console.error("Failed to update status:", err); }
  }, []);

  // ─── Resolve plant names for a task ───
  const resolveTaskPlants = useCallback((task) => {
    const plantLinks = task.fields["Plant(s)"];
    if (!Array.isArray(plantLinks) || plantLinks.length === 0) return [];
    return plantLinks.map(id => {
      const rec = atPlantsDB.find(p => p.id === id);
      return rec ? { id, name: rec.fields.Name || rec.fields["Plant Name"] || id, type: rec.fields.Type || rec.fields["Plant Type"] || "" } : { id, name: id, type: "" };
    });
  }, [atPlantsDB]);

  // ─── Resolve dependency task details ───
  const resolveTaskDeps = useCallback((task) => {
    const depLinks = task.fields["Depends On"];
    if (!Array.isArray(depLinks) || depLinks.length === 0) return [];
    return depLinks.map(id => {
      const dep = atTasks.find(t => t.id === id);
      return dep ? { id: dep.id, name: dep.fields.Name || "Untitled", status: dep.fields.Status || "—", incomplete: dep.fields.Status !== "Complete" } : { id, name: id, status: "?", incomplete: true };
    });
  }, [atTasks]);

  // ─── Resolve Airtable area name for a task via Plot → Area chain ───
  const resolveTaskArea = useCallback((task) => {
    // Try Area (Link) first
    const areaLinks = task.fields["Area (Link)"];
    if (Array.isArray(areaLinks) && areaLinks.length > 0) {
      const a = atAreas.find(ar => ar.id === areaLinks[0]);
      if (a) return a.fields.Name || a.id;
    }
    // Fall back: resolve via Plot(s) → Area
    const plotLinks = task.fields["Plot(s)"];
    if (Array.isArray(plotLinks) && plotLinks.length > 0) {
      const p = atPlots.find(pl => pl.id === plotLinks[0]);
      if (p) {
        const plotArea = p.fields.Area;
        if (Array.isArray(plotArea) && plotArea.length > 0) {
          const a = atAreas.find(ar => ar.id === plotArea[0]);
          if (a) return a.fields.Name || a.id;
        }
      }
    }
    // Fall back: Scope Line name prefix
    const name = task.fields.Name || "";
    if (name.includes("[")) return name.match(/\[([^\]]+)\]/)?.[1] || "General";
    return "General";
  }, [atAreas, atPlots]);

  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const didPan = useRef(false);

  const area = useMemo(() => AREAS.find(a => a.id === selectedArea), [selectedArea]);
  const plot = useMemo(() => PLOTS.find(p => p.id === selectedPlot), [selectedPlot]);
  const plotPlants = useMemo(() => PLANTS.filter(p => p.plot === selectedPlot), [selectedPlot]);
  const areaPlots = useMemo(() => PLOTS.filter(p => p.area === selectedArea), [selectedArea]);
  const areaMethods = useMemo(() => METHODS[selectedArea] || [], [selectedArea]);
  const zoomLevel = useMemo(() => Math.round(VB.w / vb.w * 10) / 10, [vb.w]);

  // ─── Zoom (scroll wheel) ───
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      const rect = svg.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      setVb(prev => {
        const nw = Math.min(VB.w * 1.5, Math.max(120, prev.w * factor));
        const nh = nw * VB.h / VB.w;
        return { x: prev.x + (prev.w - nw) * mx, y: prev.y + (prev.h - nh) * my, w: nw, h: nh };
      });
    };
    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  // ─── Touch Support (pinch-to-zoom and touch-drag) ───
  const touchState = useRef({ touches: [], lastDist: 0, lastCenter: { x: 0, y: 0 } });
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleTouchStart = (e) => {
      e.preventDefault();
      touchState.current.touches = Array.from(e.touches);
      if (e.touches.length === 1) {
        isPanning.current = true;
        didPan.current = false;
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isPanning.current = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        touchState.current.lastDist = dist;
        touchState.current.lastCenter = {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2
        };
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isPanning.current) {
        const dx = e.touches[0].clientX - panStart.current.x;
        const dy = e.touches[0].clientY - panStart.current.y;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didPan.current = true;
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        const rect = svg.getBoundingClientRect();
        setVb(prev => ({ ...prev, x: prev.x - dx * (prev.w / rect.width), y: prev.y - dy * (prev.h / rect.height) }));
      } else if (e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const newDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const newCenter = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
        if (touchState.current.lastDist > 0) {
          const factor = newDist / touchState.current.lastDist;
          const rect = svg.getBoundingClientRect();
          const mx = (newCenter.x - rect.left) / rect.width;
          const my = (newCenter.y - rect.top) / rect.height;
          setVb(prev => {
            const nw = Math.min(VB.w * 1.5, Math.max(120, prev.w / factor));
            const nh = nw * VB.h / VB.w;
            return { x: prev.x + (prev.w - nw) * mx, y: prev.y + (prev.h - nh) * my, w: nw, h: nh };
          });
        }
        touchState.current.lastDist = newDist;
        touchState.current.lastCenter = newCenter;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      isPanning.current = false;
      touchState.current = { touches: [], lastDist: 0, lastCenter: { x: 0, y: 0 } };
    };

    svg.addEventListener("touchstart", handleTouchStart, { passive: false });
    svg.addEventListener("touchmove", handleTouchMove, { passive: false });
    svg.addEventListener("touchend", handleTouchEnd, { passive: false });
    return () => {
      svg.removeEventListener("touchstart", handleTouchStart);
      svg.removeEventListener("touchmove", handleTouchMove);
      svg.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // ─── Pan (drag) ───
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isPanning.current = true; didPan.current = false;
    panStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.style.cursor = "grabbing";
  }, []);
  const onMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) didPan.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    setVb(prev => ({ ...prev, x: prev.x - dx * (prev.w / rect.width), y: prev.y - dy * (prev.h / rect.height) }));
  }, []);
  const onMouseUp = useCallback((e) => {
    isPanning.current = false;
    if (e.currentTarget) e.currentTarget.style.cursor = "grab";
  }, []);

  // ─── Double-click zoom ───
  const onDoubleClick = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    setVb(prev => {
      const nw = Math.max(120, prev.w * 0.5);
      const nh = nw * VB.h / VB.w;
      return { x: prev.x + (prev.w - nw) * mx, y: prev.y + (prev.h - nh) * my, w: nw, h: nh };
    });
  }, []);

  // ─── Zoom controls ───
  const zoomIn = useCallback(() => setVb(prev => {
    const nw = Math.max(120, prev.w * 0.7); const nh = nw * VB.h / VB.w;
    return { x: prev.x + (prev.w - nw) * 0.5, y: prev.y + (prev.h - nh) * 0.5, w: nw, h: nh };
  }), []);
  const zoomOut = useCallback(() => setVb(prev => {
    const nw = Math.min(VB.w * 1.5, prev.w * 1.4); const nh = nw * VB.h / VB.w;
    return { x: prev.x + (prev.w - nw) * 0.5, y: prev.y + (prev.h - nh) * 0.5, w: nw, h: nh };
  }), []);
  const resetZoom = useCallback(() => setVb({ x: 0, y: 0, w: VB.w, h: VB.h }), []);

  // ─── Zoom to area ───
  const zoomToRect = useCallback((rect, padding = 30) => {
    const tw = rect.w + padding * 2;
    const th = rect.h + padding * 2;
    const aspect = VB.w / VB.h;
    let fw = tw, fh = th;
    if (tw / th > aspect) fh = tw / aspect; else fw = th * aspect;
    setVb({ x: rect.x - padding - (fw - tw) / 2, y: rect.y - padding - (fh - th) / 2, w: fw, h: fh });
  }, []);

  // ─── Selection handlers ───
  const handleSelectArea = useCallback((id) => {
    if (didPan.current) return;
    setSelectedArea(id); setSelectedPlot(null); setSelectedPlant(null); setSelectedInfraZone(null); setView("area");
  }, []);

  const handleSelectPlot = useCallback((id) => {
    if (didPan.current) return;
    const p = PLOTS.find(pp => pp.id === id);
    if (p) {
      setSelectedArea(p.area); setSelectedPlot(id); setSelectedPlant(null); setView("plot");
    }
  }, []);

  const handleSelectInfraZone = useCallback((zoneId) => {
    if (didPan.current) return;
    setSelectedArea("infrastructure"); setSelectedPlot(null); setSelectedPlant(null);
    setSelectedInfraZone(zoneId); setView("area");
  }, []);

  const handleSelectPlant = useCallback((plant) => {
    setSelectedPlant(plant); setView("plant");
  }, []);

  const handleMarkerClick = useCallback((marker) => {
    if (didPan.current || !marker.plantId) return;
    const plant = PLANTS.find(p => p.id === marker.plantId);
    if (plant) {
      setSelectedArea("a2native"); setSelectedPlot("a2a"); setSelectedPlant(plant); setView("plant");
    }
  }, []);

  const handleBack = useCallback(() => {
    if (view === "plant") { setSelectedPlant(null); setView("plot"); }
    else if (view === "plot") { setSelectedPlot(null); setView("area"); }
    else if (view === "area") { setSelectedArea(null); setView("map"); resetZoom(); }
  }, [view, resetZoom]);

  // ─── Tooltip helpers ───
  const showTooltip = useCallback((e, text) => {
    const c = containerRef.current;
    if (!c) return;
    const cr = c.getBoundingClientRect();
    setTooltip({ text, x: e.clientX - cr.left + 12, y: e.clientY - cr.top - 20 });
  }, []);
  const hideTooltip = useCallback(() => setTooltip(null), []);

  // ─── Plot rect helper ───
  const renderPlot = (plotId, label) => {
    const pos = PLOT_POS[plotId];
    const p = PLOTS.find(pp => pp.id === plotId);
    if (!pos || !p) return null;
    const active = selectedPlot === plotId;
    const isTiny = p.type === "Equipment";
    return (
      <g key={plotId} onClick={e => { e.stopPropagation(); handleSelectPlot(plotId); }}
        style={{ cursor: "pointer" }}
        onMouseEnter={isTiny ? (e) => showTooltip(e, p.name) : undefined}
        onMouseLeave={isTiny ? hideTooltip : undefined}>
        <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={isTiny ? 2 : 4}
          fill={p.color + (p.status === "Done" ? "55" : "33")}
          stroke={active ? C.accentGlow : p.color} strokeWidth={active ? 2 : 1} />
        {!isTiny && <text x={pos.x + pos.w / 2} y={pos.y + pos.h / 2 + 3} textAnchor="middle"
          fill={C.text} fontSize={pos.w < 100 ? 6.5 : 7.5} fontWeight={600}>{label || p.name}</text>}
        {isTiny && <text x={pos.x + pos.w / 2} y={pos.y + pos.h / 2 + 3} textAnchor="middle"
          fill={C.warn} fontSize={8}>☀</text>}
        {p.status === "Done" && !isTiny && <text x={pos.x + pos.w - 5} y={pos.y + 9}
          textAnchor="end" fill={C.accent} fontSize={7}>✓</text>}
      </g>
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, sans-serif", background: C.bg, color: C.text, minHeight: "100vh", padding: isMobile ? 8 : 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 800, color: C.accent, letterSpacing: -0.5 }}>Grolaporation</h1>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Avondale Farm Planner — 9.2 acres · 2026 Season</div>
        </div>
        <button onClick={() => { setSelectedArea(null); setSelectedPlot(null); setSelectedPlant(null); setView("map"); resetZoom(); }}
          style={{ padding: "4px 12px", borderRadius: 6, border: `1px solid ${C.accent}`, background: C.accent + "22", color: C.accent, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>🗺️ Reset View</button>
      </div>

      {/* Breadcrumb */}
      {view !== "map" && (
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 6, marginBottom: 12, fontSize: isMobile ? 14 : 12 }}>
          <span onClick={() => { setSelectedArea(null); setSelectedPlot(null); setSelectedPlant(null); setView("map"); resetZoom(); }} style={{ cursor: "pointer", color: C.accent }}>Avondale</span>
          {selectedArea && <><span style={{ color: C.textDim }}>›</span><span onClick={() => { setSelectedPlot(null); setSelectedPlant(null); setView("area"); zoomToRect(selectedArea === "garden2" ? ML.gardenBounds : selectedArea === "a2native" ? ML.nativeBounds : ML.infraBounds); }} style={{ cursor: "pointer", color: selectedPlot ? C.accent : C.text }}>{area?.name}</span></>}
          {selectedPlot && <><span style={{ color: C.textDim }}>›</span><span onClick={() => { setSelectedPlant(null); setView("plot"); }} style={{ cursor: "pointer", color: selectedPlant ? C.accent : C.text }}>{plot?.name}</span></>}
          {selectedPlant && <><span style={{ color: C.textDim }}>›</span><span style={{ color: C.text }}>{selectedPlant.name}</span></>}
          <button onClick={handleBack} style={{ marginLeft: "auto", padding: isMobile ? "6px 14px" : "2px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 11, cursor: "pointer" }}>← Back</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: view === "map" || isMobile ? "1fr" : "1fr 380px", gap: 16 }}>
        {/* Left: Map */}
        <div ref={containerRef} style={{ position: "relative" }}>
          <svg ref={svgRef} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
            style={{ width: "100%", height: "auto", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, cursor: "grab", userSelect: "none", touchAction: "none" }}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} onDoubleClick={onDoubleClick}>

            {/* Land fill */}
            <rect x={15} y={10} width={1170} height={480} rx={8} fill={C.land} />

            {/* Property boundary — red dashed */}
            <polygon points="22,18 1050,18 1100,120 1120,350 1080,470 700,485 400,480 22,475"
              fill="none" stroke={C.danger + "66"} strokeWidth={1.5} strokeDasharray="8 4" />
            <text x={560} y={14} textAnchor="middle" fill={C.textDim} fontSize={9}>Avondale — 9.2 acres</text>

            {/* Road (left edge) */}
            <rect x={2} y={10} width={18} height={480} fill={C.soil + "44"} stroke={C.soil + "66"} strokeWidth={0.5} rx={2} />
            <text x={11} y={260} textAnchor="middle" fill={C.soilLight} fontSize={5} transform="rotate(-90,11,260)">Avondale Rd</text>

            {/* Buildings near road */}
            <rect x={30} y={35} width={30} height={40} rx={2} fill="#222" stroke="#444" strokeWidth={0.5} />
            <rect x={30} y={82} width={28} height={25} rx={2} fill="#222" stroke="#444" strokeWidth={0.5} />
            <rect x={30} y={115} width={25} height={20} rx={2} fill="#222" stroke="#444" strokeWidth={0.5} />

            {/* Bus Nursery */}
            <rect x={130} y={20} width={180} height={80} rx={6} fill={C.spring + "08"} stroke={C.spring + "22"} strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={220} y={45} textAnchor="middle" fill={C.textDim} fontSize={10} fontWeight={700}>Bus Nursery</text>
            <text x={220} y={57} textAnchor="middle" fill={C.textDim} fontSize={7}>Propagation</text>
            {/* Bus shapes */}
            <rect x={150} y={65} width={40} height={22} rx={3} fill="#2a2a2a" stroke="#444" strokeWidth={0.5} />
            <rect x={198} y={65} width={40} height={22} rx={3} fill="#2a2a2a" stroke="#444" strokeWidth={0.5} />
            <rect x={246} y={65} width={40} height={22} rx={3} fill="#2a2a2a" stroke="#444" strokeWidth={0.5} />

            {/* ═══ HOME GARDEN ═══ */}
            <rect x={ML.gardenBounds.x} y={ML.gardenBounds.y} width={ML.gardenBounds.w} height={ML.gardenBounds.h}
              rx={6} fill={C.accent + "0a"} stroke={selectedArea === "garden2" ? C.accent : C.accent + "33"} strokeWidth={selectedArea === "garden2" ? 2 : 1}
              onClick={() => handleSelectArea("garden2")} style={{ cursor: "pointer" }} />
            <text x={ML.gardenBounds.x + 5} y={ML.gardenBounds.y + ML.gardenBounds.h - 5} fill={C.accent + "88"} fontSize={10} fontWeight={700}>Home Garden</text>

            {/* Crop plots */}
            {renderPlot("g2rr1", "Beans + Root Intercrops")}
            {renderPlot("g2rr3", "Potatoes")}
            {renderPlot("g2rr4", "Carrots + Mustard")}
            {renderPlot("g2rr2", "Garlic + Onions")}
            {renderPlot("g2hb2", "Kale+Chard+Broc")}
            {renderPlot("g2rr6", "Spinach+Lettuce")}
            {renderPlot("g2hb1", "Winter Squash")}
            {renderPlot("g2rr5", "Beets+Mustard")}
            {renderPlot("g2hb3", "Hügel Reserve")}

            {/* Infrastructure Zone (left of crop grid, below potatoes) */}
            <rect x={ML.infraBounds.x} y={ML.infraBounds.y} width={ML.infraBounds.w} height={ML.infraBounds.h}
              rx={4} fill={C.infra + "15"} stroke={selectedArea === "infrastructure" ? C.accent : C.infra + "44"} strokeWidth={selectedArea === "infrastructure" ? 2 : 1}
              onClick={() => handleSelectArea("infrastructure")} style={{ cursor: "pointer" }} />
            <text x={ML.infraBounds.x + ML.infraBounds.w / 2} y={ML.infraBounds.y + 12} textAnchor="middle" fill={C.warn} fontSize={7} fontWeight={700}>Infrastructure</text>
            {INFRA_ZONES.map(z => (
              <g key={z.id} onClick={e => { e.stopPropagation(); handleSelectInfraZone(z.id); }}
                style={{ cursor: "pointer" }}
                onMouseEnter={e => showTooltip(e, z.label)}
                onMouseLeave={hideTooltip}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={3}
                  fill={selectedInfraZone === z.id ? z.color + "44" : z.color + "22"}
                  stroke={selectedInfraZone === z.id ? C.accentGlow : z.color + "44"}
                  strokeWidth={selectedInfraZone === z.id ? 1.5 : 0.5} />
                <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 3} textAnchor="middle"
                  fill={selectedInfraZone === z.id ? C.text : C.textDim} fontSize={5}
                  style={{ pointerEvents: "none" }}>{z.label}</text>
              </g>
            ))}

            {/* Greenhouses */}
            {renderPlot("g2gh1", "GH 1")}
            {renderPlot("g2gh2", "GH 2")}
            {/* Greenhouse roof lines */}
            <line x1={ML.gh1.x} y1={ML.gh1.y + 8} x2={ML.gh1.x + ML.gh1.w / 2} y2={ML.gh1.y} stroke={C.greenhouse + "88"} strokeWidth={0.5} />
            <line x1={ML.gh1.x + ML.gh1.w / 2} y1={ML.gh1.y} x2={ML.gh1.x + ML.gh1.w} y2={ML.gh1.y + 8} stroke={C.greenhouse + "88"} strokeWidth={0.5} />
            <line x1={ML.gh2.x} y1={ML.gh2.y + 8} x2={ML.gh2.x + ML.gh2.w / 2} y2={ML.gh2.y} stroke={C.greenhouse + "88"} strokeWidth={0.5} />
            <line x1={ML.gh2.x + ML.gh2.w / 2} y1={ML.gh2.y} x2={ML.gh2.x + ML.gh2.w} y2={ML.gh2.y + 8} stroke={C.greenhouse + "88"} strokeWidth={0.5} />

            {/* Solar Dehydrators (tiny icons, tooltip on hover) */}
            {renderPlot("g2sd1")}
            {renderPlot("g2sd2")}

            {/* ═══ DRIVEN PATH ═══ */}
            <polygon points="350,248 980,278 980,296 350,266" fill="#1a1a1a" stroke="#333" strokeWidth={0.5} />
            <text x={660} y={290} textAnchor="middle" fill={C.soilLight} fontSize={8} fontWeight={600}>Driven Path</text>

            {/* ═══ A2 NATIVE GARDEN ═══ */}
            <rect x={ML.nativeBounds.x} y={ML.nativeBounds.y} width={ML.nativeBounds.w} height={ML.nativeBounds.h}
              rx={6} fill={"#4a6a3a" + "12"} stroke={selectedArea === "a2native" ? C.accent : "#4a6a3a55"} strokeWidth={selectedArea === "a2native" ? 2 : 1}
              onClick={() => handleSelectArea("a2native")} style={{ cursor: "pointer" }} />
            <text x={ML.nativeBounds.x + 5} y={ML.nativeBounds.y + ML.nativeBounds.h - 5} fill={"#4a6a3a"} fontSize={10} fontWeight={700}>A2 — Native Garden</text>

            {/* Individual plant markers */}
            {A2_MARKERS.map(m => (
              <PlantMarker key={m.id} marker={m}
                active={selectedPlant?.id === m.plantId}
                onClick={() => handleMarkerClick(m)}
                onHover={(e) => showTooltip(e, m.label + (m.plantId ? " — click for details" : ""))}
                onLeave={hideTooltip} />
            ))}

            {/* ═══ STREAM ═══ */}
            <path d="M 900 60 Q 880 120 890 180 Q 910 240 880 300 Q 850 360 870 420 Q 890 470 870 500"
              fill="none" stroke={C.water} strokeWidth={4} opacity={0.5} />
            <path d="M 930 40 Q 910 100 920 160 Q 940 220 910 280 Q 880 340 900 400 Q 920 450 900 490"
              fill="none" stroke={C.water} strokeWidth={3} opacity={0.35} />
            <path d="M 960 70 Q 950 130 960 190 Q 970 250 940 310 Q 910 370 930 430 Q 950 480 930 510"
              fill="none" stroke={C.water} strokeWidth={2} opacity={0.25} />
            <text x={920} y={260} textAnchor="middle" fill={C.waterDim} fontSize={8} opacity={0.5} transform="rotate(-80,920,260)">Stream</text>

            {/* Open land features */}
            <rect x={1020} y={80} width={50} height={50} rx={4} fill={C.soil + "22"} stroke={C.soil + "33"} strokeWidth={0.5} />
            <text x={1045} y={110} textAnchor="middle" fill={C.textDim} fontSize={5}>Pond</text>

            {/* Buffer zones */}
            <rect x={22} y={140} width={55} height={120} rx={4} fill={C.spring + "08"} stroke={C.spring + "15"} strokeWidth={0.5} strokeDasharray="3 3" />
            <text x={50} y={205} textAnchor="middle" fill={C.textDim} fontSize={6}>Buffer</text>

            {/* ═══ LEGEND ═══ */}
            <g transform="translate(1040, 300)">
              <rect x={-8} y={-12} width={125} height={145} rx={6} fill={C.bgCard + "cc"} stroke={C.border} strokeWidth={0.5} />
              <text x={0} y={0} fill={C.textDim} fontSize={8} fontWeight={700}>Legend</text>
              {[["Raised Row", C.raised], ["Hügelkultur", C.hugel], ["Raised Bed", C.raisedBed], ["Greenhouse", C.greenhouse], ["Food Forest", "#4a6a3a"], ["Infrastructure", C.infra]].map(([label, color], i) => (
                <g key={label} transform={`translate(0, ${12 + i * 14})`}>
                  <rect x={0} y={0} width={8} height={8} rx={2} fill={color + "55"} stroke={color} strokeWidth={0.5} />
                  <text x={12} y={7} fill={C.textMuted} fontSize={7}>{label}</text>
                </g>
              ))}
              <text x={0} y={103} fill={C.textDim} fontSize={7} fontWeight={600}>Nutrients</text>
              {[["Low", C.low], ["Med", C.med], ["High", C.high]].map(([l, c], i) => (
                <g key={l} transform={`translate(${i * 30}, 112)`}>
                  <rect x={0} y={0} width={7} height={7} rx={2} fill={c} />
                  <text x={10} y={6} fill={C.textMuted} fontSize={6}>{l}</text>
                </g>
              ))}
            </g>
          </svg>

          {/* Zoom controls */}
          <div style={{ position: "absolute", bottom: 12, right: 12, display: "flex", flexDirection: "column", gap: 4, background: C.bgCard + "ee", border: `1px solid ${C.border}`, borderRadius: 8, padding: 4 }}>
            <button onClick={zoomIn} style={{ width: isMobile ? 40 : 30, height: isMobile ? 38 : 28, border: `1px solid ${C.border}`, borderRadius: 4, background: C.bgHover, color: C.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <div style={{ textAlign: "center", fontSize: 9, color: C.textMuted, padding: "2px 0" }}>{zoomLevel}x</div>
            <button onClick={zoomOut} style={{ width: isMobile ? 40 : 30, height: isMobile ? 38 : 28, border: `1px solid ${C.border}`, borderRadius: 4, background: C.bgHover, color: C.text, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <button onClick={resetZoom} style={{ width: isMobile ? 40 : 30, height: isMobile ? 38 : 28, border: `1px solid ${C.border}`, borderRadius: 4, background: C.bgHover, color: C.textMuted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>↺</button>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div style={{ position: "absolute", left: tooltip.x, top: tooltip.y, padding: "3px 8px",
              background: C.bgCard, border: `1px solid ${C.accent}44`, borderRadius: 6,
              fontSize: 11, color: C.text, pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap",
              boxShadow: `0 2px 8px ${C.bg}88` }}>
              {tooltip.text}
            </div>
          )}

          {/* ─── Tab Bar ─── */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { id: "timeline", label: "Timeline", icon: "📅", val: "2026" },
              { id: "areas", label: "Areas", icon: "📍", val: `${AREAS.length}`, color: C.accent },
              { id: "plots", label: "Plots", icon: "🌱", val: `${PLOTS.length}`, color: C.spring },
              { id: "plants", label: "Plants", icon: "🌿", val: `${PLANTS.length}`, color: C.summer },
              { id: "tasks", label: "Tasks", icon: "✅", val: atTasks.length > 0 ? `${atTasks.length}` : "—", color: C.warn },
            ].map(tab => (
              <div key={tab.id} onClick={() => setBottomTab(tab.id)}
                style={{
                  flex: isMobile ? "1 1 calc(50% - 6px)" : "1 1 0",
                  padding: "8px 10px", borderRadius: 8, textAlign: "center", cursor: "pointer",
                  background: bottomTab === tab.id ? (tab.color || C.accent) + "22" : C.bgCard,
                  border: `1px solid ${bottomTab === tab.id ? (tab.color || C.accent) : C.border}`,
                  transition: "all 0.15s ease",
                }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: tab.color || C.accent }}>
                  <span style={{ fontSize: 12, marginRight: 4 }}>{tab.icon}</span>{tab.val}
                </div>
                <div style={{ fontSize: 10, color: bottomTab === tab.id ? C.text : C.textMuted, marginTop: 2 }}>{tab.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail Panel */}
        {view !== "map" && (
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, maxHeight: isMobile ? "none" : "80vh", overflowY: "auto" }}>
            {/* AREA VIEW */}
            {view === "area" && area && (
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.accent }}>{area.name}</h2>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{area.desc}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <Badge color={C.spring}>{area.acres} ac</Badge>
                  <Badge color={C.summer}>{area.sqft.toLocaleString()} sqft</Badge>
                  {area.systems.map(s => <Badge key={s} color={C.water}>{s}</Badge>)}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 6, letterSpacing: 0.5, textTransform: "uppercase" }}>General Care</div>
                {area.generalCare.map((c, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 80px 1fr", gap: 6, padding: "6px 0", borderBottom: `1px solid ${C.border}22`, fontSize: 11 }}>
                    <span style={{ fontWeight: 600, color: C.text }}>{ACTION_ICONS[c.action] || "·"} {c.action}</span>
                    <SeasonTag season={c.season} />
                    <span style={{ color: C.textMuted }}>{c.notes}</span>
                  </div>
                ))}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, margin: "16px 0 6px", letterSpacing: 0.5, textTransform: "uppercase" }}>Methods & Systems</div>
                {areaMethods.map((m, i) => (
                  <div key={i} style={{ padding: 8, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{m.name}</span>
                      <Badge color={C.water} small>{m.system}</Badge>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: C.accent }}>{m.tasks} tasks</span>
                      <span style={{ fontSize: 10, color: C.warn }}>{m.hours} hrs</span>
                    </div>
                  </div>
                ))}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, margin: "16px 0 6px", letterSpacing: 0.5, textTransform: "uppercase" }}>Plots ({areaPlots.length})</div>
                {areaPlots.map(p => (
                  <div key={p.id} onClick={() => handleSelectPlot(p.id)}
                    style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{p.name}</span>
                      <Badge color={p.status === "Done" ? C.accent : p.status === "Established" ? C.spring : C.textMuted} small>{p.status}</Badge>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                      <Badge color={p.color} small>{p.type}</Badge>
                      <span style={{ fontSize: 10, color: C.textMuted }}>{p.sqft} sqft</span>
                      {p.nutrientCode && <NutrientBar code={p.nutrientCode} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* PLOT VIEW */}
            {view === "plot" && plot && (
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.accent }}>{plot.name}</h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <Badge color={plot.color}>{plot.type}</Badge>
                  <Badge color={plot.status === "Done" ? C.accent : C.textMuted}>{plot.status}</Badge>
                  <Badge color={C.summer}>{plot.sqft} sqft</Badge>
                  {plot.soil && <Badge color={C.soil} small>Soil: {plot.soil}</Badge>}
                </div>
                {plot.nutrientCode && (
                  <div style={{ padding: 10, background: C.bg, borderRadius: 6, border: `1px solid ${C.border}`, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, marginBottom: 4 }}>Nutrient Code: <span style={{ color: C.warn }}>{plot.nutrientCode}</span></div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {plot.nutrientCode.split("").map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: LEVEL_COLORS[l] + "18", border: `1px solid ${LEVEL_COLORS[l]}33` }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: LEVEL_COLORS[l] }} />
                          <span style={{ fontSize: 10, color: C.text }}>{NUTRIENTS[i]}: {LEVEL_LABELS[l]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, margin: "12px 0 6px", letterSpacing: 0.5, textTransform: "uppercase" }}>Plants ({plotPlants.length})</div>
                {plotPlants.length > 0 ? plotPlants.map(p => <PlantCard key={p.id} plant={p} onSelect={handleSelectPlant} />) :
                  <div style={{ fontSize: 12, color: C.textDim, padding: 12, textAlign: "center" }}>No plants assigned to this plot</div>}
              </div>
            )}
            {/* PLANT VIEW */}
            {view === "plant" && selectedPlant && (
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: C.accent }}>{selectedPlant.name}</h2>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <Badge color={selectedPlant.type.includes("Perennial") ? C.spring : C.summer}>{selectedPlant.type}</Badge>
                  {selectedPlant.count && <Badge color={C.textMuted}>{selectedPlant.count}</Badge>}
                  {selectedPlant.spacing && <Badge color={C.soil} small>{selectedPlant.spacing}</Badge>}
                </div>
                <MaintenanceMatrix plant={selectedPlant} />
                <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, margin: "16px 0 6px", letterSpacing: 0.5, textTransform: "uppercase" }}>Full Care Details</div>
                {selectedPlant.maintenance.map((m, i) => (
                  <div key={i} style={{ padding: "8px 10px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{ACTION_ICONS[m.action] || "·"}</span>
                      <span style={{ fontWeight: 600, fontSize: 12, color: C.text }}>{m.action}</span>
                      <SeasonTag season={m.season} />
                    </div>
                    <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.4 }}>{m.notes}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Tab Content ─── */}
      <div style={{ marginTop: 16, padding: isMobile ? 10 : 16, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, overflowX: isMobile ? "auto" : "visible" }}>

        {/* TIMELINE TAB (default) — seasonal chart + task drawers */}
        {bottomTab === "timeline" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>2026 Seasonal Timeline</div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "90px repeat(12, 1fr)" : "120px repeat(12, 1fr)", gap: 2, minWidth: isMobile ? 600 : "auto" }}>
              <div />
              {["Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"].map(m => (
                <div key={m} style={{ textAlign: "center", fontSize: 9, fontWeight: 600, color: C.textDim, padding: "2px 0" }}>{m}</div>
              ))}
              {[
                { label: "Garlic", start: 0, end: 3, color: C.raised },
                { label: "Onions", start: 0, end: 3, color: C.raised },
                { label: "Spinach", start: 1, end: 4, color: C.raisedBed },
                { label: "Lettuce", start: 1, end: 3, color: C.raisedBed },
                { label: "Potatoes", start: 1, end: 5, color: C.raised },
                { label: "Carrots", start: 1, end: 5, color: C.raised },
                { label: "Beets", start: 1, end: 5, color: C.raised },
                { label: "Kale", start: 2, end: 6, color: C.hugel },
                { label: "Chard", start: 2, end: 6, color: C.hugel },
                { label: "Broccoli", start: 2, end: 5, color: C.hugel },
                { label: "Pole Beans", start: 3, end: 7, color: C.raised },
                { label: "Winter Squash", start: 3, end: 8, color: C.hugel },
                { label: "Native Garden", start: 0, end: 10, color: "#4a6a3a" },
                { label: "Infrastructure", start: 0, end: 11, color: C.warn },
              ].map(({ label, start, end, color }) => (
                <React.Fragment key={label}>
                  <div style={{ fontSize: 10, color: C.textMuted, display: "flex", alignItems: "center", paddingRight: 4 }}>{label}</div>
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} style={{ height: 16, borderRadius: 3, background: i >= start && i <= end ? color + "55" : "transparent", border: i >= start && i <= end ? `1px solid ${color}88` : "1px solid transparent" }} />
                  ))}
                </React.Fragment>
              ))}
            </div>

          </div>
        )}

        {/* AREAS TAB */}
        {bottomTab === "areas" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>Farm Areas</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 500 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Area", "Description", "Acres", "Sq Ft", "Plots", "Systems"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AREAS.map(a => {
                    const ap = PLOTS.filter(p => p.area === a.id);
                    return (
                      <tr key={a.id} onClick={() => handleSelectArea(a.id)}
                        style={{ borderBottom: `1px solid ${C.border}22`, cursor: "pointer", background: selectedArea === a.id ? C.accent + "15" : "transparent" }}
                        onMouseEnter={e => { if (selectedArea !== a.id) e.currentTarget.style.background = C.bgHover; }}
                        onMouseLeave={e => { if (selectedArea !== a.id) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: C.text }}>{a.name}</td>
                        <td style={{ padding: "8px 10px", color: C.textMuted, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.desc}</td>
                        <td style={{ padding: "8px 10px", color: C.spring }}>{a.acres}</td>
                        <td style={{ padding: "8px 10px", color: C.textMuted }}>{a.sqft.toLocaleString()}</td>
                        <td style={{ padding: "8px 10px", color: C.accent }}>{ap.length}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {a.systems.map(s => (
                              <span key={s} style={{ padding: "1px 6px", borderRadius: 4, background: C.water + "22", border: `1px solid ${C.water}33`, fontSize: 9, color: C.water }}>{s}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLOTS TAB */}
        {bottomTab === "plots" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>All Plots</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Plot", "Area", "Type", "Sq Ft", "Status", "Plants", "Methods"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PLOTS.map(p => {
                    const pp = PLANTS.filter(pl => pl.plot === p.id);
                    const areaObj = AREAS.find(a => a.id === p.area);
                    const methods = METHODS[p.area] || [];
                    const methodSummary = methods.map(m => m.name).slice(0, 2).join(", ");
                    return (
                      <tr key={p.id} onClick={() => handleSelectPlot(p.id)}
                        style={{ borderBottom: `1px solid ${C.border}22`, cursor: "pointer", background: selectedPlot === p.id ? C.accent + "15" : "transparent" }}
                        onMouseEnter={e => { if (selectedPlot !== p.id) e.currentTarget.style.background = C.bgHover; }}
                        onMouseLeave={e => { if (selectedPlot !== p.id) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "8px 10px", fontWeight: 600, color: C.text }}>{p.name}</td>
                        <td style={{ padding: "8px 10px", color: C.textMuted }}>{areaObj?.name || p.area}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ padding: "1px 6px", borderRadius: 4, background: p.color + "22", border: `1px solid ${p.color}44`, fontSize: 10, color: p.color }}>{p.type}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: C.textMuted }}>{p.sqft}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{ padding: "1px 6px", borderRadius: 4, fontSize: 10, color: p.status === "Done" ? C.accent : p.status === "Established" ? C.spring : C.textMuted,
                            background: (p.status === "Done" ? C.accent : p.status === "Established" ? C.spring : C.textMuted) + "18" }}>{p.status}</span>
                        </td>
                        <td style={{ padding: "8px 10px", color: C.summer }}>{pp.length}</td>
                        <td style={{ padding: "8px 10px", color: C.textMuted, fontSize: 10, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{methodSummary || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PLANTS TAB — grouped by status */}
        {bottomTab === "plants" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>All Plants</div>
            {(() => {
              const statusOrder = ["Established", "Annual", "Perennial", "Companion"];
              const grouped = {};
              PLANTS.forEach(p => {
                const key = p.type || "Other";
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(p);
              });
              const sortedKeys = Object.keys(grouped).sort((a, b) => {
                const ai = statusOrder.indexOf(a), bi = statusOrder.indexOf(b);
                return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
              });
              return sortedKeys.map(status => (
                <div key={status} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, padding: "6px 0", borderBottom: `1px solid ${C.border}33`, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {status} ({grouped[status].length})
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 400 }}>
                      <thead>
                        <tr>
                          {["Plant", "Plot", "Count", "Spacing", "Care Actions"].map(h => (
                            <th key={h} style={{ padding: "4px 10px", textAlign: "left", color: C.textDim, fontWeight: 600, fontSize: 9, textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {grouped[status].map(pl => {
                          const plotObj = PLOTS.find(p => p.id === pl.plot);
                          return (
                            <tr key={pl.id} onClick={() => { handleSelectPlant(pl); const po = PLOTS.find(p => p.id === pl.plot); if (po) { setSelectedArea(po.area); setSelectedPlot(po.id); } setView("plant"); }}
                              style={{ borderBottom: `1px solid ${C.border}11`, cursor: "pointer", background: selectedPlant?.id === pl.id ? C.accent + "15" : "transparent" }}
                              onMouseEnter={e => { if (selectedPlant?.id !== pl.id) e.currentTarget.style.background = C.bgHover; }}
                              onMouseLeave={e => { if (selectedPlant?.id !== pl.id) e.currentTarget.style.background = "transparent"; }}>
                              <td style={{ padding: "6px 10px", fontWeight: 600, color: C.text }}>{pl.name}</td>
                              <td style={{ padding: "6px 10px", color: C.textMuted, fontSize: 10 }}>{plotObj?.name || "—"}</td>
                              <td style={{ padding: "6px 10px", color: C.textMuted, fontSize: 10 }}>{pl.count || "—"}</td>
                              <td style={{ padding: "6px 10px", color: C.textMuted, fontSize: 10 }}>{pl.spacing || "—"}</td>
                              <td style={{ padding: "6px 10px", fontSize: 10 }}>
                                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                  {(pl.maintenance || []).map((m, i) => (
                                    <span key={i} style={{ fontSize: 12 }} title={`${m.action} — ${m.season}`}>{ACTION_ICONS[m.action] || "·"}</span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* TASKS TAB — Rich kanban by area → method with columns */}
        {bottomTab === "tasks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: 0.5, textTransform: "uppercase" }}>Avondale Tasks ({atTasks.length})</div>
              {atTasks.length > 0 && (
                <button onClick={fetchAirtable}
                  style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "transparent", color: C.textMuted, fontSize: 10, cursor: "pointer" }}>↻ Refresh</button>
              )}
            </div>

            {atLoading && <div style={{ padding: 20, textAlign: "center", color: C.textMuted, fontSize: 12 }}>Loading tasks from Airtable...</div>}
            {atError && <div style={{ padding: 8, color: C.danger, fontSize: 11 }}>{atError}</div>}

            {atTasks.length > 0 && !atLoading && (() => {
              const methodMap = {};
              atMethods.forEach(m => { methodMap[m.id] = m.fields["Method Name"] || m.fields.Name || m.id; });

              const statusColors = { Planned: C.warn, "In Progress": C.accent, Complete: C.spring, Recurring: C.water, "Seasonal Hold": C.textMuted, Blocked: C.danger, Backlog: C.textDim };
              const statusOrder = ["In Progress", "Planned", "Recurring", "Blocked", "Seasonal Hold", "Complete", "Backlog"];
              const statusOptions = ["Planned", "In Progress", "Complete", "Recurring", "Seasonal Hold", "Blocked", "Backlog"];

              const fmtDate = (d) => { if (!d) return "—"; const dt = new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; };

              // Group tasks by resolved area
              const byArea = {};
              atTasks.forEach(t => {
                const areaName = resolveTaskArea(t);
                if (!byArea[areaName]) byArea[areaName] = [];
                byArea[areaName].push(t);
              });

              return Object.entries(byArea).sort(([a], [b]) => a.localeCompare(b)).map(([areaName, areaTasks]) => {
                const byMethod = {};
                areaTasks.forEach(t => {
                  const ml = t.fields.Method || [];
                  const mn = Array.isArray(ml) && ml.length > 0 ? (methodMap[ml[0]] || "General") : "General";
                  if (!byMethod[mn]) byMethod[mn] = [];
                  byMethod[mn].push(t);
                });

                const planned = areaTasks.filter(t => t.fields.Status === "Planned").length;
                const inProg = areaTasks.filter(t => t.fields.Status === "In Progress").length;
                const done = areaTasks.filter(t => t.fields.Status === "Complete").length;

                return (
                  <details key={areaName} style={{ marginBottom: 8 }}>
                    <summary style={{ cursor: "pointer", padding: "10px 14px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, fontWeight: 700, color: C.text, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: C.accent }}>📍 {areaName}</span>
                      <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                        {inProg > 0 && <span style={{ color: C.accent }}>{inProg} active</span>}
                        <span style={{ color: C.warn }}>{planned} planned</span>
                        <span style={{ color: C.spring }}>{done} done</span>
                        <span style={{ color: C.textDim }}>{areaTasks.length} total</span>
                      </div>
                    </summary>
                    <div style={{ paddingLeft: 8, marginTop: 6 }}>
                      {Object.entries(byMethod).sort(([a], [b]) => a.localeCompare(b)).map(([methodName, mTasks]) => (
                        <details key={methodName} style={{ marginBottom: 6 }} open>
                          <summary style={{ cursor: "pointer", padding: "6px 10px", background: C.bgCard, border: `1px solid ${C.border}33`, borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.textMuted, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>⚙ {methodName}</span>
                            <span style={{ fontSize: 10, color: C.textDim }}>{mTasks.length}</span>
                          </summary>
                          <div style={{ marginTop: 4, overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: isMobile ? 700 : 600 }}>
                              <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}44` }}>
                                  {["Task", "Plants", "Start", "Due", "Hrs", "Depends On", "Status"].map(h => (
                                    <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: C.textDim, fontWeight: 600, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {mTasks
                                  .sort((a, b) => statusOrder.indexOf(a.fields.Status || "") - statusOrder.indexOf(b.fields.Status || ""))
                                  .map(t => {
                                    const plants = resolveTaskPlants(t);
                                    const deps = resolveTaskDeps(t);
                                    const hasIncompleteDep = deps.some(d => d.incomplete);
                                    return (
                                      <tr key={t.id} style={{ borderBottom: `1px solid ${C.border}11`, background: hasIncompleteDep ? C.danger + "08" : "transparent" }}>
                                        {/* Task Name */}
                                        <td style={{ padding: "6px 6px", fontWeight: 600, color: C.text, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                          {t.fields.Name || "Untitled"}
                                          {t.fields["Task Type"] && <span style={{ fontSize: 9, color: C.textDim, marginLeft: 4 }}>({t.fields["Task Type"]})</span>}
                                        </td>
                                        {/* Plants — hover for details */}
                                        <td style={{ padding: "6px 6px", fontSize: 10, maxWidth: 120 }}>
                                          {plants.length > 0 ? (
                                            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                              {plants.map((p, i) => (
                                                <span key={i} title={`${p.name}${p.type ? ` (${p.type})` : ""}`}
                                                  style={{ padding: "1px 5px", borderRadius: 3, background: C.spring + "18", border: `1px solid ${C.spring}33`, fontSize: 9, color: C.spring, cursor: "default" }}>
                                                  {p.name?.length > 12 ? p.name.slice(0, 12) + "…" : p.name}
                                                </span>
                                              ))}
                                            </div>
                                          ) : <span style={{ color: C.textDim }}>—</span>}
                                        </td>
                                        {/* Start Date */}
                                        <td style={{ padding: "6px 6px", color: C.textMuted, fontSize: 10, whiteSpace: "nowrap" }}>{fmtDate(t.fields["Start Date"])}</td>
                                        {/* Due Date */}
                                        <td style={{ padding: "6px 6px", fontSize: 10, whiteSpace: "nowrap",
                                          color: t.fields["Due Date"] && new Date(t.fields["Due Date"]) < new Date() && t.fields.Status !== "Complete" ? C.danger : C.textMuted }}>
                                          {fmtDate(t.fields["Due Date"])}
                                        </td>
                                        {/* Estimated Hours */}
                                        <td style={{ padding: "6px 6px", color: C.textMuted, fontSize: 10, textAlign: "center" }}>{t.fields["Estimated Hours"] != null ? t.fields["Estimated Hours"] : "—"}</td>
                                        {/* Depends On — hover for dep details, highlight if incomplete */}
                                        <td style={{ padding: "6px 6px", fontSize: 10, maxWidth: 140 }}>
                                          {deps.length > 0 ? (
                                            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                                              {deps.map((d, i) => (
                                                <span key={i}
                                                  title={`${d.name} — ${d.status}${d.incomplete ? " ⚠ INCOMPLETE" : ""}`}
                                                  style={{
                                                    padding: "1px 5px", borderRadius: 3, fontSize: 9, cursor: "default",
                                                    background: d.incomplete ? C.danger + "22" : C.spring + "18",
                                                    border: `1px solid ${d.incomplete ? C.danger + "55" : C.spring + "33"}`,
                                                    color: d.incomplete ? C.danger : C.spring,
                                                  }}>
                                                  {d.name?.length > 14 ? d.name.slice(0, 14) + "…" : d.name}
                                                  {d.incomplete && " ⚠"}
                                                </span>
                                              ))}
                                            </div>
                                          ) : <span style={{ color: C.textDim }}>—</span>}
                                        </td>
                                        {/* Status — editable dropdown */}
                                        <td style={{ padding: "6px 6px" }}>
                                          <select
                                            value={t.fields.Status || "Planned"}
                                            onChange={e => updateTaskStatus(t.id, e.target.value)}
                                            style={{
                                              padding: "2px 4px", borderRadius: 4, fontSize: 9, fontWeight: 600, cursor: "pointer", border: `1px solid ${(statusColors[t.fields.Status] || C.textMuted) + "44"}`,
                                              background: (statusColors[t.fields.Status] || C.textMuted) + "18", color: statusColors[t.fields.Status] || C.textMuted,
                                              outline: "none", WebkitAppearance: "none", MozAppearance: "none", appearance: "none", paddingRight: 14,
                                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath fill='%239aaa80' d='M0 0l4 5 4-5z'/%3E%3C/svg%3E")`,
                                              backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center",
                                            }}>
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                          </select>
                                        </td>
                                      </tr>
                                    );
                                  })}
                              </tbody>
                            </table>
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>
                );
              });
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
