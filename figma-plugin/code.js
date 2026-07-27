// Carwaj Design System Builder
// Runs inside Figma via Plugins > Development, so it does not consume MCP quota.
// Every step is idempotent: re-running removes and rebuilds only what it owns.

const FONTS = [
  { family: "Inter", style: "Regular" },
  { family: "Inter", style: "Medium" },
  { family: "Inter", style: "Semi Bold" },
  { family: "Inter", style: "Bold" },
  { family: "Inter", style: "Extra Bold" },
];

const ctx = {
  sem: {},     // semantic colour variables by name
  prim: {},    // primitive colour variables by name
  rad: {},     // radius variables
  ts: {},      // text styles
  es: {},      // effect styles
  icons: {},   // icon components by short name
  comps: {},   // component sets by name
  screensPage: null,
  compsPage: null,
};

async function boot() {
  for (const f of FONTS) await figma.loadFontAsync(f);

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const byId = {};
  for (const c of collections) byId[c.id] = c.name;
  const vars = await figma.variables.getLocalVariablesAsync();
  for (const v of vars) {
    const cn = byId[v.variableCollectionId];
    if (cn === "Color") ctx.sem[v.name] = v;
    else if (cn === "Primitives") ctx.prim[v.name] = v;
    else if (cn === "Radius") ctx.rad[v.name] = v;
  }
  if (!Object.keys(ctx.sem).length) {
    throw new Error("No 'Color' variables found. Open the Carwaj Design System file first.");
  }

  for (const s of await figma.getLocalTextStylesAsync()) ctx.ts[s.name] = s;
  for (const s of await figma.getLocalEffectStylesAsync()) ctx.es[s.name] = s;

  ctx.compsPage = figma.root.children.find((p) => p.name === "Components");
  ctx.screensPage = figma.root.children.find((p) => p.name === "Screens");
  if (!ctx.compsPage || !ctx.screensPage) {
    throw new Error("Expected pages 'Components' and 'Screens' in this file.");
  }

  await figma.setCurrentPageAsync(ctx.compsPage);
  for (const node of ctx.compsPage.children) {
    if (node.type === "COMPONENT_SET") ctx.comps[node.name] = node;
  }
  for (const node of ctx.compsPage.findAllWithCriteria({ types: ["COMPONENT"] })) {
    if (node.name.indexOf("Icon/") === 0) ctx.icons[node.name.slice(5)] = node;
  }
}

/* ---------------------------------------------------------------- helpers */

function paint(token, table) {
  const v = (table || ctx.sem)[token];
  let p = { type: "SOLID", color: { r: 1, g: 1, b: 1 } };
  if (v) p = figma.variables.setBoundVariableForPaint(p, "color", v);
  return p;
}
function fill(node, token, table) { node.fills = [paint(token, table)]; }
function stroke(node, token, weight, table) {
  node.strokes = [paint(token, table)];
  node.strokeWeight = weight == null ? 1 : weight;
}
function radius(node, name) {
  const v = ctx.rad["radius/" + name];
  if (!v) return;
  ["topLeftRadius", "topRightRadius", "bottomLeftRadius", "bottomRightRadius"]
    .forEach((k) => node.setBoundVariable(k, v));
}

function stack(dir, opts) {
  const f = figma.createFrame();
  f.layoutMode = dir;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = [];
  const o = opts || {};
  if (o.name) f.name = o.name;
  if (o.gap != null) f.itemSpacing = o.gap;
  if (o.pad != null) {
    f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = o.pad;
  }
  if (o.px != null) { f.paddingLeft = f.paddingRight = o.px; }
  if (o.py != null) { f.paddingTop = f.paddingBottom = o.py; }
  if (o.align) f.counterAxisAlignItems = o.align;
  if (o.justify) f.primaryAxisAlignItems = o.justify;
  return f;
}
const V = (o) => stack("VERTICAL", o);
const H = (o) => stack("HORIZONTAL", o);

async function T(parent, chars, styleName, token, opts) {
  const o = opts || {};
  const t = figma.createText();
  t.fontName = { family: "Inter", style: o.weight || "Regular" };
  t.characters = chars;
  if (o.name) t.name = o.name;
  parent.appendChild(t);
  const st = ctx.ts[styleName];
  if (st) await t.setTextStyleIdAsync(st.id);
  t.fills = [paint(token, o.table)];
  if (o.align) t.textAlignHorizontal = o.align;
  if (o.fill) {
    t.layoutSizingHorizontal = "FILL";
    t.textAutoResize = "HEIGHT";
  }
  return t;
}

function icon(name, size, token, table) {
  const src = ctx.icons[name];
  if (!src) return null;
  const inst = src.createInstance();
  inst.resize(size, size);
  inst.name = name;
  const p = paint(token, table);
  inst.findAll((n) => "strokes" in n && n.strokes.length > 0)
      .forEach((n) => { n.strokes = [p]; });
  return inst;
}

async function card(parent, opts) {
  const o = opts || {};
  const c = V({ name: o.name || "Card", gap: o.gap == null ? 6 : o.gap });
  c.paddingLeft = c.paddingRight = 14;
  c.paddingTop = c.paddingBottom = 12;
  radius(c, o.radius || "card");
  fill(c, "bg/surface");
  stroke(c, "border/card", 1);
  parent.appendChild(c);
  c.layoutSizingHorizontal = "FILL";
  return c;
}

async function pill(parent, label, tone) {
  const TONES = {
    green:  ["green/50",   "green/700"],
    amber:  ["amber/50",   "amber/700"],
    red:    ["red/50",     "red/700"],
    blue:   ["blue/100",   "blue/900"],
    gray:   ["line/100",   "slate/600"],
    purple: ["purple/100", "purple/800"],
  };
  const [bg, fg] = TONES[tone] || TONES.gray;
  const p = H({ name: "Pill", gap: 4, px: 9, py: 3, align: "CENTER" });
  radius(p, "full");
  fill(p, bg, ctx.prim);
  parent.appendChild(p);
  await T(p, label, "Pill", fg, { weight: "Bold", table: ctx.prim });
  return p;
}

async function statusBadge(parent, status) {
  const MAP = {
    scheduled: ["Scheduled", "scheduled"],
    progress: ["In progress", "progress"],
    completed: ["Completed", "completed"],
    cancelled: ["Cancelled", "cancelled"],
  };
  const [label, key] = MAP[status];
  const b = H({ name: "StatusBadge", gap: 6, px: 10, py: 4, align: "CENTER" });
  radius(b, "full");
  fill(b, "status/" + key + "/bg");
  parent.appendChild(b);
  const dot = figma.createEllipse();
  dot.resize(6, 6);
  fill(dot, "status/" + key + "/dot");
  b.appendChild(dot);
  await T(b, label, "Pill", "status/" + key + "/text", { weight: "Bold" });
  return b;
}

async function avatar(parent, initial, tone, size) {
  const TONES = {
    blue:  ["blue/100",  "blue/600"],
    teal:  ["teal/100",  "teal/600"],
    amber: ["amber/100", "amber/600"],
    dark:  ["slate/800", "base/white"],
  };
  const [bg, fg] = TONES[tone] || TONES.blue;
  const s = size || 40;
  const a = H({ name: "Avatar", align: "CENTER", justify: "CENTER" });
  a.primaryAxisSizingMode = "FIXED";
  a.counterAxisSizingMode = "FIXED";
  a.resize(s, s);
  radius(a, "full");
  fill(a, bg, ctx.prim);
  parent.appendChild(a);
  const t = figma.createText();
  t.fontName = { family: "Inter", style: "Extra Bold" };
  t.characters = initial;
  t.fontSize = Math.round(s * 0.4);
  t.fills = [paint(fg, ctx.prim)];
  a.appendChild(t);
  return a;
}

/* ------------------------------------------------------------ chrome bits */

async function screen(name, route, x, y, bgToken) {
  const f = figma.createFrame();
  f.name = name + "  ·  " + route;
  f.resize(375, 812);
  f.x = x; f.y = y;
  f.layoutMode = "VERTICAL";
  f.primaryAxisSizingMode = "FIXED";
  f.counterAxisSizingMode = "FIXED";
  f.clipsContent = true;
  f.itemSpacing = 0;
  fill(f, bgToken || "bg/subtle");
  f.setSharedPluginData("carwaj", "kind", "screen");
  ctx.screensPage.appendChild(f);

  const sb = H({ name: "Status bar", justify: "SPACE_BETWEEN", align: "CENTER", px: 26 });
  sb.paddingTop = 14; sb.paddingBottom = 6;
  f.appendChild(sb);
  sb.layoutSizingHorizontal = "FILL";
  await T(sb, "9:41", "Label/Small", "text/primary", { weight: "Bold" });
  await T(sb, "●●●  ▮▮", "Caption", "text/secondary", { weight: "Bold" });
  return f;
}

