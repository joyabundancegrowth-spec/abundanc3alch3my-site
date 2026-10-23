(function(){
var API="https://teardown-checkout.joyabundancegrowth.workers.dev/start";
var LINK="https://buy.stripe.com/3cIeVd5T63q578qfQ2cQU04";
var css=".tdc-ov{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(6px)}.tdc-ov.on{display:flex}"+
".tdc{position:relative;width:100%;max-width:480px;border:2px solid var(--card-edge);border-radius:var(--radius-sm);background:var(--ground);background-image:var(--sheen);padding:clamp(1.5rem,4vw,2.25rem);color:var(--ink);box-shadow:0 30px 80px rgba(118,33,176,.35)}"+
".tdc h2{margin:.4rem 0 .6rem;font-family:var(--kanit);font-weight:900;text-transform:uppercase;letter-spacing:-.02em;line-height:.95;font-size:clamp(1.5rem,4vw,2rem)}"+
".tdc p{margin:0 0 1.1rem;font-family:var(--newsreader);font-size:1.05rem;line-height:1.45;color:var(--ink-muted)}"+
".tdc label{display:block;margin:0 0 .9rem;font-family:var(--kanit);font-weight:500;text-transform:uppercase;letter-spacing:.1em;font-size:.78rem}"+
".tdc input{display:block;width:100%;margin-top:.4rem;padding:.85rem 1.1rem;border:2px solid var(--card-edge);border-radius:9999px;background:#111216;color:#fff;font:400 1rem var(--kanit);letter-spacing:0;text-transform:none}"+
".tdc input:focus{outline:none;border-color:#BBCCD7}.tdc .btn{width:100%;margin-top:.4rem;border:0}.tdc-x{position:absolute;top:10px;right:16px;background:none;border:0;color:var(--ink-muted);font-size:28px;line-height:1;cursor:pointer}"+
".tdc-err{min-height:1.2em;margin:.6rem 0 0;font:400 .9rem var(--kanit);color:#FF9DB5}.tdc-fine{margin:.9rem 0 0!important;font-size:.9rem!important}.tdc-hp{position:absolute;left:-9999px}";
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
var ov=document.createElement("div");ov.className="tdc-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-labelledby","tdc-h");
ov.innerHTML='<form class="tdc" novalidate><button type="button" class="tdc-x" aria-label="Close">&times;</button>'+
'<p class="audit-kicker">$49 · Delivered within 24 hours</p><h2 id="tdc-h">Which page should I tear down?</h2>'+
'<p>Two quick things, then you\u2019ll pay securely on Stripe.</p>'+
'<label>Your email<input type="email" name="email" autocomplete="email" required placeholder="you@company.com"></label>'+
'<label>Landing page URL<input type="text" name="page_url" inputmode="url" autocomplete="url" required placeholder="yourcompany.com"></label>'+
'<input class="tdc-hp" type="text" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true">'+
'<button class="btn btn-primary" type="submit">Continue to payment</button><p class="tdc-err" role="alert"></p>'+
'<p class="tdc-fine">Full refund within 7 days if it isn\u2019t useful. Checkout is processed by Stripe.</p></form>';
document.body.appendChild(ov);
var f=ov.querySelector("form"),err=ov.querySelector(".tdc-err"),btn=f.querySelector("[type=submit]"),last;
function open(e){e.preventDefault();last=e.currentTarget;ov.classList.add("on");setTimeout(function(){f.email.focus()},30)}
function close(){ov.classList.remove("on");if(last)last.focus()}
[].forEach.call(document.querySelectorAll('[data-stripe-offer="teardown"]'),function(a){a.addEventListener("click",open)});
ov.querySelector(".tdc-x").addEventListener("click",close);
ov.addEventListener("click",function(e){if(e.target===ov)close()});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&ov.classList.contains("on"))close()});
f.addEventListener("submit",function(e){e.preventDefault();err.textContent="";
var em=f.email.value.trim(),u=f.page_url.value.trim();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){err.textContent="Please enter a valid email.";f.email.focus();return}
if(!/\./.test(u)){err.textContent="Please enter your landing page URL.";f.page_url.focus();return}
btn.disabled=true;btn.textContent="Opening checkout\u2026";
var fb=LINK+"?prefilled_email="+encodeURIComponent(em);
fetch(API,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:em,page_url:u,company_website:f.company_website.value})})
.then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d}})})
.then(function(x){if(x.ok&&x.d.url){location.href=x.d.url}else if(x.d&&x.d.error){err.textContent=x.d.error;btn.disabled=false;btn.textContent="Continue to payment"}else{location.href=fb}})
.catch(function(){location.href=fb});});
})();
