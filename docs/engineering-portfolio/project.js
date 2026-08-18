const projects = window.PORTFOLIO_PROJECTS;
const id = new URLSearchParams(location.search).get("id");
const project = projects.find(item => item.id === id) || projects[0];
const escapeHtml = value => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

document.documentElement.style.setProperty("--accent", project.color);
document.documentElement.style.setProperty("--wash", `${project.color}22`);
document.title = `${project.title} | Guy Eden`;

const colors = ["blue", "violet", "pink", "amber", "green"];
const stats = project.stats.map(([value, label], index) =>
  `<div class="stat" style="--c:var(--${colors[index % colors.length]})"><b>${value}</b><span>${label}</span></div>`).join("");
const nodes = project.nodes.map(([title, detail], index) =>
  `<div class="node ${colors[index]}${index === project.nodes.length - 1 ? " last" : ""}"><b>${title}</b><small>${detail}</small></div>`).join("");
const decisions = project.decisions.map(([title, detail], index) =>
  `<article class="card" style="--c:var(--${colors[index % colors.length]})"><h2>${title}</h2><p>${detail}</p></article>`).join("");
const timelineColors = {
  sync: ["#38d7c4", "syncArrow"],
  async: ["#aa8cff", "asyncArrow"],
  store: ["#ffc857", "storeArrow"],
  callback: ["#f478b8", "callbackArrow"],
  return: ["#55dc86", "returnArrow"]
};
function renderTimeline(spec) {
  if (!spec) return "";
  const width = 1120;
  const left = 65;
  const right = 65;
  const top = 24;
  const headerY = 48;
  const lifeStart = 98;
  const rowHeight = 48;
  const height = lifeStart + spec.messages.length * rowHeight + 52;
  const gap = (width - left - right) / (spec.participants.length - 1);
  const positions = spec.participants.map((_, index) => left + index * gap);
  const defs = Object.entries(timelineColors).map(([name, [color, marker]]) =>
    `<marker id="${marker}-${project.id}" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="${color}"/></marker>`).join("");
  const participants = spec.participants.map(([name, detail], index) => {
    const x = positions[index];
    const colorClass = colors[index % colors.length];
    return `<rect class="service-shape" x="${x - 63}" y="${headerY}" width="126" height="48" rx="9"/><text class="participant" x="${x}" y="${headerY + 20}" text-anchor="middle">${escapeHtml(name)}</text><text class="sub" x="${x}" y="${headerY + 35}" text-anchor="middle">${escapeHtml(detail)}</text><line class="life" x1="${x}" y1="${headerY + 48}" x2="${x}" y2="${height - 24}"/><circle cx="${x}" cy="${headerY + 48}" r="3" fill="var(--${colorClass})"/>`;
  }).join("");
  const messages = spec.messages.map(([from, to, label, kind], index) => {
    const y = lifeStart + 28 + index * rowHeight;
    const x1 = positions[from];
    const x2 = positions[to];
    const direction = x2 >= x1 ? 1 : -1;
    const start = x1 + direction * 6;
    const end = x2 - direction * 8;
    const [color, marker] = timelineColors[kind] || timelineColors.sync;
    const labelX = (x1 + x2) / 2;
    const anchor = from === to ? "start" : "middle";
    const self = from === to
      ? `<path d="M ${x1} ${y} h 32 v 22 h -25" fill="none" stroke="${color}" stroke-width="2" marker-end="url(#${marker}-${project.id})"/>`
      : `<line x1="${start}" y1="${y}" x2="${end}" y2="${y}" stroke="${color}" stroke-width="2"${kind === "return" ? ' stroke-dasharray="6 4"' : ""} marker-end="url(#${marker}-${project.id})"/>`;
    return `${self}<rect x="${from === to ? x1 + 38 : labelX - 82}" y="${y - 18}" width="164" height="17" rx="7" fill="#071019" opacity=".9"/><text class="msg" x="${from === to ? x1 + 43 : labelX}" y="${y - 6}" text-anchor="${anchor}">${escapeHtml(label)}</text>`;
  }).join("");
  return `<section class="sequence generic-sequence"><h2>${escapeHtml(spec.title)}</h2><p>${escapeHtml(spec.description)}</p><div class="sequence-scroll"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(spec.title)}"><defs>${defs}</defs>${participants}${messages}</svg></div><div class="sequence-legend"><span style="--legend:#38d7c4">direct call</span><span style="--legend:#aa8cff">asynchronous handoff</span><span style="--legend:#ffc857">persistent state</span><span style="--legend:#f478b8">event / callback</span><span style="--legend:#55dc86">return / completion</span></div></section>`;
}
const orchestratorPipelines = project.id === "distributed-orchestrator" ? `
  <section class="branch-diagram">
    <h2>Three orchestration paths</h2>
    <p>The same front door selects a synchronous response path for short operations, a durable asynchronous path for long-running work, or a partitioned path for workloads that must fan out and reconcile.</p>
    <div class="branch" style="--branch:var(--cyan)">
      <div class="branch-label">SYNC</div>
      <div class="branch-flow">
        <div class="bnode"><b>Client request</b><small>HTTP request</small></div><div class="barrow">→</div>
        <div class="bnode"><b>O2 Orchestrator</b><small>validate + route</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Request Translator</b><small>domain → engine</small></div><div class="barrow">→</div>
        <div class="bnode"><b>External Engine</b><small>another team's service</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Response Translator</b><small>engine → domain</small></div><div class="barrow">→</div>
        <div class="bnode"><b>HTTP response</b><small>same request cycle</small></div>
      </div>
    </div>
    <div class="branch" style="--branch:var(--violet)">
      <div class="branch-label">ASYNC</div>
      <div class="branch-flow">
        <div class="bnode"><b>Client request</b><small>long-running job</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Persist + enqueue</b><small>durable state</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Fetch + Translate</b><small>worker stage</small></div><div class="barrow">→</div>
        <div class="bnode"><b>External Engine</b><small>artifact URLs</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Completion Callback</b><small>resume anywhere</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Translate + Writeback</b><small>durable finish</small></div>
      </div>
    </div>
    <div class="branch" style="--branch:var(--pink)">
      <div class="branch-label">PARTITIONED</div>
      <div class="branch-flow">
        <div class="bnode"><b>Parent request</b><small>large workload</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Prepare once</b><small>fetch + translate</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Partition</b><small>create child jobs</small></div><div class="barrow">⇉</div>
        <div class="bnode"><b>Parallel engine pool</b><small>independent chunks</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Child completion</b><small>translate + write back</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Parent reconcile</b><small>aggregate + close</small></div>
      </div>
    </div>
    <div class="branch-note"><div><b>Sync path:</b> lowest coordination overhead for operations expected to finish inside one HTTP lifecycle.</div><div><b>Async path:</b> queues and object storage absorb long duration, retries, process loss, and independent stage scaling.</div><div><b>Partitioned path:</b> one prepared workload becomes independently completing children; readiness is based on complete evidence, not child order.</div></div>
  </section>` : "";
