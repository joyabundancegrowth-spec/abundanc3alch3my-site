(function(){
if(window.__bhAuditPop)return;window.__bhAuditPop=1;
var WA="https://wa.me/15037377842?text=Hi%20Brandon%2C%20I%27d%20love%20a%20free%20Clarity%20Audit.%20Sending%20you%20a%20voice%20note%20about%20my%20business.";
var KEY="bhAuditPopSeen";
try{if(localStorage.getItem(KEY)&&Date.now()-+localStorage.getItem(KEY)<7*864e5)return;}catch(e){}
var css=".bhov{position:fixed;inset:0;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;z-index:99999;padding:20px;font-family:Kanit,sans-serif}.bhov.on{display:flex}.bhpop{position:relative;background:#15161A;color:#fff;border:1px solid #2a2c33;border-radius:22px;max-width:440px;width:100%;padding:32px;box-shadow:0 30px 80px rgba(118,33,176,.35);font-weight:300;line-height:1.5}.bhpop h3{font-size:28px;line-height:1.1;margin:10px 0;font-weight:600;color:#fff}.bhpop p{color:#A9B7C2;margin:8px 0}.bhtag{display:inline-block;border:1px solid #2a2c33;border-radius:999px;padding:5px 12px;color:#A9B7C2;font-size:13px}.bhx{position:absolute;top:12px;right:16px;background:none;border:0;color:#A9B7C2;font-size:26px;cursor:pointer}.bhwa{display:block;text-align:center;background:#25D366;color:#06210f;border-radius:999px;padding:15px 24px;font-weight:600;font-size:17px;text-decoration:none;margin-top:14px}.bhmore{display:block;text-align:center;color:#A9B7C2;font-size:14px;margin-top:14px;text-decoration:underline}";
var s=document.createElement("style");s.textContent=css;document.head.appendChild(s);
var ov=document.createElement("div");ov.className="bhov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","Free Clarity Audit");
ov.innerHTML='<div class="bhpop"><button class="bhx" aria-label="Close">&times;</button><span class="bhtag">Free &middot; 20 minutes</span><h3>Want a second set of eyes on your business?</h3><p>20 minutes. I\'ll show you 6 things you can do this week to earn more.</p><a class="bhwa" href="'+WA+'" target="_blank" rel="noopener">&#127897;&#65039; Send me a voice note</a><p style="font-size:14px">Tap, hit the mic, and tell me in 1-2 minutes what your business is and where you\'re stuck. I listen to every one personally.</p><a class="bhmore" href="/audit/">See how the free audit works</a></div>';
document.body.appendChild(ov);
var shown=false;function show(){if(shown)return;shown=true;ov.classList.add("on");try{localStorage.setItem(KEY,Date.now())}catch(e){}}
function hide(){ov.classList.remove("on")}
ov.querySelector(".bhx").onclick=hide;ov.onclick=function(e){if(e.target===ov)hide()};document.addEventListener("keydown",function(e){if(e.key==="Escape")hide()});
window.bhShowAuditPopup=show;
setTimeout(show,8000);
document.addEventListener("mouseout",function(e){if(!e.relatedTarget&&e.clientY<5)show()});
})();
