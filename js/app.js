
(function(){
  "use strict";

  const PAGES = {
    "home-enterprise-migration":"index.html",
    "home-cloud-native-sre":"home-2-cloud-native-sre.html",
    "home-1-enterprise-migration":"index.html",
    "home-2-cloud-native-sre":"home-2-cloud-native-sre.html",
    "home-2":"home-2-cloud-native-sre.html",
    "home-2.html":"home-2-cloud-native-sre.html",
    "index":"index.html",
    "services":"services.html",
    "case-studies":"case-studies.html",
    "technologies":"technologies.html",
    "about-leadership":"about.html",
    "contact":"contact.html"
  };

  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function applyTheme(theme){
    const html=document.documentElement;
    html.classList.toggle("light", theme==="light");
    html.classList.toggle("dark", theme==="dark");
    localStorage.setItem("stratoops-theme",theme);
    const btn=document.getElementById("theme-toggle-btn");
    if(btn){
      const icon=btn.querySelector(".material-symbols-outlined");
      if(icon) icon.textContent=theme==="dark" ? "light_mode" : "dark_mode";
      btn.setAttribute("aria-label",theme==="dark" ? "Switch to light mode" : "Switch to dark mode");
      btn.title=theme==="dark" ? "Switch to light mode" : "Switch to dark mode";
    }
  }

  function applyDirection(dir){
    document.documentElement.setAttribute("dir",dir);
    localStorage.setItem("stratoops-dir",dir);
    const btn=document.getElementById("rtl-toggle-btn");
    if(btn){
      const icon=btn.querySelector(".material-symbols-outlined");
      if(icon) icon.textContent=dir==="rtl" ? "format_textdirection_l_to_r" : "format_textdirection_r_to_l";
      btn.setAttribute("aria-label",dir==="rtl" ? "Switch to left-to-right" : "Switch to right-to-left");
      btn.title=dir==="rtl" ? "Switch to LTR" : "Switch to RTL";
    }
  }

  function getPage(path){
    return PAGES[path] || null;
  }

  function navigate(path){
    const page=getPage(path);
    if(page) window.location.href=page;
  }

  function setMobileMenuOpen(open){
    const menu=document.getElementById("strato-mobile-menu");
    const toggle=document.getElementById("strato-mobile-toggle");
    if(!menu || !toggle) return;
    menu.classList.toggle("open",open);
    toggle.setAttribute("aria-expanded",String(open));
    toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
    toggle.querySelector(".material-symbols-outlined").textContent=open?"close":"menu";
  }

  function createHomeDropdown(summaryClass){
    const dropdown=document.createElement("details");
    dropdown.className="strato-home-dropdown";

    const summary=document.createElement("summary");
    summary.className=summaryClass;
    summary.textContent="Home";
    const icon=document.createElement("span");
    icon.className="material-symbols-outlined strato-home-chevron";
    icon.textContent="keyboard_arrow_down";
    summary.appendChild(icon);
    dropdown.appendChild(summary);

    const submenu=document.createElement("div");
    submenu.className="strato-home-submenu";
    [
      ["Home 1: Enterprise Migration","index"],
      ["Home 2: Cloud Native & SRE","home-2-cloud-native-sre"]
    ].forEach(([label,path])=>{
      const link=document.createElement("a");
      link.href=PAGES[path];
      link.dataset.path=path;
      link.textContent=label;
      submenu.appendChild(link);
    });
    dropdown.appendChild(submenu);
    return dropdown;
  }

  function makeHomeDropdown(){
    const nav=document.querySelector('nav[data-active-classes]');
    const homeLink=nav && nav.querySelector('a[data-path="index"]');
    if(!homeLink) return;
    const dropdown=createHomeDropdown(homeLink.className);
    homeLink.replaceWith(dropdown);
  }

  function makeMobileMenu(){
    const nav=document.querySelector("nav");
    const header=document.querySelector("header");
    if(!header || !nav) return;

    // Build mobile button beside the existing controls.
    const controls=header.querySelector(".flex.items-center.gap-space-sm.shrink-0") || header.querySelector(".flex.items-center");
    if(controls && !document.getElementById("strato-mobile-toggle")){
      const b=document.createElement("button");
      b.id="strato-mobile-toggle";
      b.className="strato-mobile-toggle";
      b.type="button";
      b.setAttribute("aria-expanded","false");
      b.setAttribute("aria-label","Open navigation");
      b.innerHTML='<span class="material-symbols-outlined">menu</span>';
      controls.insertBefore(b,controls.firstChild);
      b.addEventListener("click",function(){
        const menu=document.getElementById("strato-mobile-menu");
        setMobileMenuOpen(!menu.classList.contains("open"));
      });
    }

    if(document.getElementById("strato-mobile-menu")) return;
    const menu=document.createElement("div");
    menu.id="strato-mobile-menu";
    menu.className="strato-mobile-menu";
    const items=[
      ["Services","services"],
      ["Case Studies","case-studies"],
      ["Technologies","technologies"],
      ["About / Leadership","about-leadership"],
      ["Contact","contact"]
    ];
    menu.appendChild(createHomeDropdown(""));
    items.forEach(([label,path])=>{
      const a=document.createElement("a");
      a.href=PAGES[path];
      a.dataset.path=path;
      a.textContent=label;
      menu.appendChild(a);
    });
    const divider=document.createElement("div");
    divider.className="mobile-divider";
    menu.appendChild(divider);
    const theme=document.createElement("a");
    theme.href="#";
    theme.dataset.action="theme";
    theme.textContent="Toggle light / dark theme";
    menu.appendChild(theme);
    const rtl=document.createElement("a");
    rtl.href="#";
    rtl.dataset.action="rtl";
    rtl.textContent="Toggle RTL / LTR";
    menu.appendChild(rtl);
    header.parentNode.insertBefore(menu,header.nextSibling);
  }

  function inferPathFromText(text){
    const t=(text||"").toLowerCase();
    if(t.includes("case stud") || t.includes("whitepaper") || t.includes("engineering repo")) return "case-studies";
    if(t.includes("technolog") || t.includes("architecture") || t.includes("stack") || t.includes("benchmark") || t.includes("reference")) return "technologies";
    if(t.includes("service") || t.includes("migration") || t.includes("kubernetes") || t.includes("terraform") || t.includes("observability") || t.includes("finops")) return "services";
    if(t.includes("about") || t.includes("leadership") || t.includes("fellow")) return "about-leadership";
    if(t.includes("contact") || t.includes("schedule") || t.includes("consult") || t.includes("audit") || t.includes("discovery") || t.includes("request") || t.includes("security") || t.includes("career")) return "contact";
    if(t.includes("home") || t.includes("strato")) return "home-enterprise-migration";
    return null;
  }

  function wireLinks(){
    document.querySelectorAll("a[data-path]").forEach(a=>{
      const page=getPage(a.dataset.path);
      if(page) a.setAttribute("href",page);
      a.addEventListener("click",function(e){
        const p=getPage(a.dataset.path);
        if(p){e.preventDefault();window.location.href=p;}
      });
    });

    // Convert meaningful placeholder CTAs to real pages.
    document.querySelectorAll('a[href="#"]:not([data-path])').forEach(a=>{
      const text=a.textContent.replace(/\s+/g," ").trim();
      const p=inferPathFromText(text);
      if(p){
        a.setAttribute("href",PAGES[p]);
        a.addEventListener("click",function(e){
          e.preventDefault();
          navigate(p);
        });
      } else {
        // Keep true UI-only placeholders from jumping to top; show a small status instead.
        a.addEventListener("click",function(e){
          e.preventDefault();
          showToast("This action is available in the StratoOps portal.");
        });
      }
    });
  }

  function showToast(message){
    let toast=document.getElementById("strato-toast");
    if(!toast){
      toast=document.createElement("div");
      toast.id="strato-toast";
      toast.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;padding:12px 16px;border-radius:8px;background:var(--surface-container-highest);color:var(--on-surface);border:1px solid var(--outline-variant);box-shadow:0 10px 30px rgba(0,0,0,.25);font:600 14px Inter,system-ui,sans-serif;";
      document.body.appendChild(toast);
    }
    toast.textContent=message;
    toast.style.opacity="1";
    clearTimeout(window.__toastTimer);
    window.__toastTimer=setTimeout(()=>toast.style.opacity="0",2400);
  }

  function wireForms(){
    document.querySelectorAll("form").forEach(form=>{
      form.addEventListener("submit",function(e){
        // If it has an explicit real action, leave it alone.
        if(form.getAttribute("action") && form.getAttribute("action")!=="#") return;
        e.preventDefault();
        const required=[...form.querySelectorAll("[required]")];
        const invalid=required.find(el=>!String(el.value||"").trim());
        if(invalid){
          invalid.focus();
          showToast("Please complete the required fields.");
          return;
        }
        form.reset();
        showToast("Request submitted successfully. Our team will get back to you.");
      });
    });
  }

  function standardizeFooters(){
    const companyLinks=[
      ["About & Executive Leadership","about-leadership"],
      ["Engineering Case Studies","case-studies"],
      ["Tech Stack & Architecture Benchmarks","technologies"],
      ["Enterprise Security & Compliance","contact"],
      ["Careers & SRE Fellowships","about-leadership"]
    ];
    const socialLinks=[
      ["LinkedIn","https://www.linkedin.com/","M5.4 7.3a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2ZM3.6 9h3.6v12H3.6zm5.8 0h3.4v1.6h.1c.5-.9 1.7-1.9 3.5-1.9 3.7 0 4.4 2.4 4.4 5.5V21h-3.6v-6c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9.4V9z"],
      ["X","https://x.com/","M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.6 5.6 22H2.5l7.3-8.4L1.8 2h6.5l4.5 6.8L18.9 2Zm-1.1 18h1.7L7.3 3.9H5.5L17.8 20Z"],
      ["GitHub","https://github.com/","M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.8 2.1 3.4 1.5.1-.8.5-1.3.9-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.5.4.9 1.1.9 2.2V22c0 .3.2.6.8.5A11.1 11.1 0 0 0 12 .9Z"]
    ];

    document.querySelectorAll("footer").forEach(footer=>{
      footer.classList.add("mt-auto");
      const columns=footer.querySelector(".grid");
      const companyColumn=columns?.children[2];
      const companyList=companyColumn?.querySelector("ul");
      if(companyList){
        companyList.replaceChildren(...companyLinks.map(([label,path])=>{
          const item=document.createElement("li");
          item.className="hover:text-on-surface transition-colors";
          const link=document.createElement("a");
          link.dataset.path=path;
          link.href=PAGES[path];
          link.textContent=label;
          item.appendChild(link);
          return item;
        }));
      }

      const brandColumn=columns?.children[0];
      if(!brandColumn) return;
      const brandLockup=brandColumn.querySelector(":scope > div");
      if(brandLockup && !brandColumn.querySelector(".strato-footer-brand")){
        const brandLink=document.createElement("a");
        brandLink.className=brandLockup.className+" strato-footer-brand";
        brandLink.href=PAGES["home-enterprise-migration"];
        brandLink.setAttribute("aria-label","StratoOps home");
        brandLink.title="StratoOps home";
        while(brandLockup.firstChild) brandLink.appendChild(brandLockup.firstChild);
        brandLockup.replaceWith(brandLink);
      }
      if(brandColumn.querySelector(".strato-footer-socials")) return;
      const socials=document.createElement("div");
      socials.className="strato-footer-socials";
      socials.setAttribute("role","group");
      socials.setAttribute("aria-label","Social media");
      socialLinks.forEach(([label,url,path])=>{
        const link=document.createElement("a");
        link.href=url;
        link.target="_blank";
        link.rel="noopener noreferrer";
        link.setAttribute("aria-label",label);
        link.title=label;
        link.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="'+path+'"/></svg>';
        socials.appendChild(link);
      });
      brandColumn.appendChild(socials);
    });
  }

  function boot(){
    const favicon=document.createElement("link");
    favicon.rel="icon";
    favicon.type="image/svg+xml";
    favicon.href=new URL("assets/favicon.svg",document.baseURI).href;
    document.head.appendChild(favicon);

    const savedTheme=localStorage.getItem("stratoops-theme") || "dark";
    const savedDir=localStorage.getItem("stratoops-dir") || "ltr";
    applyTheme(savedTheme);
    applyDirection(savedDir);

    const themeBtn=document.getElementById("theme-toggle-btn");
    if(themeBtn){
      themeBtn.removeAttribute("onclick");
      themeBtn.addEventListener("click",()=>applyTheme(document.documentElement.classList.contains("light")?"dark":"light"));
    }

    const rtlBtn=document.getElementById("rtl-toggle-btn");
    if(rtlBtn){
      rtlBtn.removeAttribute("onclick");
      rtlBtn.addEventListener("click",()=>applyDirection(document.documentElement.getAttribute("dir")==="rtl"?"ltr":"rtl"));
    }

    makeHomeDropdown();
    makeMobileMenu();
    standardizeFooters();
    wireLinks();
    wireForms();

    // Update active navigation.
    const nav = document.querySelector('nav[data-active-classes]');
    const activeClasses = nav ? nav.getAttribute('data-active-classes').split(' ') : ['text-primary', 'font-semibold'];

    document.querySelectorAll("a[data-path]").forEach(a=>{
      if(a.dataset.path && PAGES[a.dataset.path]===currentFile){
        a.setAttribute("aria-current","page");
        if(a.parentElement === nav) {
          a.classList.remove('opacity-80', 'text-on-surface');
          a.classList.add(...activeClasses);
        }
        const homeDropdown=a.closest(".strato-home-dropdown");
        if(homeDropdown){
          const summary=homeDropdown.querySelector("summary");
          summary.classList.remove("opacity-80","text-on-surface");
          summary.classList.add(...activeClasses);
        }
      }
    });

    // Close mobile menu after navigation click.
    document.querySelectorAll("#strato-mobile-menu a[data-path]").forEach(a=>{
      a.addEventListener("click",()=>setMobileMenuOpen(false));
    });
    document.querySelector('#strato-mobile-menu a[data-action="theme"]')?.addEventListener("click",e=>{
      e.preventDefault(); applyTheme(document.documentElement.classList.contains("light")?"dark":"light");
      setMobileMenuOpen(false);
    });
    document.querySelector('#strato-mobile-menu a[data-action="rtl"]')?.addEventListener("click",e=>{
      e.preventDefault(); applyDirection(document.documentElement.getAttribute("dir")==="rtl"?"ltr":"rtl");
      setMobileMenuOpen(false);
    });
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
