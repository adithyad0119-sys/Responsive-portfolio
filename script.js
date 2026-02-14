const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

const menuBtn = $("#menuBtn");
const menu = $("#menu");

if (menuBtn && menu) {
  menuBtn.onclick = () => {
    const open = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  };
  $$(".link").forEach(a => a.onclick = () => {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded","false");
  });
}

// active nav on scroll
const sections = $$("section[id]");
const links = $$(".link");
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  });
}, { rootMargin: "-60px 0px -60% 0px", threshold: 0.1 });
sections.forEach(s => obs.observe(s));

// filter + search
const filterBtns = $$(".fbtn");
const cards = $$("#projectsGrid .project");
const search = $("#search");
let active = "all";

function applyFilters(){
  const q = (search.value||"").trim().toLowerCase();
  cards.forEach(c => {
    const tags = (c.dataset.tags||"").toLowerCase().split(/\s+/);
    const title = (c.dataset.title||"").toLowerCase();
    c.style.display = ((active==="all"||tags.includes(active)) && (!q||title.includes(q))) ? "" : "none";
  });
}
filterBtns.forEach(b => b.onclick = () => {
  filterBtns.forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  active = b.dataset.filter;
  applyFilters();
});
if (search) search.oninput = applyFilters;

// modal
const modal = $("#modal"), mClose = $("#mClose");
const mTitle = $("#mTitle"), mDesc = $("#mDesc"), mStack = $("#mStack");
const mLive = $("#mLive"), mCode = $("#mCode");
let lastFocus=null;

function openModal(card){
  lastFocus = document.activeElement;
  mTitle.textContent = card.dataset.title || "Project";
  mDesc.textContent = card.dataset.desc || "";
  mStack.innerHTML = "";
  (card.dataset.stack||"").split(",").filter(Boolean).forEach(s=>{
    const t=document.createElement("span"); t.className="tag"; t.textContent=s.trim(); mStack.appendChild(t);
  });
  mLive.href = card.dataset.live || "#";
  mCode.href = card.dataset.code || "#";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  mClose && mClose.focus();
  document.body.style.overflow="hidden";
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
  lastFocus && lastFocus.focus();
}
cards.forEach(c => {
  c.onclick = () => openModal(c);
  c.onkeydown = (e) => { if (e.key==="Enter"||e.key===" ") { e.preventDefault(); openModal(c); } };
});
modal && (modal.onclick = (e) => { if (e.target && e.target.hasAttribute("data-close")) closeModal(); });
mClose && (mClose.onclick = closeModal);
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape" && modal.classList.contains("open")) closeModal(); });

// contact validation
const form = $("#form"), status = $("#status");
const err = (id,msg="") => { const el=document.querySelector(`.err[data-for="${id}"]`); if(el) el.textContent=msg; };
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

if (form) form.onsubmit = (e) => {
  e.preventDefault();
  status.textContent = "";
  err("name"); err("email"); err("msg");

  const name = $("#name").value.trim();
  const email = $("#email").value.trim();
  const msg = $("#msg").value.trim();

  let ok = true;
  if (name.length < 2) { err("name","Enter at least 2 characters."); ok=false; }
  if (!validEmail(email)) { err("email","Enter a valid email."); ok=false; }
  if (msg.length < 10) { err("msg","Message should be at least 10 characters."); ok=false; }

  if (!ok) { status.textContent="Fix errors and try again."; return; }

  const to="you@email.com", subject="Portfolio Contact";
  const body=`Name: ${name}\nEmail: ${email}\n\n${msg}`;
  location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent="Opening your email client…";
};

// year
$("#year").textContent = new Date().getFullYear();