async function appHeader(parent, title) {
  const h = H({ name: "Header", justify: "SPACE_BETWEEN", align: "CENTER", px: 16, py: 10 });
  fill(h, "bg/surface");
  parent.appendChild(h);
  h.layoutSizingHorizontal = "FILL";

  const left = H({ gap: 8, align: "CENTER" });
  h.appendChild(left);
  const logo = H({ align: "CENTER", justify: "CENTER" });
  logo.primaryAxisSizingMode = "FIXED";
  logo.counterAxisSizingMode = "FIXED";
  logo.resize(30, 30);
  radius(logo, "md");
  fill(logo, "brand/primary");
  left.appendChild(logo);
  const ci = icon("Car", 18, "brand/on-primary");
  if (ci) logo.appendChild(ci);
  await T(left, title, "Heading/H2", "text/primary", { weight: "Extra Bold" });

  await avatar(h, "S", "blue", 30);
  const line = figma.createRectangle();
  line.resize(375, 1);
  fill(line, "border/subtle");
  parent.appendChild(line);
  line.layoutSizingHorizontal = "FILL";
  return h;
}

async function adminTopBar(parent, label) {
  const h = H({ name: "Top bar", justify: "SPACE_BETWEEN", align: "CENTER", px: 16, py: 12 });
  fill(h, "bg/surface");
  parent.appendChild(h);
  h.layoutSizingHorizontal = "FILL";
  await T(h, label, "Micro/Upper", "text/secondary", { weight: "Semi Bold" });

  const burger = V({ gap: 3 });
  h.appendChild(burger);
  for (let i = 0; i < 3; i++) {
    const bar = figma.createRectangle();
    bar.resize(16, 1.6);
    bar.cornerRadius = 2;
    fill(bar, "text/secondary");
    burger.appendChild(bar);
  }
  const line = figma.createRectangle();
  line.resize(375, 1);
  fill(line, "border/subtle");
  parent.appendChild(line);
  line.layoutSizingHorizontal = "FILL";
}

function body(parent, gap) {
  const b = V({ name: "Content", gap: gap == null ? 10 : gap, px: 16, py: 14 });
  parent.appendChild(b);
  b.layoutSizingHorizontal = "FILL";
  b.layoutSizingVertical = "FILL";
  b.clipsContent = true;
  return b;
}

async function bottomNav(parent, activeIndex) {
  const line = figma.createRectangle();
  line.resize(375, 1);
  fill(line, "border/subtle");
  parent.appendChild(line);
  line.layoutSizingHorizontal = "FILL";

  const nav = H({ name: "Bottom nav", justify: "CENTER", align: "CENTER" });
  nav.paddingTop = 8; nav.paddingBottom = 18;
  fill(nav, "bg/surface");
  parent.appendChild(nav);
  nav.layoutSizingHorizontal = "FILL";

  const TABS = [
    ["Home", "Today"],
    ["Calendar", "Calendar"],
    ["User", "Clients"],
    ["Payments", "Pay"],
    ["Card", "Profile"],
  ];
  for (let i = 0; i < TABS.length; i++) {
    const [ic, label] = TABS[i];
    const token = i === activeIndex ? "brand/primary" : "text/secondary";
    const cell = V({ gap: 4, align: "CENTER" });
    nav.appendChild(cell);
    cell.layoutSizingHorizontal = "FILL";
    const gi = icon(ic, 22, token);
    if (gi) cell.appendChild(gi);
    await T(cell, label, "Caption", token, { weight: "Semi Bold" });
  }
}

async function sectionTitle(parent, text) {
  return T(parent, text, "Micro/Upper", "text/secondary", { weight: "Semi Bold" });
}

async function statGrid(parent, items, perRow) {
  const n = perRow || 2;
  let row = null;
  for (let i = 0; i < items.length; i++) {
    if (i % n === 0) {
      row = H({ gap: 8 });
      parent.appendChild(row);
      row.layoutSizingHorizontal = "FILL";
    }
    const [label, value, tone] = items[i];
    const c = V({ gap: 4, px: 12, py: 11 });
    radius(c, "md");
    fill(c, "bg/surface");
    stroke(c, "border/subtle", 1);
    row.appendChild(c);
    c.layoutSizingHorizontal = "FILL";
    await T(c, label, "Micro/Upper", "text/secondary", { weight: "Semi Bold" });
    const table = tone ? ctx.prim : ctx.sem;
    await T(c, value, "Heading/H1", tone || "text/primary", { weight: "Extra Bold", table });
  }
}

async function listRow(parent, title, meta, right, opts) {
  const o = opts || {};
  const r = H({ justify: "SPACE_BETWEEN", align: "CENTER", py: 9 });
  parent.appendChild(r);
  r.layoutSizingHorizontal = "FILL";

  const left = H({ gap: 10, align: "CENTER" });
  r.appendChild(left);
  if (o.avatar) await avatar(left, o.avatar[0], o.avatar[1], 34);
  const txt = V({ gap: 2 });
  left.appendChild(txt);
  await T(txt, title, "Label/Small", "text/primary", { weight: "Bold" });
  if (meta) await T(txt, meta, "Caption", "text/secondary");

  if (typeof right === "string") {
    await T(r, right, "Label/Small", "text/primary", { weight: "Bold" });
  } else if (right && right.pill) {
    await pill(r, right.pill[0], right.pill[1]);
  } else if (right && right.status) {
    await statusBadge(r, right.status);
  }
  return r;
}

/* ------------------------------------------------------ idempotent helper */

function clearScreens(names) {
  let removed = 0;
  for (const node of ctx.screensPage.children.slice()) {
    for (const n of names) {
      if (node.name.indexOf(n + "  ·  ") === 0) { node.remove(); removed++; break; }
    }
  }
  return removed;
}

/* ------------------------------------------------------------- step 1 */

async function step1() {
  await figma.setCurrentPageAsync(ctx.compsPage);
  const set = ctx.comps["Input Field"];
  if (!set) throw new Error("Input Field component set not found on the Components page.");

  const mail = ctx.icons["Mail"];
  if (!mail) throw new Error("Icon/Mail component not found.");

  let added = 0;
  for (const variant of set.children) {
    if (variant.findOne((n) => n.name === "Icon")) continue;
    const inst = mail.createInstance();
    inst.name = "Icon";
    inst.resize(18, 18);
    variant.insertChild(0, inst);
    const p = paint("text/secondary");
    inst.findAll((n) => "strokes" in n && n.strokes.length > 0)
        .forEach((n) => { n.strokes = [p]; });
    added++;
  }

  const defs = set.componentPropertyDefinitions || {};
  let prop = Object.keys(defs).filter((k) => k.indexOf("Icon#") === 0)[0];
  if (!prop) prop = set.addComponentProperty("Icon", "INSTANCE_SWAP", mail.id);
  for (const variant of set.children) {
    const i = variant.findOne((n) => n.type === "INSTANCE" && n.name === "Icon");
    if (i) i.componentPropertyReferences = { mainComponent: prop };
  }
  return "Input Field: icon slot ready on " + set.children.length +
         " variants (" + added + " added). Property: " + prop;
}

/* --------------------------------------------------- auth screen helpers */

async function authShell(name, route, x, y) {
  const f = await screen(name, route, x, y || 0);
  const b = V({ name: "Content", gap: 10, px: 32, align: "CENTER", justify: "CENTER" });
  f.appendChild(b);
  b.layoutSizingHorizontal = "FILL";
  b.layoutSizingVertical = "FILL";
  return { f, b };
}

function gap(parent, h) {
  const s = figma.createFrame();
  s.resize(1, h); s.fills = [];
  parent.appendChild(s);
}

async function field(parent, label, iconName) {
  const inp = H({ gap: 10, align: "CENTER", px: 14 });
  inp.primaryAxisSizingMode = "FIXED";
  inp.counterAxisSizingMode = "FIXED";
  inp.resize(311, 48);
  radius(inp, "control");
  fill(inp, "bg/field");
  stroke(inp, "border/field", 1.5);
  parent.appendChild(inp);
  inp.layoutSizingHorizontal = "FILL";
  const gi = icon(iconName, 18, "text/secondary");
  if (gi) inp.appendChild(gi);
  await T(inp, label, "Body/Medium", "text/secondary");
}

async function button(parent, label, style) {
  const btn = H({ align: "CENTER", justify: "CENTER", px: 20 });
  btn.primaryAxisSizingMode = "FIXED";
  btn.counterAxisSizingMode = "FIXED";
  btn.resize(311, 48);
  radius(btn, "control");
  if (style === "secondary") {
    fill(btn, "bg/surface");
    stroke(btn, "border/field", 1.5);
  } else {
    fill(btn, "brand/primary");
    if (ctx.es["shadow/brand-md"]) await btn.setEffectStyleIdAsync(ctx.es["shadow/brand-md"].id);
  }
  parent.appendChild(btn);
  btn.layoutSizingHorizontal = "FILL";
  await T(btn, label, "Label/Medium", style === "secondary" ? "text/muted" : "brand/on-primary",
          { weight: "Semi Bold" });
}