const orchestratorSequence = project.id === "distributed-orchestrator" ? `
  <section class="sequence">
    <h2>Container and service timeline</h2>
    <p>Embedded SVG sequence diagrams show the synchronous request cycle and the durable asynchronous lifecycle across pods, microservices, queues, object storage, the external engine, callbacks, and writeback. The partitioned lifecycle is shown separately below because it adds parent-child fan-out and evidence-based fan-in.</p>
    <div class="sequence-scroll">
      <svg viewBox="0 0 1240 1160" role="img" aria-labelledby="orchestrator-sequence-title orchestrator-sequence-desc">
        <title id="orchestrator-sequence-title">O2 Orchestrator synchronous and asynchronous sequence timelines</title>
        <desc id="orchestrator-sequence-desc">Sequence diagram with client, orchestrator pods, request translator, fetch service, object storage, request queue, external engine, response queue, response translator, writeback queue and update worker.</desc>
        <defs>
          <marker id="syncArrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#38d7c4"/></marker>
          <marker id="asyncArrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#aa8cff"/></marker>
          <marker id="storeArrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#ffc857"/></marker>
          <marker id="callbackArrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#f478b8"/></marker>
          <marker id="returnArrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#55dc86"/></marker>
        </defs>

        <text x="24" y="29" class="phase" fill="#38d7c4">SYNC · ONE HTTP LIFECYCLE</text>
        <g transform="translate(15 48)">
          <rect class="service-shape" x="0" y="0" width="112" height="49" rx="9"/><text class="participant" x="56" y="21" text-anchor="middle">Client</text><text class="sub" x="56" y="36" text-anchor="middle">caller</text>
          <rect class="service-shape" x="145" y="0" width="132" height="49" rx="9"/><text class="participant" x="211" y="21" text-anchor="middle">Orchestrator A</text><text class="sub" x="211" y="36" text-anchor="middle">ingress pod</text>
          <rect class="service-shape" x="310" y="0" width="130" height="49" rx="9"/><text class="participant" x="375" y="21" text-anchor="middle">Request DTS</text><text class="sub" x="375" y="36" text-anchor="middle">translator pod</text>
          <rect class="service-shape" x="473" y="0" width="118" height="49" rx="9"/><text class="participant" x="532" y="21" text-anchor="middle">FDS</text><text class="sub" x="532" y="36" text-anchor="middle">data pod</text>
          <rect class="external-shape" x="624" y="0" width="130" height="49" rx="9"/><text class="participant" x="689" y="21" text-anchor="middle">External Engine</text><text class="sub" x="689" y="36" text-anchor="middle">other team</text>
          <rect class="service-shape" x="787" y="0" width="138" height="49" rx="9"/><text class="participant" x="856" y="21" text-anchor="middle">Response DTS</text><text class="sub" x="856" y="36" text-anchor="middle">translator pod</text>
          <rect class="service-shape" x="958" y="0" width="132" height="49" rx="9"/><text class="participant" x="1024" y="21" text-anchor="middle">Orchestrator A</text><text class="sub" x="1024" y="36" text-anchor="middle">same request</text>

          <line class="life" x1="56" y1="49" x2="56" y2="353"/><line class="life" x1="211" y1="49" x2="211" y2="353"/><line class="life" x1="375" y1="49" x2="375" y2="353"/><line class="life" x1="532" y1="49" x2="532" y2="353"/><line class="life" x1="689" y1="49" x2="689" y2="353"/><line class="life" x1="856" y1="49" x2="856" y2="353"/><line class="life" x1="1024" y1="49" x2="1024" y2="353"/>
          <rect class="activation" x="204" y="77" width="14" height="250" rx="4"/>
          <line class="sync" x1="56" y1="84" x2="204" y2="84" marker-end="url(#syncArrow)"/><text class="msg" x="130" y="76" text-anchor="middle">1 · HTTP request</text>
          <line class="sync" x1="218" y1="122" x2="368" y2="122" marker-end="url(#syncArrow)"/><text class="msg" x="293" y="114" text-anchor="middle">2 · translate request</text>
          <line class="sync" x1="218" y1="160" x2="525" y2="160" marker-end="url(#syncArrow)"/><text class="msg" x="371" y="152" text-anchor="middle">3 · fetch domain data</text>
          <line class="return" x1="525" y1="194" x2="218" y2="194" marker-end="url(#returnArrow)"/><text class="msg" x="371" y="186" text-anchor="middle">4 · data response</text>
          <line class="sync" x1="218" y1="230" x2="682" y2="230" marker-end="url(#syncArrow)"/><text class="msg" x="450" y="222" text-anchor="middle">5 · optimize synchronously</text>
          <line class="return" x1="682" y1="264" x2="849" y2="264" marker-end="url(#returnArrow)"/><text class="msg" x="765" y="256" text-anchor="middle">6 · engine result</text>
          <line class="return" x1="849" y1="298" x2="218" y2="298" marker-end="url(#returnArrow)"/><text class="msg" x="533" y="290" text-anchor="middle">7 · translated domain response</text>
          <line class="return" x1="204" y1="330" x2="56" y2="330" marker-end="url(#returnArrow)"/><text class="msg" x="130" y="322" text-anchor="middle">8 · HTTP response</text>
        </g>

        <line x1="24" y1="443" x2="1216" y2="443" stroke="#29415a" stroke-width="1"/>
        <text x="24" y="478" class="phase" fill="#aa8cff">ASYNC · DURABLE MULTI-CONTAINER LIFECYCLE</text>
        <g transform="translate(5 496)">
          <rect class="service-shape" x="0" y="0" width="92" height="49" rx="9"/><text class="participant" x="46" y="21" text-anchor="middle">Client</text><text class="sub" x="46" y="36" text-anchor="middle">caller</text>
          <rect class="service-shape" x="112" y="0" width="118" height="49" rx="9"/><text class="participant" x="171" y="21" text-anchor="middle">Orchestrator A</text><text class="sub" x="171" y="36" text-anchor="middle">ingress pod</text>
          <path class="store-shape" d="M252 7 C252 0 337 0 337 7 L337 42 C337 50 252 50 252 42 Z"/><ellipse class="store-shape" cx="294.5" cy="7" rx="42.5" ry="7"/><text class="participant" x="294" y="25" text-anchor="middle">S3</text><text class="sub" x="294" y="39" text-anchor="middle">artifacts</text>
          <path class="queue-shape" d="M359 7 C359 0 444 0 444 7 L444 42 C444 50 359 50 359 42 Z"/><ellipse class="queue-shape" cx="401.5" cy="7" rx="42.5" ry="7"/><text class="participant" x="401" y="25" text-anchor="middle">Request Q</text><text class="sub" x="401" y="39" text-anchor="middle">SQS</text>
          <rect class="service-shape" x="466" y="0" width="118" height="49" rx="9"/><text class="participant" x="525" y="21" text-anchor="middle">Orchestrator B</text><text class="sub" x="525" y="36" text-anchor="middle">worker pod</text>
          <rect class="service-shape" x="606" y="0" width="106" height="49" rx="9"/><text class="participant" x="659" y="21" text-anchor="middle">DTS + FDS</text><text class="sub" x="659" y="36" text-anchor="middle">microservices</text>
          <rect class="external-shape" x="734" y="0" width="116" height="49" rx="9"/><text class="participant" x="792" y="21" text-anchor="middle">External Engine</text><text class="sub" x="792" y="36" text-anchor="middle">other team</text>
          <rect class="service-shape" x="872" y="0" width="118" height="49" rx="9"/><text class="participant" x="931" y="21" text-anchor="middle">Orchestrator C</text><text class="sub" x="931" y="36" text-anchor="middle">callback pod</text>
          <path class="queue-shape" d="M1012 7 C1012 0 1097 0 1097 7 L1097 42 C1097 50 1012 50 1012 42 Z"/><ellipse class="queue-shape" cx="1054.5" cy="7" rx="42.5" ry="7"/><text class="participant" x="1054" y="25" text-anchor="middle">Response Q</text><text class="sub" x="1054" y="39" text-anchor="middle">SQS</text>
          <rect class="service-shape" x="1119" y="0" width="106" height="49" rx="9"/><text class="participant" x="1172" y="21" text-anchor="middle">Update worker</text><text class="sub" x="1172" y="36" text-anchor="middle">writeback pod</text>

          <line class="life" x1="46" y1="49" x2="46" y2="594"/><line class="life" x1="171" y1="49" x2="171" y2="594"/><line class="life" x1="294" y1="49" x2="294" y2="594"/><line class="life" x1="401" y1="49" x2="401" y2="594"/><line class="life" x1="525" y1="49" x2="525" y2="594"/><line class="life" x1="659" y1="49" x2="659" y2="594"/><line class="life" x1="792" y1="49" x2="792" y2="594"/><line class="life" x1="931" y1="49" x2="931" y2="594"/><line class="life" x1="1054" y1="49" x2="1054" y2="594"/><line class="life" x1="1172" y1="49" x2="1172" y2="594"/>
          <rect class="activation" x="164" y="70" width="14" height="115" rx="4"/><rect class="activation" x="518" y="214" width="14" height="174" rx="4"/><rect class="activation" x="924" y="398" width="14" height="98" rx="4"/><rect class="activation" x="1165" y="519" width="14" height="63" rx="4"/>

          <line class="async" x1="46" y1="79" x2="164" y2="79" marker-end="url(#asyncArrow)"/><text class="msg" x="105" y="71" text-anchor="middle">1 · long job</text>
          <line class="storage" x1="178" y1="111" x2="287" y2="111" marker-end="url(#storeArrow)"/><text class="msg" x="232" y="103" text-anchor="middle">2 · persist request</text>
          <line class="async" x1="178" y1="143" x2="394" y2="143" marker-end="url(#asyncArrow)"/><text class="msg" x="286" y="135" text-anchor="middle">3 · enqueue workflow identity</text>
          <line class="return" x1="164" y1="174" x2="46" y2="174" marker-end="url(#returnArrow)"/><text class="msg" x="105" y="166" text-anchor="middle">4 · HTTP 202</text>
          <line class="async" x1="408" y1="224" x2="518" y2="224" marker-end="url(#asyncArrow)"/><text class="msg" x="463" y="216" text-anchor="middle">5 · dequeue</text>
          <line class="storage" x1="518" y1="256" x2="301" y2="256" marker-end="url(#storeArrow)"/><text class="msg" x="409" y="248" text-anchor="middle">6 · read request</text>
          <line class="async" x1="532" y1="290" x2="652" y2="290" marker-end="url(#asyncArrow)"/><text class="msg" x="592" y="282" text-anchor="middle">7 · fetch + translate</text>
          <line class="storage" x1="652" y1="322" x2="301" y2="322" marker-end="url(#storeArrow)"/><text class="msg" x="476" y="314" text-anchor="middle">8 · write engine input</text>
          <line class="async" x1="532" y1="357" x2="785" y2="357" marker-end="url(#asyncArrow)"/><text class="msg" x="658" y="349" text-anchor="middle">9 · submit presigned URLs + callback</text>
          <line class="callback" x1="785" y1="408" x2="924" y2="408" marker-end="url(#callbackArrow)"/><text class="msg" x="854" y="400" text-anchor="middle">10 · completion callback</text>
          <line class="storage" x1="924" y1="440" x2="301" y2="440" marker-end="url(#storeArrow)"/><text class="msg" x="612" y="432" text-anchor="middle">11 · resolve result artifact</text>
          <line class="async" x1="938" y1="473" x2="1047" y2="473" marker-end="url(#asyncArrow)"/><text class="msg" x="992" y="465" text-anchor="middle">12 · enqueue result</text>
          <line class="async" x1="1061" y1="529" x2="1165" y2="529" marker-end="url(#asyncArrow)"/><text class="msg" x="1113" y="521" text-anchor="middle">13 · dequeue</text>
          <line class="storage" x1="1165" y1="560" x2="301" y2="560" marker-end="url(#storeArrow)"/><text class="msg" x="733" y="552" text-anchor="middle">14 · read translated payload / persist final status</text>
          <text class="msg" x="1172" y="591" text-anchor="middle" fill="#55dc86">15 · durable writeback</text>
        </g>
      </svg>
    </div>
    <div class="sequence-legend"><span style="--legend:#38d7c4">synchronous call</span><span style="--legend:#aa8cff">queue / asynchronous handoff</span><span style="--legend:#ffc857">S3 artifact I/O</span><span style="--legend:#f478b8">external callback</span><span style="--legend:#55dc86">response / completion</span></div>
  </section>` : "";
