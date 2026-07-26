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

/* ------------------------------------------------------------- step 2 */

async function step2() {
  await figma.setCurrentPageAsync(ctx.screensPage);
  clearScreens(["Login", "Set password", "Suspended"]);

  async function authShell(name, route, x) {
    const f = await screen(name, route, x, 0);
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

/* ------------------------------------------------------------------ run */

const STEPS = { s1: step1, s2: step2, s3: step3, s4: step4, s5: step5 };

figma.showUI(__html__, { width: 320, height: 430 });

figma.ui.onmessage = async (msg) => {
  if (msg.type !== "run") return;
  try {
    await boot();
    const results = [];
    const completed = [];
    const order = msg.step === "all" ? ["s1", "s2", "s3", "s4", "s5"] : [msg.step];
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