async function brandMark(parent) {
  const logo = H({ align: "CENTER", justify: "CENTER" });
  logo.primaryAxisSizingMode = "FIXED";
  logo.counterAxisSizingMode = "FIXED";
  logo.resize(72, 72);
  radius(logo, "card");
  fill(logo, "brand/primary");
  if (ctx.es["shadow/brand-lg"]) await logo.setEffectStyleIdAsync(ctx.es["shadow/brand-lg"].id);
  parent.appendChild(logo);
  const ci = icon("Car", 38, "brand/on-primary");
  if (ci) logo.appendChild(ci);
}

/* ------------------------------------------------------------- step 2 */

async function step2() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["Login", "Set password", "Suspended"]);

  // Login
  {
    const { b } = await authShell("Login", "/login", 0);
    await brandMark(b);
    gap(b, 8);
    await T(b, "Welcome back", "Heading/H1", "text/primary", { weight: "Extra Bold", align: "CENTER" });
    await T(b, "Sign in to manage your cars and routes.", "Body/Small", "text/secondary",
            { align: "CENTER", fill: true });
    gap(b, 8);
    await field(b, "Email", "Mail");
    await field(b, "Password", "Lock");
    gap(b, 4);
    await button(b, "Sign in");
  }

  // Set password
  {
    const { b } = await authShell("Set password", "/set-password", 440);
    await brandMark(b);
    gap(b, 8);
    await T(b, "Set your password", "Heading/H1", "text/primary", { weight: "Extra Bold", align: "CENTER" });
    await T(b, "You're using a temporary password. Choose your own to continue.",
            "Body/Small", "text/secondary", { align: "CENTER", fill: true });
    gap(b, 8);
    await field(b, "New password", "Lock");
    await field(b, "Confirm password", "Lock");
    gap(b, 4);
    await button(b, "Set password & continue");
  }

  // Suspended
  {
    const { b } = await authShell("Suspended", "/suspended", 880);
    const ring = H({ align: "CENTER", justify: "CENTER" });
    ring.primaryAxisSizingMode = "FIXED";
    ring.counterAxisSizingMode = "FIXED";
    ring.resize(80, 80);
    radius(ring, "full");
    fill(ring, "status/cancelled/bg");
    b.appendChild(ring);
    const ai = icon("Alert", 40, "status/cancelled/dot");
    if (ai) ring.appendChild(ai);
    gap(b, 8);
    await T(b, "Account suspended", "Heading/H1", "text/primary", { weight: "Extra Bold", align: "CENTER" });
    await T(b, "Your company's access has been suspended. Contact your administrator.",
            "Body/Small", "text/secondary", { align: "CENTER", fill: true });
    gap(b, 8);
    await button(b, "Log out", "secondary");
  }
  return "Auth: 3 screens built (Login, Set password, Suspended).";
}

/* ------------------------------------------------------------- step 3 */

async function step3() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["SA Dashboard", "Companies", "Users", "My profile"]);
  const Y = 900;

  // Dashboard
  {
    const f = await screen("SA Dashboard", "/superadmin", 0, Y);
    await adminTopBar(f, "Super admin");
    const b = body(f);
    await T(b, "Overview", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await statGrid(b, [
      ["Companies", "12", "purple/800"],
      ["Users", "48"],
      ["Villas", "128"],
      ["Active", "11", "green/600"],
    ], 2);
    await sectionTitle(b, "Companies");
    const c = await card(b, { gap: 0 });
    await listRow(c, "Gulf Shine Auto", "34 villas", { pill: ["Active", "green"] });
    await listRow(c, "Barsha Wash Co", "22 villas", { pill: ["Active", "green"] });
    await listRow(c, "Marina Detail", "8 villas", { pill: ["Suspended", "red"] });
  }

  // Companies
  {
    const f = await screen("Companies", "/superadmin/companies", 440, Y);
    await adminTopBar(f, "Super admin");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Companies", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ New", "blue");
    const rows = [
      ["Gulf Shine Auto", "34 villas · 6 cleaners", "Active", "green"],
      ["Barsha Wash Co", "22 villas · 4 cleaners", "Active", "green"],
      ["Marina Detail", "8 villas · 2 cleaners", "Suspended", "red"],
      ["JVC Sparkle", "17 villas · 3 cleaners", "Active", "green"],
    ];
    for (const [n, meta, label, tone] of rows) {
      const c = await card(b, { gap: 8 });
      const top = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
      c.appendChild(top);
      top.layoutSizingHorizontal = "FILL";
      const tx = V({ gap: 2 });
      top.appendChild(tx);
      await T(tx, n, "Heading/H3", "text/primary", { weight: "Bold" });
      await T(tx, meta, "Caption", "text/secondary");
      await pill(top, label, tone);
    }
  }

  // Users
  {
    const f = await screen("Users", "/superadmin/users", 880, Y);
    await adminTopBar(f, "Super admin");
    const b = body(f);
    await T(b, "Users", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    const groups = [
      ["Gulf Shine Auto", [["Sergi M", "sergi@carwaj.app", "Admin", "purple", "S", "dark"],
                           ["Ravi K", "ravi@gulfshine.ae", "Cleaner", "blue", "R", "blue"]]],
      ["Barsha Wash Co", [["Amina S", "amina@barsha.ae", "Admin", "purple", "A", "teal"],
                          ["Imran H", "imran@barsha.ae", "Cleaner", "blue", "I", "amber"]]],
    ];
    for (const [company, users] of groups) {
      const c = await card(b, { gap: 4 });
      const hd = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
      c.appendChild(hd);
      hd.layoutSizingHorizontal = "FILL";
      await T(hd, company, "Label/Small", "accent/superadmin/text", { weight: "Bold" });
      await T(hd, users.length + " users", "Caption", "text/secondary");
      for (const [n, mail, role, tone, ini, av] of users) {
        await listRow(c, n, mail, { pill: [role, tone] }, { avatar: [ini, av] });
      }
    }
  }

  // Profile
  {
    const f = await screen("My profile", "/superadmin/profile", 1320, Y);
    await adminTopBar(f, "Super admin");
    const b = body(f, 14);
    const c = await card(b, { gap: 10 });
    const row = H({ gap: 12, align: "CENTER" });
    c.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
    await avatar(row, "S", "dark", 56);
    const tx = V({ gap: 3 });
    row.appendChild(tx);
    await T(tx, "Sergi M", "Heading/H2", "text/primary", { weight: "Extra Bold" });
    await T(tx, "sergi@carwaj.app", "Body/Small", "text/secondary");
    const pr = H({ gap: 6 });
    c.appendChild(pr);
    await pill(pr, "Super admin", "purple");

    await sectionTitle(b, "Account");
    const c2 = await card(b, { gap: 0 });
    await listRow(c2, "Language", null, "English");
    await listRow(c2, "Password", null, "Change");
    const out = await card(b, { gap: 0 });
    await T(out, "Log out", "Label/Medium", "status/cancelled/text", { weight: "Semi Bold", align: "CENTER", fill: true });
  }
  return "Super admin: 4 screens built.";
}

/* ------------------------------------------------------------- step 4 */