const projectTimeline = renderTimeline(project.timeline);
const projectShowcase = project.id === "sketch-dashboard" ? `
  <section class="product-gallery">
    <h2>From hand sketch to generated dashboards</h2>
    <p>The original sketch describes a two-level adoption dashboard: three broad asynchronous metric tables above six narrower synchronous metric tables. The generated dashboards preserve that hierarchy and extend the same compiler path to a denser telemetry use case. Organization identifiers, internal labels, hosts, and operational values are replaced with synthetic data.</p>
    <div class="gallery-grid">
      <figure class="shot sketch-source" style="--shot:var(--violet)"><div class="shot-visual"><img src="sketch2dash-hand-sketch.jpeg" alt="Hand-drawn adoption dashboard with three large asynchronous tables and six smaller synchronous tables"></div><figcaption><h3>1 · Handwritten layout</h3><p>The drawing establishes the dashboard title, a three-column asynchronous row, and a six-column synchronous row with organization rankings.</p></figcaption></figure>
      <figure class="shot" style="--shot:var(--green)"><div class="shot-visual"><img src="sketch2dash-result.svg" alt="Generated top-organization adoption dashboard matching the hand sketch"></div><figcaption><h3>2 · Direct compiled result</h3><p>The generated dashboard maps each sketched panel to a real table: three wide asynchronous metrics above six compact synchronous metrics.</p></figcaption></figure>
      <figure class="shot wide" style="--shot:var(--cyan)"><div class="shot-visual"><img src="sketch2dash-pft-result.svg" alt="Generated feature telemetry dashboard with filters, totals, time series, analytics, and top-contributor tables"></div><figcaption><h3>3 · Extended telemetry result</h3><p>The same spec-and-compiler approach scales to filters, aggregate cards, a multi-series time chart, rule analytics, and dense contributor rankings.</p></figcaption></figure>
    </div>
  </section>` : project.id === "transaction-laboratory" ? `
  <section class="product-gallery transaction-gallery">
    <h2>Transaction laboratory in practice</h2>
    <p>These public-safe reconstructions preserve the product's real interaction patterns while replacing transaction paths, organization identifiers, environments, dates, versions, and operational values with synthetic data.</p>
    <div class="gallery-grid">
      <figure class="shot wide" style="--shot:var(--blue)"><div class="shot-visual"><img src="tl-transaction-browser.svg" alt="Synthetic Transaction Loader browser listing anonymized captures and loaded data-volume summaries"></div><figcaption><h3>Acquire and select a trace</h3><p>Searchable local and anonymized collections retain provenance, workflow shape, notes, version labels, and entity summaries without exposing customer payloads.</p></figcaption></figure>
      <figure class="shot wide" style="--shot:var(--pink)"><div class="shot-visual"><img src="tl-chunk-timeline.svg" alt="Synthetic partition timeline showing five child jobs completing out of order"></div><figcaption><h3>Explain partition timing</h3><p>The Backstage timeline aligns preparation with independently completing engine partitions, translation, writeback, and a synchronized duration view.</p></figcaption></figure>
      <figure class="shot wide" style="--shot:var(--cyan)"><div class="shot-visual"><img src="tl-kpi-inspector.svg" alt="Synthetic computed KPI panel for a five-partition optimization transaction"></div><figcaption><h3>Compute domain KPIs</h3><p>Artifact-specific panels summarize schedule horizon, resources, appointments, territories, task outcomes, and assignment quality across the complete result.</p></figcaption></figure>
      <figure class="shot wide" style="--shot:var(--violet)"><div class="shot-visual"><img src="tl-environment-compare.svg" alt="Synthetic matrix for selecting environment pairs for orchestrator comparison"></div><figcaption><h3>Compare execution targets</h3><p>A capability matrix makes supported local and shared-environment comparisons explicit before launching a synthetic probe or a full replay.</p></figcaption></figure>
    </div>
  </section>` : project.id === "pr-babysit-agent" ? `
  <section class="capability-section">
    <h2>What the supervisor takes off the engineer's plate</h2>
    <p>The value is not merely polling CI. Each card is a distinct diagnostic or delivery responsibility with its own evidence source, safe action, verification, and stop condition.</p>
    <div class="capability-grid">
      ${[
        ["Review-bot comments", "Classifies each finding as actionable or informational, fixes what is real, replies with the fixing revision, and closes only the automated review conversation."],
        ["Human reviewer comments", "Fixes or acknowledges each comment and ties the response to a revision; ambiguous requests are escalated rather than guessed."],
        ["Coverage gates", "Reads the exact failed condition and adds the smallest focused test that covers the new lines instead of over-engineering a broad suite."],
        ["Compile errors", "Reads the actual build evidence or reproduces the full compile-test-format gate locally; never infers a cause from a generic red status."],
        ["Failing unit tests", "Locates the failing method and assertion, inspects the code under test before a second attempt, repairs the cause, and reruns the targeted suite."],
        ["Duplication findings", "Refactors avoidable token-pattern duplication first; narrowly excludes only structurally unavoidable generated or registry patterns with a rationale."],
        ["Formatting violations", "Runs the repository formatter, commits the resulting delta, and verifies formatting again before every push."],
        ["Branch drift", "Merges the base with an explicitly auditable supervisor-tagged commit; real logic conflicts are aborted and handed to a human."],
        ["Dependency chains", "Recognizes when a downstream PR is waiting on an upstream library revision, pauses wasteful retries, and resumes after publication."],
        ["Stuck or flaky CI", "Retriggers only after proving the failure is environmental and no build is already pending; an unreadable red plus a clean local build becomes a blocker, not a guess."],
        ["Self-review gaps", "Runs an independent local code review before green to catch logic, naming, edge-case, and exception-handling gaps that automated review missed."],
        ["Progress visibility", "Maintains one activity thread per PR with every fix, retrigger, reply, blocked state, timeout, and final green verdict."],
        ["External branch pushes", "Detects a new head revision, clears stale in-flight work, and resumes against the latest branch without losing durable state."],
        ["Non-negotiable safety", "Never amends or rewrites history, caps repeated attempts, tags every autonomous commit, and refuses genuine conflict resolution without a human."],
        ["Work-item lifecycle", "Moves linked delivery tracking forward at green and merge while preserving states already selected by people or release automation."],
        ["Post-merge verification", "Routes runtime changes to QA and schedules a follow-up; closes non-runtime changes through an auditable multi-step transition."]
      ].map(([title, detail], index) => `<article class="capability" style="--c:var(--${colors[index % colors.length]})"><div class="capability-no">${String(index + 1).padStart(2, "0")}</div><h3>${title}</h3><p>${detail}</p></article>`).join("")}
    </div>
  </section>
  <section class="branch-diagram">
    <h2>Two durable cadence engines</h2>
    <p>Both engines use the same state and verdict model. Their difference is who owns the wait between evidence changes.</p>
    <div class="branch" style="--branch:var(--blue)"><div class="branch-label">LIVE</div><div class="branch-flow"><div class="bnode"><b>Launch</b><small>mechanical preflight</small></div><div class="barrow">→</div><div class="bnode"><b>Supervisor</b><small>detached agent</small></div><div class="barrow">→</div><div class="bnode"><b>Blocking watch</b><small>stays alive</small></div><div class="barrow">→</div><div class="bnode"><b>Fix inline</b><small>same context</small></div><div class="barrow">→</div><div class="bnode"><b>Report</b><small>chat + activity feed</small></div></div></div>
    <div class="branch" style="--branch:var(--violet)"><div class="branch-label">UNATTENDED</div><div class="branch-flow"><div class="bnode"><b>Register</b><small>OS task</small></div><div class="barrow">→</div><div class="bnode"><b>Read state</b><small>one fresh tick</small></div><div class="barrow">→</div><div class="bnode"><b>Run cycle</b><small>can delegate fix</small></div><div class="barrow">→</div><div class="bnode"><b>Persist + exit</b><small>no overlap</small></div><div class="barrow">→</div><div class="bnode"><b>Re-fire</b><small>until terminal</small></div></div></div>
  </section>` : project.id === "distributed-orchestrator" ? `
  <section class="product-gallery">
    <h2>Transaction span atlas</h2>
    <p>The supplied archive was used as a detailed source for all three lifecycle diagrams. It remains outside the public folder because it includes internal product names, field names, source paths, identifiers, thresholds, and operational contracts.</p>
    <div class="gallery-grid">
      <figure class="shot" style="--shot:var(--cyan)"><div class="shot-visual"><svg viewBox="0 0 700 394" role="img" aria-label="Synchronous transaction span summary"><rect width="700" height="394" fill="#07111f"/><text x="28" y="42" fill="#39d98a" font-family="Inter,Segoe UI,sans-serif" font-size="15" font-weight="800">SYNCHRONOUS SPAN</text><text x="28" y="76" fill="#e9f1ff" font-family="Inter,Segoe UI,sans-serif" font-size="28" font-weight="800">One blocking request / response</text><g font-family="Inter,Segoe UI,sans-serif" text-anchor="middle"><g transform="translate(28 125)"><rect width="105" height="64" rx="11" fill="#122a42" stroke="#58a6ff"/><text x="52" y="28" fill="#fff" font-size="12" font-weight="700">Caller</text><text x="52" y="46" fill="#9fb0c8" font-size="10">HTTP</text></g><text x="150" y="160" fill="#39d98a" font-size="20">→</text><g transform="translate(171 125)"><rect width="105" height="64" rx="11" fill="#122a42" stroke="#58a6ff"/><text x="52" y="28" fill="#fff" font-size="12" font-weight="700">Orchestrator</text><text x="52" y="46" fill="#9fb0c8" font-size="10">same pod</text></g><text x="293" y="160" fill="#39d98a" font-size="20">→</text><g transform="translate(314 125)"><rect width="105" height="64" rx="11" fill="#132c32" stroke="#38d7c4"/><text x="52" y="28" fill="#fff" font-size="12" font-weight="700">Data + DTS</text><text x="52" y="46" fill="#9fb0c8" font-size="10">microservices</text></g><text x="436" y="160" fill="#39d98a" font-size="20">→</text><g transform="translate(457 125)"><rect width="105" height="64" rx="11" fill="#302037" stroke="#f478b8"/><text x="52" y="28" fill="#fff" font-size="12" font-weight="700">Engine</text><text x="52" y="46" fill="#9fb0c8" font-size="10">external</text></g><text x="579" y="160" fill="#39d98a" font-size="20">→</text><g transform="translate(600 125)"><rect width="72" height="64" rx="11" fill="#123128" stroke="#55dc86"/><text x="36" y="28" fill="#fff" font-size="12" font-weight="700">Reply</text><text x="36" y="46" fill="#9fb0c8" font-size="10">same call</text></g></g><rect x="28" y="231" width="644" height="106" rx="13" fill="#0e2034" stroke="#29415e"/><text x="49" y="265" fill="#e9f1ff" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="700">Critical-path properties</text><text x="49" y="294" fill="#9fb0c8" font-family="Inter,Segoe UI,sans-serif" font-size="12">No queue detachment · no completion callback · no writeback worker</text><text x="49" y="319" fill="#9fb0c8" font-family="Inter,Segoe UI,sans-serif" font-size="12">Internal parallel fetch is joined before the original HTTP response returns.</text></svg></div><figcaption><h3>Synchronous chapter</h3><p>Establishes the service vocabulary and blocking caller contract before introducing durable handoffs.</p></figcaption></figure>
      <figure class="shot" style="--shot:var(--violet)"><div class="shot-visual"><svg viewBox="0 0 700 394" role="img" aria-label="Asynchronous transaction span summary"><rect width="700" height="394" fill="#07111f"/><text x="28" y="42" fill="#aa8cff" font-family="Inter,Segoe UI,sans-serif" font-size="15" font-weight="800">ASYNCHRONOUS SPAN</text><text x="28" y="76" fill="#e9f1ff" font-family="Inter,Segoe UI,sans-serif" font-size="28" font-weight="800">Durable, callback-driven lifecycle</text><g font-family="Inter,Segoe UI,sans-serif" text-anchor="middle"><g transform="translate(25 125)"><rect width="92" height="64" rx="11" fill="#122a42" stroke="#58a6ff"/><text x="46" y="28" fill="#fff" font-size="12" font-weight="700">Ingress</text><text x="46" y="46" fill="#9fb0c8" font-size="10">pod A</text></g><text x="128" y="160" fill="#aa8cff" font-size="20">→</text><g transform="translate(145 125)"><rect width="92" height="64" rx="11" fill="#261d3d" stroke="#aa8cff"/><text x="46" y="28" fill="#fff" font-size="12" font-weight="700">Queue</text><text x="46" y="46" fill="#9fb0c8" font-size="10">detach</text></g><text x="248" y="160" fill="#ffc857" font-size="20">→</text><g transform="translate(265 125)"><rect width="92" height="64" rx="11" fill="#382d18" stroke="#ffc857"/><text x="46" y="28" fill="#fff" font-size="12" font-weight="700">S3</text><text x="46" y="46" fill="#9fb0c8" font-size="10">artifacts</text></g><text x="368" y="160" fill="#aa8cff" font-size="20">→</text><g transform="translate(385 125)"><rect width="92" height="64" rx="11" fill="#302037" stroke="#f478b8"/><text x="46" y="28" fill="#fff" font-size="12" font-weight="700">Engine</text><text x="46" y="46" fill="#9fb0c8" font-size="10">external</text></g><text x="488" y="160" fill="#f478b8" font-size="20">→</text><g transform="translate(505 125)"><rect width="92" height="64" rx="11" fill="#122a42" stroke="#58a6ff"/><text x="46" y="28" fill="#fff" font-size="12" font-weight="700">Callback</text><text x="46" y="46" fill="#9fb0c8" font-size="10">pod C</text></g><text x="608" y="160" fill="#55dc86" font-size="20">→</text><g transform="translate(625 125)"><rect width="55" height="64" rx="11" fill="#123128" stroke="#55dc86"/><text x="27" y="28" fill="#fff" font-size="10" font-weight="700">Write</text><text x="27" y="46" fill="#9fb0c8" font-size="9">back</text></g></g><rect x="28" y="231" width="644" height="106" rx="13" fill="#0e2034" stroke="#29415e"/><text x="49" y="265" fill="#e9f1ff" font-family="Inter,Segoe UI,sans-serif" font-size="14" font-weight="700">Durability properties</text><text x="49" y="294" fill="#9fb0c8" font-family="Inter,Segoe UI,sans-serif" font-size="12">Queue boundaries absorb duration and retries; object storage owns large state.</text><text x="49" y="319" fill="#9fb0c8" font-family="Inter,Segoe UI,sans-serif" font-size="12">Any healthy callback pod can resume the workflow and drive durable writeback.</text></svg></div><figcaption><h3>Asynchronous chapter</h3><p>Shows queues, S3 data-plane boundaries, reverse callback, independent pods, and final writeback.</p></figcaption></figure>
    </div>
  </section>` : "";
const orchestratorPartitioned = project.id === "distributed-orchestrator" ? `
  <section class="product-gallery partitioned-gallery" id="partitioned-lifecycle">
    <h2>Partitioned fan-out / fan-in</h2>
    <p>A large parent workload is prepared once, divided into child jobs, and processed concurrently by an externally owned engine. Each child persists a durable terminal outcome; the complete outcome set, not a guessed final ordinal, triggers aggregate metrics and parent reconciliation.</p>
    <div class="gallery-grid">
      <figure class="shot wide" style="--shot:var(--pink)">
        <div class="shot-visual">
          <svg viewBox="0 0 900 440" role="img" aria-labelledby="partitioned-span-title partitioned-span-desc">
            <title id="partitioned-span-title">Partitioned transaction fan-out and fan-in summary</title>
            <desc id="partitioned-span-desc">A parent request is prepared once, divided into child jobs, processed by a parallel external engine pool, completed independently, and reconciled only after every expected child has a durable terminal outcome.</desc>
            <rect width="900" height="440" fill="#07111f"/>
            <text x="30" y="42" fill="#f478b8" font-family="Inter,Segoe UI,sans-serif" font-size="15" font-weight="800">PARTITIONED SPAN</text>
            <text x="30" y="78" fill="#e9f1ff" font-family="Inter,Segoe UI,sans-serif" font-size="29" font-weight="800">Parent / child fan-out with evidence-based fan-in</text>
            <g font-family="Inter,Segoe UI,sans-serif" text-anchor="middle">
              <g transform="translate(28 122)"><rect width="118" height="68" rx="11" fill="#122a42" stroke="#58a6ff"/><text x="59" y="29" fill="#fff" font-size="12" font-weight="700">Parent request</text><text x="59" y="48" fill="#9fb0c8" font-size="10">prepare once</text></g>
              <text x="163" y="161" fill="#f478b8" font-size="21">→</text>
              <g transform="translate(181 122)"><rect width="118" height="68" rx="11" fill="#3a2037" stroke="#f478b8"/><text x="59" y="29" fill="#fff" font-size="12" font-weight="700">Partitioner</text><text x="59" y="48" fill="#9fb0c8" font-size="10">create N children</text></g>
              <text x="316" y="161" fill="#f478b8" font-size="21">⇉</text>
              <g transform="translate(337 102)"><rect width="128" height="48" rx="10" fill="#302037" stroke="#ffc857"/><text x="64" y="21" fill="#fff" font-size="12" font-weight="700">External engine A</text><text x="64" y="37" fill="#9fb0c8" font-size="9">independent</text><rect y="57" width="128" height="48" rx="10" fill="#302037" stroke="#ffc857"/><text x="64" y="78" fill="#fff" font-size="12" font-weight="700">External engine B</text><text x="64" y="94" fill="#9fb0c8" font-size="9">independent</text><rect y="114" width="128" height="48" rx="10" fill="#302037" stroke="#ffc857"/><text x="64" y="135" fill="#fff" font-size="12" font-weight="700">External engine N</text><text x="64" y="151" fill="#9fb0c8" font-size="9">any arrival order</text></g>
              <text x="483" y="161" fill="#55dc86" font-size="21">→</text>
              <g transform="translate(502 102)"><rect width="136" height="48" rx="10" fill="#123128" stroke="#55dc86"/><text x="68" y="21" fill="#fff" font-size="12" font-weight="700">Complete child B</text><text x="68" y="37" fill="#9fb0c8" font-size="9">translate + commit</text><rect y="57" width="136" height="48" rx="10" fill="#123128" stroke="#55dc86"/><text x="68" y="78" fill="#fff" font-size="12" font-weight="700">Complete child A</text><text x="68" y="94" fill="#9fb0c8" font-size="9">translate + commit</text><rect y="114" width="136" height="48" rx="10" fill="#123128" stroke="#55dc86"/><text x="68" y="135" fill="#fff" font-size="12" font-weight="700">Complete child N</text><text x="68" y="151" fill="#9fb0c8" font-size="9">final arrival</text></g>
              <text x="656" y="161" fill="#38d7c4" font-size="21">→</text>
              <g transform="translate(676 122)"><rect width="194" height="68" rx="11" fill="#132c32" stroke="#38d7c4"/><text x="97" y="29" fill="#fff" font-size="12" font-weight="700">Parent reconciliation</text><text x="97" y="48" fill="#9fb0c8" font-size="10">aggregate evidence + status</text></g>
            </g>
            <g font-family="Inter,Segoe UI,sans-serif"><rect x="30" y="302" width="840" height="102" rx="14" fill="#0d1c2b" stroke="#29415a"/><text x="52" y="331" fill="#f478b8" font-size="12" font-weight="800">CORRECTNESS INVARIANT</text><text x="52" y="358" fill="#c8d5e5" font-size="13">Each child persists one terminal outcome; ordinal position does not determine completion.</text><text x="52" y="382" fill="#c8d5e5" font-size="13">The parent closes after every expected outcome exists; successful children also contribute result metrics.</text></g>
          </svg>
        </div>
        <figcaption><h3>Out-of-order completion is normal</h3><p>Child B can finish before child A. The final terminal arrival reconciles the complete success, failure, and abort outcome set; result metrics are aggregated for successful children.</p></figcaption>
      </figure>
    </div>
    <div class="branch-note partitioned-steps"><div><b>1. Prepare:</b> fetch and translate the parent workload once.</div><div><b>2. Fan out:</b> create child identities and submit partitions to the externally owned engine.</div><div><b>3. Complete:</b> translate and persist each child independently, including terminal failures and aborts.</div><div><b>4. Fan in:</b> reconcile only when every expected child has one durable terminal outcome.</div></div>
  </section>` : "";