async function step4() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["Admin Overview", "Employees", "Villas", "Admin Payments", "Communities"]);
  const Y = 1800;

  // Overview
  {
    const f = await screen("Admin Overview", "/admin", 0, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    await T(b, "Overview", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await statGrid(b, [
      ["Villas", "128"],
      ["Cars", "196"],
      ["Cleaners", "6", "green/600"],
      ["Due this month", "AED 42k", "amber/600"],
    ], 2);
    await sectionTitle(b, "Today");
    const c = await card(b, { gap: 0 });
    await listRow(c, "Completed", "18 jobs", { status: "completed" });
    await listRow(c, "In progress", "3 jobs", { status: "progress" });
    await listRow(c, "Scheduled", "9 jobs", { status: "scheduled" });
    await sectionTitle(b, "Communities");
    const c2 = await card(b, { gap: 0 });
    await listRow(c2, "Al Barsha", "34 villas", "AED 14,200");
    await listRow(c2, "JVC", "28 villas", "AED 11,800");
  }

  // Employees
  {
    const f = await screen("Employees", "/admin/employees", 440, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Employees", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ Add", "blue");
    const emps = [
      ["Ravi K", "ravi@gulfshine.ae", "R", "blue", "12 today"],
      ["Imran H", "imran@gulfshine.ae", "I", "amber", "9 today"],
      ["Mo A", "mo@gulfshine.ae", "M", "teal", "7 today"],
    ];
    for (const [n, mail, ini, tone, jobs] of emps) {
      const c = await card(b, { gap: 8 });
      await listRow(c, n, mail, jobs, { avatar: [ini, tone] });
    }
  }

  // Villas
  {
    const f = await screen("Villas", "/admin/villas", 880, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Villas", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ Add", "blue");
    const villas = [
      ["Villa 214", "Al Barsha · 2 cars", "AED 450"],
      ["Villa 17", "JVC · 1 car", "AED 250"],
      ["Villa 88", "Al Barsha · 3 cars", "AED 700"],
      ["Villa 42", "Springs · 2 cars", "AED 480"],
    ];
    for (const [n, meta, price] of villas) {
      const c = await card(b, { gap: 6 });
      await listRow(c, n, meta, price);
    }
  }

  // Payments
  {
    const f = await screen("Admin Payments", "/admin/payments", 1320, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    await T(b, "Payments", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await statGrid(b, [
      ["Collected", "AED 28k", "green/600"],
      ["Outstanding", "AED 14k", "amber/600"],
    ], 2);
    await sectionTitle(b, "This month");
    const c = await card(b, { gap: 0 });
    const rows = [
      ["Villa 214", "Due 5 Mar", "Paid", "green"],
      ["Villa 17", "Due 5 Mar", "Pending", "amber"],
      ["Villa 88", "Due 1 Mar", "Overdue", "red"],
      ["Villa 42", "Due 5 Mar", "Paid", "green"],
    ];
    for (const [n, due, label, tone] of rows) {
      await listRow(c, n, due, { pill: [label, tone] });
    }
  }

  // Communities
  {
    const f = await screen("Communities", "/admin/communities", 1760, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Communities", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ Add", "blue");
    const comms = [["Al Barsha", "34 villas"], ["JVC", "28 villas"],
                   ["Springs", "19 villas"], ["Marina", "11 villas"]];
    for (const [n, meta] of comms) {
      const c = await card(b, { gap: 6 });
      await listRow(c, n, meta, "›");
    }
  }
  return "Admin: 5 screens built.";
}

/* ------------------------------------------------------------- step 5 */

async function step5() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["Today", "Calendar", "Clients", "Cleaner Payments", "Profile"]);
  const Y = 2700;

  // Today
  {
    const f = await screen("Today", "/cleaner", 0, Y);
    await appHeader(f, "Carwaj");
    const b = body(f);
    await T(b, "Tuesday, 5 March", "Caption", "text/secondary");
    await T(b, "6 cars today", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await sectionTitle(b, "To do");
    const jobs = [
      ["Villa 214 · Al Barsha", "Toyota Camry · 07:00–09:00", "scheduled"],
      ["Villa 17 · JVC", "Nissan Patrol · 07:00–09:00", "progress"],
      ["Villa 88 · Al Barsha", "Kia Sportage · 09:00–11:00", "scheduled"],
    ];
    for (const [n, meta, st] of jobs) {
      const c = await card(b, { gap: 8 });
      const top = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
      c.appendChild(top);
      top.layoutSizingHorizontal = "FILL";
      const tx = V({ gap: 2 });
      top.appendChild(tx);
      await T(tx, n, "Heading/H3", "text/primary", { weight: "Bold" });
      await T(tx, meta, "Caption", "text/secondary");
      await statusBadge(top, st);
    }
    await sectionTitle(b, "Completed");
    const c2 = await card(b, { gap: 8 });
    await listRow(c2, "Villa 42 · Springs", "Honda Civic", { status: "completed" });
    await bottomNav(f, 0);
  }

  // Calendar
  {
    const f = await screen("Calendar", "/cleaner/calendar", 440, Y);
    await appHeader(f, "Carwaj");
    const b = body(f);
    await T(b, "March 2026", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    const cal = await card(b, { gap: 6 });
    const dayRow = H({ gap: 0 });
    cal.appendChild(dayRow);
    dayRow.layoutSizingHorizontal = "FILL";
    for (const d of ["S", "M", "T", "W", "T", "F", "S"]) {
      const cell = H({ justify: "CENTER" });
      dayRow.appendChild(cell);
      cell.layoutSizingHorizontal = "FILL";
      await T(cell, d, "Caption", "text/secondary", { weight: "Bold" });
    }
    let day = 1;
    for (let w = 0; w < 5; w++) {
      const row = H({ gap: 0 });
      cal.appendChild(row);
      row.layoutSizingHorizontal = "FILL";
      for (let i = 0; i < 7; i++) {
        const cell = H({ justify: "CENTER", align: "CENTER" });
        cell.primaryAxisSizingMode = "FIXED";
        cell.counterAxisSizingMode = "FIXED";
        row.appendChild(cell);
        cell.layoutSizingHorizontal = "FILL";
        cell.resize(cell.width, 38);
        if (day > 31) continue;
        const isToday = day === 5;
        const hasJob = [3, 5, 7, 10, 12, 14, 17, 19, 21, 24, 26, 28].indexOf(day) >= 0;
        if (isToday || hasJob) {
          const dot = H({ justify: "CENTER", align: "CENTER" });
          dot.primaryAxisSizingMode = "FIXED";
          dot.counterAxisSizingMode = "FIXED";
          dot.resize(30, 30);
          radius(dot, "full");
          fill(dot, isToday ? "brand/primary" : "status/completed/bg");
          cell.appendChild(dot);
          await T(dot, String(day), "Label/Small",
                  isToday ? "brand/on-primary" : "status/completed/text", { weight: "Bold" });
        } else {
          await T(cell, String(day), "Body/Small", "text/secondary");
        }
        day++;
      }
    }
    await bottomNav(f, 1);
  }

  // Clients
  {
    const f = await screen("Clients", "/cleaner/clients", 880, Y);
    await appHeader(f, "Carwaj");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Clients", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ Add", "blue");
    await sectionTitle(b, "Active · 3");
    const active = [
      ["Villa 214 · Al Barsha", "Toyota Camry", "Mon/Wed/Fri · 07:00-09:00"],
      ["Villa 17 · JVC", "Nissan Patrol", "Tue/Thu · 07:00-09:00"],
    ];
    for (const [n, car, sched] of active) {
      const c = await card(b, { gap: 8 });
      const top = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
      c.appendChild(top);
      top.layoutSizingHorizontal = "FILL";
      const tx = V({ gap: 2 });
      top.appendChild(tx);
      await T(tx, n, "Heading/H3", "text/primary", { weight: "Bold" });
      await T(tx, car, "Caption", "text/secondary");
      await pill(top, "AED 450/mo", "gray");
      const sb = H({ gap: 0 });
      c.appendChild(sb);
      await pill(sb, sched, "green");
    }
    await sectionTitle(b, "Paused · 1");
    const p = await card(b, { gap: 6 });
    await listRow(p, "Villa 9 · Marina", "Ford Explorer", { pill: ["Paused", "amber"] });
    await bottomNav(f, 2);
  }

  // Payments
  {
    const f = await screen("Cleaner Payments", "/cleaner/payments", 1320, Y);
    await appHeader(f, "Carwaj");
    const b = body(f);
    await T(b, "Payments", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await statGrid(b, [
      ["Collected", "AED 3,200", "green/600"],
      ["Due", "AED 900", "amber/600"],
    ], 2);
    await sectionTitle(b, "March");
    const c = await card(b, { gap: 0 });
    const rows = [
      ["Villa 214", "Paid 3 Mar", "AED 450"],
      ["Villa 17", "Due 5 Mar", "AED 250"],
      ["Villa 88", "Overdue 1 Mar", "AED 700"],
    ];
    for (const [n, meta, amt] of rows) await listRow(c, n, meta, amt);
    await bottomNav(f, 3);
  }

  // Profile
  {
    const f = await screen("Profile", "/cleaner/profile", 1760, Y);
    await appHeader(f, "Carwaj");
    const b = body(f, 14);
    const c = await card(b, { gap: 10 });
    const row = H({ gap: 12, align: "CENTER" });
    c.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
    await avatar(row, "R", "blue", 56);
    const tx = V({ gap: 3 });
    row.appendChild(tx);
    await T(tx, "Ravi K", "Heading/H2", "text/primary", { weight: "Extra Bold" });
    await T(tx, "Cleaner · Gulf Shine Auto", "Body/Small", "text/secondary");
    await statGrid(b, [["Jobs this month", "142", "green/600"], ["Clients", "18"]], 2);
    await sectionTitle(b, "Settings");
    const c2 = await card(b, { gap: 0 });
    await listRow(c2, "Language", null, "English");
    await listRow(c2, "Notifications", null, "On");
    const out = await card(b, { gap: 0 });
    await T(out, "Log out", "Label/Medium", "status/cancelled/text",
            { weight: "Semi Bold", align: "CENTER", fill: true });
    await bottomNav(f, 4);
  }
  return "Cleaner: 5 screens built.";
}

/* ------------------------------------------------------------- step 6 */
// Password reset flow — designed here first, then implemented in code.

async function step6() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["Forgot password", "Check your email", "New password"]);
  const Y = 3600;

  // 1. Request a reset link
  {
    const { b } = await authShell("Forgot password", "/forgot-password", 0, Y);
    await brandMark(b);
    gap(b, 8);
    await T(b, "Reset your password", "Heading/H1", "text/primary",
            { weight: "Extra Bold", align: "CENTER" });
    await T(b, "Enter the email you sign in with and we'll send you a reset link.",
            "Body/Small", "text/secondary", { align: "CENTER", fill: true });
    gap(b, 8);
    await field(b, "Email", "Mail");
    gap(b, 4);
    await button(b, "Send reset link");
    gap(b, 2);
    await T(b, "Back to sign in", "Label/Small", "brand/primary",
            { weight: "Bold", align: "CENTER", fill: true });
  }

  // 2. Confirmation that the link was sent
  {
    const { b } = await authShell("Check your email", "/forgot-password/sent", 440, Y);
    const ring = H({ align: "CENTER", justify: "CENTER" });
    ring.primaryAxisSizingMode = "FIXED";
    ring.counterAxisSizingMode = "FIXED";
    ring.resize(80, 80);
    radius(ring, "full");
    fill(ring, "brand/tint");
    b.appendChild(ring);
    const mi = icon("Mail", 38, "brand/primary");
    if (mi) ring.appendChild(mi);
    gap(b, 8);
    await T(b, "Check your email", "Heading/H1", "text/primary",
            { weight: "Extra Bold", align: "CENTER" });
    await T(b, "We sent a reset link to sergi@carwaj.app. It expires in 60 minutes.",
            "Body/Small", "text/secondary", { align: "CENTER", fill: true });
    gap(b, 10);
    await button(b, "Back to sign in", "secondary");
    gap(b, 2);
    await T(b, "Didn't get it? Resend", "Label/Small", "brand/primary",
            { weight: "Bold", align: "CENTER", fill: true });
  }

  // 3. Set the new password (reached via the emailed token)
  {
    const { b } = await authShell("New password", "/reset-password/[token]", 880, Y);
    await brandMark(b);
    gap(b, 8);
    await T(b, "Choose a new password", "Heading/H1", "text/primary",
            { weight: "Extra Bold", align: "CENTER" });
    await T(b, "Must be at least 8 characters.", "Body/Small", "text/secondary",
            { align: "CENTER", fill: true });
    gap(b, 8);
    await field(b, "New password", "Lock");
    await field(b, "Confirm password", "Lock");
    gap(b, 4);
    await button(b, "Update password");
  }

  return "Password reset: 3 screens built (request, sent, new password).";
}

/* ------------------------------------------------------- form helpers */

async function formField(parent, label, value, opts) {
  const o = opts || {};
  const wrap = V({ gap: 6 });
  wrap.fills = [];
  parent.appendChild(wrap);
  wrap.layoutSizingHorizontal = "FILL";
  await T(wrap, label, "Label/Small", "text/muted", { weight: "Bold" });

  const box = H({ align: "CENTER", px: 13 });
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "FIXED";
  box.resize(300, o.tall ? 76 : 46);
  if (o.tall) { box.counterAxisAlignItems = "MIN"; box.paddingTop = 12; }
  radius(box, "control");
  fill(box, "bg/field");
  stroke(box, "border/field", 1.5);
  wrap.appendChild(box);
  box.layoutSizingHorizontal = "FILL";
  await T(box, value, "Body/Medium", o.filled ? "text/primary" : "text/secondary");
  return wrap;
}

async function subHeader(parent, title) {
  const h = V({ gap: 4, px: 16, py: 12 });
  fill(h, "bg/surface");
  parent.appendChild(h);
  h.layoutSizingHorizontal = "FILL";
  await T(h, "‹  Back", "Caption", "brand/primary", { weight: "Bold" });
  await T(h, title, "Heading/H1", "text/primary", { weight: "Extra Bold" });
  const line = figma.createRectangle();
  line.resize(375, 1);
  fill(line, "border/subtle");
  parent.appendChild(line);
  line.layoutSizingHorizontal = "FILL";
}

async function dayPicker(parent, activeDays) {
  const row = H({ gap: 6 });
  row.fills = [];
  parent.appendChild(row);
  const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
  for (let i = 0; i < DAYS.length; i++) {
    const on = activeDays.indexOf(i) >= 0;
    const d = H({ align: "CENTER", justify: "CENTER" });
    d.primaryAxisSizingMode = "FIXED";
    d.counterAxisSizingMode = "FIXED";
    d.resize(38, 38);
    radius(d, "full");
    fill(d, on ? "brand/primary" : "bg/surface");
    if (!on) stroke(d, "border/field", 1);
    row.appendChild(d);
    await T(d, DAYS[i], "Label/Small", on ? "brand/on-primary" : "text/muted", { weight: "Bold" });
  }
}

async function primaryButton(parent, label, tone) {
  const btn = H({ align: "CENTER", justify: "CENTER", px: 20 });
  btn.primaryAxisSizingMode = "FIXED";
  btn.counterAxisSizingMode = "FIXED";
  btn.resize(300, 48);
  radius(btn, "control");
  fill(btn, tone === "danger" ? "status/cancelled/dot" : "brand/primary");
  parent.appendChild(btn);
  btn.layoutSizingHorizontal = "FILL";
  await T(btn, label, "Label/Medium", "brand/on-primary", { weight: "Semi Bold" });
  return btn;
}

/* ------------------------------------------------------------- step 7 */
// Screens that existed in the app but were never captured in Figma.

async function step7() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens([
    "Client setup", "Client setup done", "Booking detail",
    "Add client", "Add employee", "Schedule", "Add schedule", "Add community",
  ]);
  const Y = 4500;

  // ---- 1. Client setup (public, tokenised link) ----
  {
    const f = await screen("Client setup", "/onboarding/[token]", 0, Y);
    const head = V({ gap: 4, px: 16, py: 14 });
    fill(head, "bg/surface");
    f.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    const brand = H({ gap: 8, align: "CENTER" });
    brand.fills = [];
    head.appendChild(brand);
    const mark = H({ align: "CENTER", justify: "CENTER" });
    mark.primaryAxisSizingMode = "FIXED";
    mark.counterAxisSizingMode = "FIXED";
    mark.resize(30, 30);
    radius(mark, "md");
    fill(mark, "brand/primary");
    brand.appendChild(mark);
    const ci = icon("Car", 18, "brand/on-primary");
    if (ci) mark.appendChild(ci);
    await T(brand, "Carwaj", "Heading/H2", "text/primary", { weight: "Extra Bold" });
    await T(head, "Villa 214 · Al Barsha", "Body/Small", "text/secondary");

    const b = body(f, 14);
    await sectionTitle(b, "Your car(s)");
    const carCard = await card(b, { gap: 10 });
    await T(carCard, "Car 1", "Label/Small", "text/muted", { weight: "Bold" });
    await formField(carCard, "Make", "Toyota", { filled: true });
    await formField(carCard, "Model", "Camry", { filled: true });
    const two = H({ gap: 8 });
    two.fills = [];
    carCard.appendChild(two);
    two.layoutSizingHorizontal = "FILL";
    await formField(two, "Colour", "White", { filled: true });
    await formField(two, "Plate", "A 12345", { filled: true });

    const addCar = H({ align: "CENTER", justify: "CENTER", px: 16, py: 12 });
    radius(addCar, "control");
    fill(addCar, "brand/tint");
    b.appendChild(addCar);
    addCar.layoutSizingHorizontal = "FILL";
    await T(addCar, "+  Add another car", "Label/Medium", "brand/primary", { weight: "Semi Bold" });

    await sectionTitle(b, "Preferred cleaning schedule");
    const schedCard = await card(b, { gap: 10 });
    await T(schedCard, "Which days?", "Caption", "text/secondary");
    await dayPicker(schedCard, [1, 3, 5]);
    await T(schedCard, "Preferred time window", "Caption", "text/secondary");
    const times = H({ gap: 8, align: "CENTER" });
    times.fills = [];
    schedCard.appendChild(times);
    times.layoutSizingHorizontal = "FILL";
    await formField(times, "From", "07:00", { filled: true });
    await formField(times, "To", "09:00", { filled: true });

    await sectionTitle(b, "Anything else?");
    await formField(b, "Notes", "Any special instructions for your cleaner…", { tall: true });
    await primaryButton(b, "Submit details");
  }

  // ---- 2. Client setup — submitted ----
  {
    const f = await screen("Client setup done", "/onboarding/[token] · sent", 440, Y);
    const b = V({ name: "Content", gap: 10, px: 32, align: "CENTER", justify: "CENTER" });
    f.appendChild(b);
    b.layoutSizingHorizontal = "FILL";
    b.layoutSizingVertical = "FILL";

    const ring = H({ align: "CENTER", justify: "CENTER" });
    ring.primaryAxisSizingMode = "FIXED";
    ring.counterAxisSizingMode = "FIXED";
    ring.resize(80, 80);
    radius(ring, "full");
    fill(ring, "status/completed/bg");
    b.appendChild(ring);
    await T(ring, "✓", "Display", "status/completed/text", { weight: "Extra Bold" });
    gap(b, 8);
    await T(b, "Details received!", "Heading/H1", "text/primary",
            { weight: "Extra Bold", align: "CENTER" });
    await T(b, "Your cleaner will be in touch soon. You're all set.",
            "Body/Small", "text/secondary", { align: "CENTER", fill: true });
  }

  // ---- 3. Booking detail ----
  {
    const f = await screen("Booking detail", "/cleaner/booking/[id]", 880, Y);
    await appHeader(f, "Carwaj");
    const b = body(f, 12);
    await T(b, "‹  Today", "Caption", "brand/primary", { weight: "Bold" });

    const top = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    top.fills = [];
    b.appendChild(top);
    top.layoutSizingHorizontal = "FILL";
    await T(top, "Villa 214", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await statusBadge(top, "progress");

    const info = await card(b, { gap: 4 });
    await T(info, "Toyota Camry", "Heading/H3", "text/primary", { weight: "Bold" });
    await T(info, "Plate: A 12345", "Caption", "text/secondary");
    await T(info, "Owner: Mr Khalid", "Caption", "text/secondary");
    await T(info, "Al Barsha · 07:00–09:00", "Caption", "text/secondary");

    await sectionTitle(b, "After photo");
    const photo = H({ align: "CENTER", justify: "CENTER" });
    photo.primaryAxisSizingMode = "FIXED";
    photo.counterAxisSizingMode = "FIXED";
    photo.resize(300, 150);
    radius(photo, "card");
    fill(photo, "bg/subtle");
    stroke(photo, "border/card", 1);
    b.appendChild(photo);
    photo.layoutSizingHorizontal = "FILL";
    await T(photo, "No photo yet", "Body/Small", "text/secondary");

    await primaryButton(b, "Take photo");
    await primaryButton(b, "Mark completed");
  }

  // ---- 4. Add client ----
  {
    const f = await screen("Add client", "/cleaner/clients/new", 1320, Y);
    await subHeader(f, "Add client");
    const b = body(f, 14);
    await formField(b, "Villa number", "214", { filled: true });
    await formField(b, "Community", "Al Barsha", { filled: true });
    await formField(b, "Owner name", "Mr Khalid", { filled: true });
    await formField(b, "WhatsApp number", "+971 50 123 4567", { filled: true });
    await formField(b, "Monthly amount (AED)", "450", { filled: true });
    await primaryButton(b, "Add client");
  }

  // ---- 5. Add employee (current design — due to change in the onboarding rebuild) ----
  {
    const f = await screen("Add employee", "/admin/employees/new", 1760, Y);
    await subHeader(f, "Add employee");
    const b = body(f, 14);
    await formField(b, "Name", "Ravi K", { filled: true });
    await formField(b, "Email", "ravi@gulfshine.ae", { filled: true });
    await formField(b, "Temporary password", "••••••••", { filled: true });
    await formField(b, "WhatsApp number", "+971 50 987 6543", { filled: true });
    await formField(b, "Role", "Cleaner", { filled: true });
    await sectionTitle(b, "Communities");
    const comms = await card(b, { gap: 8 });
    await listRow(comms, "Al Barsha", null, "✓");
    await listRow(comms, "JVC", null, "");
    await primaryButton(b, "Add employee");
  }

  // ---- 6. Schedule ----
  {
    const f = await screen("Schedule", "/admin/schedule", 2200, Y);
    await adminTopBar(f, "Admin");
    const b = body(f);
    const head = H({ justify: "SPACE_BETWEEN", align: "CENTER" });
    head.fills = [];
    b.appendChild(head);
    head.layoutSizingHorizontal = "FILL";
    await T(head, "Schedule", "Heading/H1", "text/primary", { weight: "Extra Bold" });
    await pill(head, "+ New", "blue");
    await T(b, "This week", "Caption", "text/secondary");
    const rows = [
      ["Villa 214 · Al Barsha", "Mon/Wed/Fri · 07:00", "Ravi K"],
      ["Villa 17 · JVC", "Tue/Thu · 07:00", "Imran H"],
      ["Villa 88 · Al Barsha", "Mon/Thu · 09:00", "Mo A"],
      ["Villa 42 · Springs", "Wed/Sat · 08:00", "Ravi K"],
    ];
    const c = await card(b, { gap: 0 });
    for (const [n, when, who] of rows) await listRow(c, n, when, who);
  }

  // ---- 7. Add schedule ----
  {
    const f = await screen("Add schedule", "/admin/schedule/new", 2640, Y);
    await subHeader(f, "New schedule");
    const b = body(f, 14);
    await formField(b, "Villa", "Villa 214 · Al Barsha", { filled: true });
    await formField(b, "Car", "Toyota Camry · A 12345", { filled: true });
    await formField(b, "Cleaner", "Ravi K", { filled: true });
    await sectionTitle(b, "Cleaning days");
    await dayPicker(b, [1, 3, 5]);
    const times = H({ gap: 8, align: "CENTER" });
    times.fills = [];
    b.appendChild(times);
    times.layoutSizingHorizontal = "FILL";
    await formField(times, "From", "07:00", { filled: true });
    await formField(times, "To", "09:00", { filled: true });
    await primaryButton(b, "Create schedule");
  }

  // ---- 8. Add community ----
  {
    const f = await screen("Add community", "/admin/communities/new", 3080, Y);
    await subHeader(f, "New community");
    const b = body(f, 14);
    await formField(b, "Community name", "Al Barsha", { filled: true });
    await T(b, "Villas are assigned to a community so the office can see revenue and coverage per area.",
            "Caption", "text/secondary", { fill: true });
    await primaryButton(b, "Create community");
  }

  return "Missing screens: 8 built (client setup + done, booking detail, add client, add employee, schedule, add schedule, add community).";
}

/* ------------------------------------------------------------- step 8 */
// Public marketing landing page — desktop width, not a device frame.

async function step8() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  for (const node of ctx.screensPage.children.slice()) {
    if (node.name.indexOf("Landing page") === 0) node.remove();
  }

  const W = 1440;
  const INNER = 1152; // matches max-w-6xl on the real page

  const page = figma.createFrame();
  page.name = "Landing page  ·  /";
  page.resize(W, 100);
  page.x = 0; page.y = 5600;
  page.layoutMode = "VERTICAL";
  page.primaryAxisSizingMode = "AUTO";
  page.counterAxisSizingMode = "FIXED";
  page.itemSpacing = 0;
  fill(page, "bg/canvas");
  ctx.screensPage.appendChild(page);

  // Headings set their own font metrics rather than borrowing a text style.
  // The Display style is locked to a 28px line height, so a 60px hero title
  // rendered through it collides with its own second line.
  async function heading(parent, text, size, opts) {
    const o = opts || {};
    const t = figma.createText();
    t.fontName = { family: "Inter", style: o.weight || "Extra Bold" };
    t.characters = text;
    t.fontSize = size;
    t.lineHeight = { unit: "PIXELS", value: Math.round(size * 1.12) };
    t.letterSpacing = { unit: "PERCENT", value: -2.5 };
    parent.appendChild(t);
    t.fills = [paint(o.token || "text/primary")];
    if (o.align) t.textAlignHorizontal = o.align;
    t.layoutSizingHorizontal = "FILL";
    t.textAutoResize = "HEIGHT";
    return t;
  }

  async function para(parent, text, size, opts) {
    const o = opts || {};
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Regular" };
    t.characters = text;
    t.fontSize = size || 16.5;
    t.lineHeight = { unit: "PIXELS", value: Math.round((size || 16.5) * 1.6) };
    parent.appendChild(t);
    t.fills = [paint(o.token || "text/muted")];
    if (o.align) t.textAlignHorizontal = o.align;
    t.layoutSizingHorizontal = "FILL";
    t.textAutoResize = "HEIGHT";
    return t;
  }

  async function eyebrow(parent, text, align) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Bold" };
    t.characters = text.toUpperCase();
    t.fontSize = 13;
    t.lineHeight = { unit: "PIXELS", value: 18 };
    t.letterSpacing = { unit: "PERCENT", value: 12 };
    parent.appendChild(t);
    t.fills = [paint("brand/primary")];
    if (align) t.textAlignHorizontal = align;
    t.layoutSizingHorizontal = "FILL";
    t.textAutoResize = "HEIGHT";
    return t;
  }

  // A full-bleed colour band with a fixed-width content column inside it.
  function band(name, bgToken, padY) {
    const outer = V({ name: name, gap: 0, align: "CENTER" });
    outer.paddingTop = padY; outer.paddingBottom = padY;
    fill(outer, bgToken);
    page.appendChild(outer);
    outer.layoutSizingHorizontal = "FILL";

    const inner = V({ name: "Container", gap: 16 });
    inner.fills = [];
    inner.primaryAxisSizingMode = "AUTO";
    inner.counterAxisSizingMode = "FIXED";
    inner.resize(INNER, 10);
    outer.appendChild(inner);
    return inner;
  }

  // Left-aligned section intro, capped at ~2/3 width like max-w-2xl.
  async function sectionIntro(inner, eb, title, sub) {
    const head = V({ gap: 12 });
    head.fills = [];
    head.primaryAxisSizingMode = "AUTO";
    head.counterAxisSizingMode = "FIXED";
    inner.appendChild(head);
    head.resize(680, 10);
    await eyebrow(head, eb);
    await heading(head, title, 40);
    if (sub) await para(head, sub, 16.5);
  }

  function grid(inner, perRow, gapPx) {
    const rows = [];
    return {
      add: function (cellBuilder, index) {
        if (index % perRow === 0) {
          const r = H({ gap: gapPx });
          r.fills = [];
          inner.appendChild(r);
          r.layoutSizingHorizontal = "FILL";
          rows.push(r);
        }
        return rows[rows.length - 1];
      },
    };
  }

  async function infoCard(parent, iconName, title, bodyText, opts) {
    const o = opts || {};
    const c = V({ gap: 10, pad: 24 });
    radius(c, "card");
    fill(c, o.bg || "bg/surface");
    stroke(c, "border/default", 1);
    parent.appendChild(c);
    c.layoutSizingHorizontal = "FILL";

    if (o.number) {
      const chip = H({ align: "CENTER", justify: "CENTER" });
      chip.primaryAxisSizingMode = "FIXED";
      chip.counterAxisSizingMode = "FIXED";
      chip.resize(40, 40);
      radius(chip, "full");
      fill(chip, "text/primary");
      c.appendChild(chip);
      const n = figma.createText();
      n.fontName = { family: "Inter", style: "Bold" };
      n.characters = o.number;
      n.fontSize = 15;
      n.fills = [paint("text/inverse")];
      chip.appendChild(n);
    } else if (iconName) {
      const chip = H({ align: "CENTER", justify: "CENTER" });
      chip.primaryAxisSizingMode = "FIXED";
      chip.counterAxisSizingMode = "FIXED";
      chip.resize(44, 44);
      radius(chip, "control");
      fill(chip, o.darkChip ? "text/primary" : "brand/tint");
      c.appendChild(chip);
      const gi = icon(iconName, 22, o.darkChip ? "text/inverse" : "brand/primary");
      if (gi) chip.appendChild(gi);
    }

    await heading(c, title, 17);
    await para(c, bodyText, 14.5);
    return c;
  }

  /* ---------------------------------------------------------------- Nav */
  const nav = H({ name: "Nav", justify: "SPACE_BETWEEN", align: "CENTER", px: 144, py: 16 });
  fill(nav, "bg/canvas");
  page.appendChild(nav);
  nav.layoutSizingHorizontal = "FILL";

  const brand = H({ gap: 10, align: "CENTER" });
  brand.fills = [];
  nav.appendChild(brand);
  const mark = H({ align: "CENTER", justify: "CENTER" });
  mark.primaryAxisSizingMode = "FIXED";
  mark.counterAxisSizingMode = "FIXED";
  mark.resize(34, 34);
  radius(mark, "md");
  fill(mark, "brand/primary");
  brand.appendChild(mark);
  const navIcon = icon("Car", 20, "brand/on-primary");
  if (navIcon) mark.appendChild(navIcon);
  const brandName = figma.createText();
  brandName.fontName = { family: "Inter", style: "Extra Bold" };
  brandName.characters = "Carwaj";
  brandName.fontSize = 19;
  brandName.fills = [paint("text/primary")];
  brand.appendChild(brandName);

  const links = H({ gap: 28, align: "CENTER" });
  links.fills = [];
  nav.appendChild(links);
  for (const l of ["WhatsApp", "Features", "How it works"]) {
    const t = figma.createText();
    t.fontName = { family: "Inter", style: "Semi Bold" };
    t.characters = l;
    t.fontSize = 14.5;
    t.fills = [paint("text/muted")];
    links.appendChild(t);
  }
  const signIn = H({ align: "CENTER", justify: "CENTER", px: 18, py: 10 });
  radius(signIn, "control");
  fill(signIn, "text/primary");
  nav.appendChild(signIn);
  const signInT = figma.createText();
  signInT.fontName = { family: "Inter", style: "Semi Bold" };
  signInT.characters = "Sign in";
  signInT.fontSize = 14.5;
  signInT.fills = [paint("text/inverse")];
  signIn.appendChild(signInT);

  const navLine = figma.createRectangle();
  navLine.resize(W, 1);
  fill(navLine, "border/default");
  page.appendChild(navLine);
  navLine.layoutSizingHorizontal = "FILL";

  /* --------------------------------------------------------------- Hero */
  {
    const inner = band("Hero", "bg/canvas", 88);
    inner.counterAxisAlignItems = "CENTER";
    inner.itemSpacing = 20;

    const badge = H({ gap: 8, align: "CENTER", px: 14, py: 7 });
    radius(badge, "full");
    fill(badge, "bg/surface");
    stroke(badge, "border/default", 1);
    inner.appendChild(badge);
    const dot = figma.createEllipse();
    dot.resize(7, 7);
    fill(dot, "status/completed/dot");
    badge.appendChild(dot);
    const bt = figma.createText();
    bt.fontName = { family: "Inter", style: "Bold" };
    bt.characters = "Built for car wash companies in the UAE";
    bt.fontSize = 13;
    bt.fills = [paint("text/muted")];
    badge.appendChild(bt);

    const title = V({ gap: 0 });
    title.fills = [];
    title.primaryAxisSizingMode = "AUTO";
    title.counterAxisSizingMode = "FIXED";
    inner.appendChild(title);
    title.resize(900, 10);
    await heading(title, "Run every wash without the spreadsheet.", 58, { align: "CENTER" });

    const sub = V({ gap: 0 });
    sub.fills = [];
    sub.primaryAxisSizingMode = "AUTO";
    sub.counterAxisSizingMode = "FIXED";
    inner.appendChild(sub);
    sub.resize(720, 10);
    await para(sub, "Carwaj puts today's round in your cleaners' pockets, keeps your clients updated on WhatsApp, and shows the office what every villa is worth.", 17.5, { align: "CENTER" });

    const ctas = H({ gap: 12, align: "CENTER" });
    ctas.fills = [];
    inner.appendChild(ctas);
    const demo = H({ align: "CENTER", justify: "CENTER", px: 26, py: 14 });
    radius(demo, "control");
    fill(demo, "brand/primary");
    if (ctx.es["shadow/brand-md"]) await demo.setEffectStyleIdAsync(ctx.es["shadow/brand-md"].id);
    ctas.appendChild(demo);
    const demoT = figma.createText();
    demoT.fontName = { family: "Inter", style: "Bold" };
    demoT.characters = "Book a demo";
    demoT.fontSize = 15;
    demoT.fills = [paint("brand/on-primary")];
    demo.appendChild(demoT);

    const alt = H({ align: "CENTER", justify: "CENTER", px: 26, py: 14 });
    radius(alt, "control");
    fill(alt, "bg/surface");
    stroke(alt, "border/field", 1.5);
    ctas.appendChild(alt);
    const altT = figma.createText();
    altT.fontName = { family: "Inter", style: "Bold" };
    altT.characters = "Sign in";
    altT.fontSize = 15;
    altT.fills = [paint("text/primary")];
    alt.appendChild(altT);

    const note = figma.createText();
    note.fontName = { family: "Inter", style: "Regular" };
    note.characters = "No card needed · Set up in an afternoon";
    note.fontSize = 13;
    note.fills = [paint("text/secondary")];
    inner.appendChild(note);
  }

  /* ----------------------------------------------------------- WhatsApp */
  {
    const inner = band("WhatsApp", "bg/surface", 80);
    await sectionIntro(inner, "WhatsApp, built in", "Your clients never download anything",
      "Every update reaches the owner where they already are. Five messages go out on their own, from your company's WhatsApp Business number.");

    const chat = V({ gap: 10, pad: 22 });
    radius(chat, "card");
    fill(chat, "bg/subtle");
    stroke(chat, "border/default", 1);
    inner.appendChild(chat);
    chat.layoutSizingHorizontal = "FILL";
    const MSGS = [
      "Your car wash is scheduled for tomorrow, 07:00–09:00.",
      "Ravi is on his way to Villa 214.",
      "All done — here's the after photo.",
      "Your March payment of AED 450 is due on the 5th.",
      "Payment received. Thank you!",
    ];
    for (const m of MSGS) {
      const bubble = H({ px: 14, py: 10 });
      radius(bubble, "card");
      fill(bubble, "accent/schedule/bg");
      chat.appendChild(bubble);
      const t = figma.createText();
      t.fontName = { family: "Inter", style: "Regular" };
      t.characters = m;
      t.fontSize = 14;
      t.fills = [paint("text/primary")];
      bubble.appendChild(t);
    }
  }

  /* ------------------------------------------------------------ Screens */
  {
    const inner = band("Screens", "bg/canvas", 80);
    await sectionIntro(inner, "The app", "Four screens, nothing to learn",
      "The whole day fits under a cleaner's thumb. The whole month fits on one page.");

    const row = H({ gap: 20 });
    row.fills = [];
    inner.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
    const SCREENS = [
      ["Calendar", "Calendar", "Every day dotted by status. Tap one to see the full round, grouped by community."],
      ["User", "Clients", "Villas, owners, cars and schedules — active, paused and former kept apart."],
      ["Payments", "Payments", "Pending and paid, overdue days counted, cash or transfer in a single tap."],
    ];
    for (const [ic, title, bodyText] of SCREENS) {
      await infoCard(row, ic, title, bodyText);
    }
  }

  /* -------------------------------------------------------------- Admin */
  {
    const inner = band("Admin", "bg/surface", 80);
    await sectionIntro(inner, "For the office", "The owner sees the whole company",
      "Cleaners get a phone. Admins get a desktop dashboard — every community, every villa, every cleaner and every dirham, without ringing anyone to ask how the day went.");

    const mock = H({ gap: 16, pad: 22 });
    radius(mock, "card");
    fill(mock, "bg/subtle");
    stroke(mock, "border/default", 1);
    inner.appendChild(mock);
    mock.layoutSizingHorizontal = "FILL";
    const STATS = [
      ["Villas", "128", null],
      ["Cars", "196", null],
      ["Jobs today", "30", "green/600"],
      ["Revenue / mo", "AED 42k", "amber/600"],
    ];
    for (const [label, value, tone] of STATS) {
      const c = V({ gap: 6, pad: 18 });
      radius(c, "md");
      fill(c, "bg/surface");
      stroke(c, "border/subtle", 1);
      mock.appendChild(c);
      c.layoutSizingHorizontal = "FILL";
      const l = figma.createText();
      l.fontName = { family: "Inter", style: "Semi Bold" };
      l.characters = label.toUpperCase();
      l.fontSize = 11;
      l.letterSpacing = { unit: "PERCENT", value: 8 };
      l.fills = [paint("text/secondary")];
      c.appendChild(l);
      const v = figma.createText();
      v.fontName = { family: "Inter", style: "Extra Bold" };
      v.characters = value;
      v.fontSize = 26;
      v.fills = [tone ? paint(tone, ctx.prim) : paint("text/primary")];
      c.appendChild(v);
    }
  }

  /* ----------------------------------------------------------- Features */
  {
    const inner = band("Features", "bg/canvas", 80);
    await sectionIntro(inner, "Features", "Everything the operation needs",
      "One app for the cleaner in the field and the manager in the office.");

    const FEATURES = [
      ["Home", "Today's round, ready", "Cleaners open the app to today's list — grouped by community, with the villa, the car and the service already on it."],
      ["Car", "Photos on every wash", "Before and after, taken on the phone, compressed and uploaded in seconds. Arguments end before they start."],
      ["Clock", "Schedules that repeat themselves", "Set a subscription once — twice a week, every Tuesday, whatever they signed for — and the bookings generate ahead of time."],
      ["Payments", "Money you can see", "The monthly amount per villa, what has been collected, what is overdue and by how many days."],
      ["Card", "The office view", "Jobs today, jobs this week by community, and monthly revenue split by community and by cleaner."],
      ["User", "Every cleaner, their own patch", "Assign communities to each cleaner and they see only their villas, their round and their payments."],
    ];
    let row = null;
    for (let i = 0; i < FEATURES.length; i++) {
      if (i % 3 === 0) {
        row = H({ gap: 20 });
        row.fills = [];
        inner.appendChild(row);
        row.layoutSizingHorizontal = "FILL";
      }
      await infoCard(row, FEATURES[i][0], FEATURES[i][1], FEATURES[i][2]);
    }

    const strip = H({ gap: 20 });
    strip.fills = [];
    inner.appendChild(strip);
    strip.layoutSizingHorizontal = "FILL";
    await infoCard(strip, "Mail", "Six languages, right-to-left included",
      "English, हिन्दी, বাংলা, اردو, پنجابی and తెలుగు — your team uses the app in the language they think in.",
      { darkChip: true });
    await infoCard(strip, "Home", "Installs on any phone",
      "Add to home screen on Android or iPhone. No app store, no downloads, no IT department.",
      { darkChip: true });
  }

  /* ------------------------------------------------------- How it works */
  {
    const inner = band("How it works", "bg/surface", 80);
    await sectionIntro(inner, "How it works", "Live by the end of the week",
      "Four steps — and most of the typing isn't yours.");

    const STEPS = [
      ["1", "Map your patch", "Add the communities you cover and assign each cleaner to theirs. Ten minutes, once."],
      ["2", "Invite the client", "Send the WhatsApp link. The owner fills in their villa, their cars and the days they want washed."],
      ["3", "Let it schedule", "Bookings generate from each subscription and land on the right cleaner's day, week after week."],
      ["4", "Wash, notify, collect", "Photos go up, the owner gets a WhatsApp, the payment gets marked — and the dashboard totals it all up."],
    ];
    const row = H({ gap: 20 });
    row.fills = [];
    inner.appendChild(row);
    row.layoutSizingHorizontal = "FILL";
    for (const [n, title, bodyText] of STEPS) {
      await infoCard(row, null, title, bodyText, { number: n, bg: "bg/canvas" });
    }
  }

  /* ---------------------------------------------------------------- CTA */
  {
    const inner = band("CTA", "bg/canvas", 84);
    inner.counterAxisAlignItems = "CENTER";
    inner.itemSpacing = 18;

    const t = V({ gap: 12 });
    t.fills = [];
    t.primaryAxisSizingMode = "AUTO";
    t.counterAxisSizingMode = "FIXED";
    inner.appendChild(t);
    t.resize(760, 10);
    await heading(t, "See it on your own routes", 40, { align: "CENTER" });
    await para(t, "Tell us the communities you cover and we'll set up a demo company with your villas, so you can try it with real names and real rounds.", 16.5, { align: "CENTER" });

    const btn = H({ align: "CENTER", justify: "CENTER", px: 28, py: 15 });
    radius(btn, "control");
    fill(btn, "brand/primary");
    if (ctx.es["shadow/brand-md"]) await btn.setEffectStyleIdAsync(ctx.es["shadow/brand-md"].id);
    inner.appendChild(btn);
    const bt2 = figma.createText();
    bt2.fontName = { family: "Inter", style: "Bold" };
    bt2.characters = "Book a demo";
    bt2.fontSize = 15;
    bt2.fills = [paint("brand/on-primary")];
    btn.appendChild(bt2);
  }

  /* ------------------------------------------------------------- Footer */
  const footer = H({ name: "Footer", justify: "SPACE_BETWEEN", align: "CENTER", px: 144, py: 30 });
  fill(footer, "text/primary");
  page.appendChild(footer);
  footer.layoutSizingHorizontal = "FILL";
  const fBrand = figma.createText();
  fBrand.fontName = { family: "Inter", style: "Extra Bold" };
  fBrand.characters = "Carwaj";
  fBrand.fontSize = 18;
  fBrand.fills = [paint("text/inverse")];
  footer.appendChild(fBrand);
  const fMeta = figma.createText();
  fMeta.fontName = { family: "Inter", style: "Regular" };
  fMeta.characters = "carwaj.app · hello@carwaj.app";
  fMeta.fontSize = 13;
  fMeta.fills = [paint("text/secondary")];
  footer.appendChild(fMeta);

  // No node.screenshot() here — that is a convenience of the Figma MCP tool,
  // not the Plugin API, and calling it in a real plugin throws "not a function".
  return "Landing page rebuilt at " + W + "px: nav, hero, WhatsApp, screens, admin, 6 features + 2 strip cards, 4 steps, CTA, footer.";
}

/* ------------------------------------------------------------------ run */

const STEPS = { s1: step1, s2: step2, s3: step3, s4: step4, s5: step5, s6: step6, s7: step7, s8: step8 };

figma.showUI(__html__, { width: 320, height: 530 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "run") return;
  try {
    await boot();
    const results = [];
    const completed = [];
    const order = msg.step === "all"
      ? ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"]
      : [msg.step];
    for (const id of order) {
      results.push(await STEPS[id]());
      completed.push(id);
    }
    figma.ui.postMessage({ type: "done", text: results.join("\n"), completed });
    figma.notify("Carwaj: " + completed.length + " step(s) complete");
  } catch (e) {
    figma.ui.postMessage({ type: "error", text: String(e && e.message ? e.message : e) });
  }
};