const orchestratorSelfHealing = project.id === "distributed-orchestrator" ? `
  <section class="branch-diagram">
    <h2>From poisoned process to pod replacement</h2>
    <p>Singleton clients normally improve reuse, but a permanently shut-down connection pool can leave a process alive while every future request through that client fails. The health architecture turns that hidden failure into an orchestration decision.</p>
    <div class="branch" style="--branch:var(--pink)">
      <div class="branch-label">DETECT</div>
      <div class="branch-flow">
        <div class="bnode"><b>HTTP / S3 / SQS</b><small>shared clients</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Pool adapter</b><small>is shut down?</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Health registry</b><small>one typed signal</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Liveness fails</b><small>process is impaired</small></div><div class="barrow">→</div>
        <div class="bnode"><b>Pod replaced</b><small>fresh client pools</small></div>
      </div>
    </div>
    <div class="branch-note"><div><b>Shared abstraction:</b> native HTTP managers and AWS SDK clients register behind the same pool-health contract.</div><div><b>Failure boundary:</b> a closed pool is treated as process-level corruption, not a transient request error.</div><div><b>Recovery owner:</b> Kubernetes replaces the unhealthy pod; business handlers do not attempt unsafe singleton reconstruction.</div></div>
  </section>` : "";

document.querySelector("#project").innerHTML = `
  <a class="back" href="index.html">← Engineering portfolio</a>
  <header class="hero">
    <div class="kicker">${project.category}</div>
    <h1>${project.title.replace(/(O2|Dual-Schema|Generated|Session|Transaction|AI|Investigation|Claudio|Browser|Cross-Service|Sketch2Dash|Multi-Repository|PR Babysit)/, "<em>$1</em>")}</h1>
    <p class="lede">${project.summary}</p>
    <div class="role">${project.role.toUpperCase()}</div>
  </header>
  <section class="stats">${stats}</section>
  <section class="diagram">
    <div class="diagram-head"><h2>Architecture at a glance</h2><p>A generalized reconstruction using synthetic names and data.</p></div>
    <div class="map">${nodes}</div>
  </section>
  ${orchestratorPipelines}
  ${orchestratorSequence}
  ${projectTimeline}
  ${projectShowcase}
  ${orchestratorPartitioned}
  ${orchestratorSelfHealing}
  <section class="grid">${decisions}</section>
  <section class="example">
    <div class="example-head"><h2>Concrete example</h2><p>Illustrative public-safe code that communicates the interface and flow without reproducing proprietary source.</p></div>
    <div class="code-grid">
      <div class="snippet violet"><div class="snippet-title">Contract / input</div><pre><code>${escapeHtml(project.codeA)}</code></pre></div>
      <div class="snippet cyan"><div class="snippet-title">Caller / behavior</div><pre><code>${escapeHtml(project.codeB)}</code></pre></div>
    </div>
    <p class="note">${project.note}</p>
  </section>
  <div class="quote">${project.interview}</div>
  <div class="disclaimer">Generalized reconstruction of work I initiated, designed, or led; names, examples, data, and topology have been changed to protect confidential information.</div>
  <footer><span>Guy Eden · Engineering portfolio · Synthetic public edition</span><span class="foot-links"><a href="mailto:edenguy@gmail.com">edenguy@gmail.com</a><a href="https://www.linkedin.com/in/geden" target="_blank" rel="noopener">linkedin.com/in/geden</a></span></footer>`;
