/* --- GIỌNG NÓI CHÀO MỪNG --- */
const welcomeVoice = new Audio("./assets/music/cam-on.mp3");
welcomeVoice.volume = 1;
let voicePlayed = false;

function playWelcomeVoice() {
    if (voicePlayed) return;
    voicePlayed = true;                    // chặn phát lặp
    welcomeVoice.play().catch(() => {
        voicePlayed = false;               // bị chặn thì chờ lần bấm sau
    });
}

// 1) Thử phát ngay khi vào web (một số trình duyệt cho phép)
playWelcomeVoice();

// 2) Nếu bị chặn, phát ở lần bấm/chạm/gõ phím đầu tiên
["click", "touchstart", "keydown"].forEach(ev => {
    document.addEventListener(ev, function handler() {
        playWelcomeVoice();
        if (voicePlayed) document.removeEventListener(ev, handler);
    }, { passive: true });
});
/* --- HẾT PHẦN GIỌNG NÓI --- */

/* --- TIỆN ÍCH: ĐẾM LƯỢT XEM + LỜI CHÀO THEO GIỜ & THIẾT BỊ --- */
(function () {
    // ====== CẤU HÌNH ======
    var COUNTER_NS = "ddanhvn25-profile";   // đặt tên riêng, không trùng người khác
    var COUNTER_KEY = "visits";
    var RECOUNT_AFTER_MS = 6 * 60 * 60 * 1000; // F5 liên tục không tính thêm, 6 giờ sau mới tính lại
    var GREETING_VISIBLE_MS = 5000;  // mỗi thông báo hiện bao lâu
    var STAGGER_MS = 700;            // khoảng cách giữa các thông báo
    // =======================

    var BASE = "https://api.counterapi.dev/v1/" + COUNTER_NS + "/" + COUNTER_KEY;

    function init() {
        var css = document.createElement("style");
    css.textContent =
        "#view-count{position:fixed;z-index:2147482990;color:var(--nq-fg);" +
        "font:500 13px/1.4 system-ui,'Be Vietnam Pro',sans-serif;" +
        "background:var(--nq-pill);backdrop-filter:blur(8px);box-shadow:var(--nq-shadow);" +
        "top:calc(12px + env(safe-area-inset-top,0px));left:12px;padding:6px 12px;border-radius:999px}" +
        "#view-count[hidden]{display:none}" +
        "#greet-stack{position:fixed;z-index:2147482990;top:calc(16px + env(safe-area-inset-top,0px));" +
        "left:50%;transform:translateX(-50%);width:min(360px,calc(100vw - 32px));" +
        "display:flex;flex-direction:column;gap:8px;pointer-events:none}" +
        ".greet-item{padding:11px 16px;border-radius:14px;color:var(--nq-fg);" +
        "font:500 14px/1.45 system-ui,'Be Vietnam Pro',sans-serif;" +
        "background:var(--nq-bg);backdrop-filter:blur(8px);box-shadow:var(--nq-shadow);" +
        "opacity:0;transform:translateY(-10px);transition:opacity .35s,transform .35s}" +
        ".greet-item.show{opacity:1;transform:none}" +
        ".greet-item.first{font-weight:700;font-size:15px}" +
        "@media (prefers-reduced-motion:reduce){.greet-item{transition:none}}";
        document.head.appendChild(css);

        // ---------- ĐẾM LƯỢT XEM ----------
        var pill = document.createElement("div");
        pill.id = "view-count";
        pill.hidden = true;
        pill.setAttribute("aria-label", "Lượt xem");
        document.body.appendChild(pill);

        var last = 0;
        try { last = parseInt(localStorage.getItem("td_last_hit"), 10) || 0; } catch (e) {}
        var shouldCount = Date.now() - last > RECOUNT_AFTER_MS;

        fetch(shouldCount ? BASE + "/up" : BASE)
            .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
            .then(function (d) {
                var n = d.count != null ? d.count : d.value;
                if (n == null) throw new Error("no count");
                pill.textContent = "👁 " + Number(n).toLocaleString("vi-VN") + " lượt xem";
                pill.hidden = false;
                if (shouldCount) { try { localStorage.setItem("td_last_hit", String(Date.now())); } catch (e) {} }
            })
            .catch(function () { pill.hidden = true; });

        // ---------- LỜI CHÀO ----------
        function getDevice() {
            var ua = navigator.userAgent, touch = navigator.maxTouchPoints > 1;
            var ipad = /iPad/.test(ua) || (touch && /Macintosh/.test(ua));
            var mobile = /Android|iPhone|iPod|Mobile/i.test(ua) || ipad;
            var name = /iPhone|iPod/.test(ua) ? "iPhone" : ipad ? "iPad" :
                /Android/.test(ua) ? "điện thoại Android" : /Windows/.test(ua) ? "máy tính Windows" :
                /Mac OS X|Macintosh/.test(ua) ? "máy Mac" : /Linux/.test(ua) ? "máy Linux" : "thiết bị của bạn";
            return { mobile: mobile, name: name };
        }

        function buildGreeting() {
            var h = new Date().getHours(), title;
            if (h >= 5 && h <= 10) title = "Chào buổi sáng! ☀️";
            else if (h >= 11 && h <= 13) title = "Chào buổi trưa! 🌤️";
            else if (h >= 14 && h <= 17) title = "Chào buổi chiều! 🌅";
            else if (h >= 18 && h <= 21) title = "Chào buổi tối! 🌙";
            else title = "Khuya rồi mà bạn vẫn ghé thăm mình sao? 🌌";

            var dv = getDevice();
            var line = dv.mobile
                ? "Bạn đang xem bằng " + dv.name + ", bật âm thanh để nghe nhạc nhé 🎧"
                : "Bạn đang xem trên " + dv.name + ", thử bấm vào màn hình để xem hiệu ứng nhé ✨";

            var visits = 1;
            try {
                visits = (parseInt(localStorage.getItem("td_visits"), 10) || 0) + 1;
                localStorage.setItem("td_visits", String(visits));
            } catch (e) {}
            var visitLine = visits > 1
                ? "Đây là lần thứ " + visits + " bạn ghé thăm, cảm ơn nhé 💜"
                : "Chào mừng bạn lần đầu ghé thăm 💜";

            return [title, line, visitLine];   // mỗi phần tử = 1 thông báo riêng
        }

        var shown = false;
        function showGreeting() {
            if (shown) return;
            shown = true;
            var msgs = buildGreeting();
            var stack = document.createElement("div");
            stack.id = "greet-stack";
            stack.setAttribute("role", "status");
            document.body.appendChild(stack);

            msgs.forEach(function (text, i) {
                var item = document.createElement("div");
                item.className = "greet-item" + (i === 0 ? " first" : "");
                item.textContent = text;
                // hiện lần lượt từng thông báo
                setTimeout(function () {
                    stack.appendChild(item);
                    requestAnimationFrame(function () { item.classList.add("show"); });
                }, i * STAGGER_MS);
                // ẩn lần lượt theo đúng thứ tự đã hiện
                setTimeout(function () {
                    item.classList.remove("show");
                    setTimeout(function () {
                        item.remove();
                        if (!stack.children.length && i === msgs.length - 1) stack.remove();
                    }, 400);
                }, i * STAGGER_MS + GREETING_VISIBLE_MS);
            });
        }

        // Hiện lời chào khi người xem bấm vào màn hình khóa để vào web
        document.addEventListener("click", function h(e) {
            if (e.target.closest && e.target.closest(".td-lock-screen")) {
                document.removeEventListener("click", h, true);
                setTimeout(showGreeting, 500);
            }
        }, true);
        // Phòng khi trang không có màn hình khóa
        setTimeout(function () {
            if (!document.querySelector(".td-lock-screen")) showGreeting();
        }, 3000);
    }

    try {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
        else init();
    } catch (e) { console.error("Extras error:", e); }
})();
/* --- HẾT TIỆN ÍCH --- */


!function(n) {
    function t(n, t, e) {
        let i = new Date(Date.now() + 864e5 * e).toUTCString();
        document.cookie = `${n}=${t}; expires=${i}; path=/`
    }
    function e(n) {
        let t = document.cookie.split("; ").reduce( (n, t) => {
            let[e,i] = t.split("=");
            return n[e] = i,
            n
        }
        , {});
        return t[n]
    }
    function i(n) {
        let e = $(".ri-sun-line")
          , i = $(".ri-moon-clear-line");
        "light" === n ? ($("html").removeClass("dark").addClass("light"),
        i.slideUp(300, function() {
            e.slideDown(300)
        }),
        t("theme", "light", 365)) : ($("html").removeClass("light").addClass("dark"),
        e.slideUp(300, function() {
            i.slideDown(300)
        }),
        t("theme", "dark", 365))
    }
    let h = e("theme");
    function c() {
        let n = Math.floor(100 * Math.random()), t = Math.floor(100 * Math.random()), e = ["+", "-", "*", "/"], i = e[Math.floor(Math.random() * e.length)], h;
        switch (i) {
        case "+":
            h = n + t;
            break;
        case "-":
            h = n - t;
            break;
        case "*":
            h = n * t;
            break;
        case "/":
            h = 0 !== t ? (n / t).toFixed(2) : n
        }
        let c = h < 10 ? "0" + h : h;
        return `${n < 10 ? "0" + n : n}.${t < 10 ? "0" + t : t}.${c}`
    }
    "light" === h ? i("light") : i("dark"),
    $("body").on("click", ".change-theme", function() {
        let n = $("html").hasClass("dark");
        i(n ? "light" : "dark")
    }),
    "close" === e("toast") && $("#toast-prompt").hide(),
    $("body").on("click", ".close-btn", function() {
        if (window.bgAudio) window.bgAudio.pause();
        if (window.hideMusicAsk) window.hideMusicAsk();
        $("#toast-prompt").slideUp("fast", function() {
            let n = new Date(Date.now() + 6e5).toUTCString();
            document.cookie = `toast=close; expires=${n}; path=/`
        }),
        FuiToast.success("Đã tắt nhạc nền.")
    }),
    /* --- PHẦN XỬ LÝ NHẠC + THANH ĐIỀU KHIỂN + HỎI CHUYỂN NHẠC --- */
    (function () {
        // ----- DANH SÁCH NHẠC (chỉ thêm bài có link thật) -----
        const playlist = [
            { title: "Em Ngốc Quá - đanh", url: "https://files.catbox.moe/mo7md7.wav" },

            { title: "Có Anh Ở Đây Rồi - đanh", url: "https://files.catbox.moe/gb6pd7.wav" },

            { title: "Vở Kịch Của Em ft Vây Giữ Remix - đanh", url: "https://files.catbox.moe/0e12ao.wav" },

            { title: "Lời yêu ngây dại REMIX - đanh", url: "https://files.catbox.moe/4vkl49.wav" },

            { title: "Để Em Lương Thiện - đanh", url: "https://files.catbox.moe/dba3aq.wav" },

            { title: "Chúng Ta Không Thuộc Về Nhau - đanh", url: "https://files.catbox.moe/jjdit0.wav" },

            { title: "Gia Nhu Anh La Em - đanh", url: "https://files.catbox.moe/rxc2jn.mp3" },

            { title: "HISSTORY - đanh", url: "https://files.catbox.moe/4an00x.mp3" },

            { title: " Yêu Em Rất Nhiều - đanh", url: "https://files.catbox.moe/iefwr8.mp3" },
            
            { title: " Nỏ Nhớ Tên Nhạc :)) ", url: "https://files.catbox.moe/kcq2dn.mp3" },

            { title: " Đừng Quên Tên Anh - đanh ", url: "https://files.catbox.moe/oe1xvu.mp3" },

            { title: " Bông Hoa Đẹp Nhất - đanh ", url: "https://files.catbox.moe/z6koa7.mp3" },

            { title: " Bóng Phù Hoa Siêu Cháy - đanh ", url: "https://files.catbox.moe/326yg1.mp3" },

            { title: " Bóng Phù Hoa Siêu Cháy - đanh ", url: "https://files.catbox.moe/326yg1.mp3" },

            { title: " Ngày Nào Đôi Mươi - đanh ", url: "https://files.catbox.moe/oxbqzw.mp3" },

            // Thêm bài khác theo mẫu:
            // { title: "Tên bài", url: "./assets/music/ten-bai.wav" },
        ].filter(s => s.url && s.url.trim() !== "");

        const ASK_AFTER_MS = 8000;     // sau bao lâu thì hỏi "có muốn chuyển nhạc không"
        const ASK_VISIBLE_MS = 12000;  // khung hỏi tự ẩn sau bao lâu nếu không trả lời

        let musicIndex = 0, askTimer = null, hideTimer = null, dragging = false;
        let volume = 1;
        try { const v = parseFloat(localStorage.getItem("td_vol")); if (!isNaN(v)) volume = Math.min(1, Math.max(0, v)); } catch (e) {}

        // ----- GIAO DIỆN -----
        const css = document.createElement("style");
        css.textContent = `
        #music-bar,#music-ask{font:500 14px/1.4 system-ui,"Be Vietnam Pro",sans-serif;color:var(--nq-fg);
          background:var(--nq-bar);backdrop-filter:blur(10px);box-shadow:var(--nq-shadow-lg)}
        #music-bar{position:fixed;left:50%;transform:translateX(-50%);
          bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:2147482999;
          width:min(580px,calc(100vw - 24px));padding:10px 14px 12px;border-radius:18px}
        #music-bar[hidden]{display:none}
        #music-bar .mb-title{display:block;margin:0 0 8px;font-weight:700;white-space:nowrap;
          overflow:hidden;text-overflow:ellipsis}
        #music-bar .mb-row{display:flex;align-items:center;gap:8px}
        #music-bar button{flex:none;width:36px;height:36px;border:0;border-radius:50%;cursor:pointer;
          background:var(--nq-soft);color:var(--nq-fg);font-size:15px;line-height:1}
        #music-bar .mb-play{background:var(--nq-accent);color:var(--nq-accent-fg);font-size:16px}
        #music-bar .mb-time{flex:none;font-size:12px;opacity:.75;min-width:34px;text-align:center;
          font-variant-numeric:tabular-nums}
        #music-bar input[type=range]{min-width:0;height:4px;accent-color:var(--nq-accent);cursor:pointer}
        #music-bar .mb-seek{flex:1}
        #music-bar .mb-vol{flex:none;width:80px}
        #music-ask{position:fixed;left:50%;bottom:calc(104px + env(safe-area-inset-bottom,0px));
          z-index:2147483000;width:min(300px,calc(100vw - 32px));padding:14px 16px;border-radius:16px;
          opacity:0;transform:translate(-50%,12px);pointer-events:none;transition:opacity .25s,transform .25s}
        #music-ask.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}
        #music-ask p{margin:0 0 10px}
        #music-ask .ma-row{display:flex;gap:8px}
        #music-ask button{flex:1;border:0;border-radius:10px;padding:9px 10px;font:inherit;font-weight:700;cursor:pointer}
        #music-ask .ma-yes{background:var(--nq-accent);color:var(--nq-accent-fg)}
        #music-ask .ma-no{background:var(--nq-soft);color:var(--nq-fg)}
        #music-bar button:focus-visible,#music-ask button:focus-visible,#music-bar input:focus-visible{
          outline:3px solid var(--nq-focus);outline-offset:2px}
        @media (max-width:560px){#music-bar .mb-vol{display:none}}
        @media (prefers-reduced-motion:reduce){#music-ask{transition:none}}`;
        document.head.appendChild(css);

        const bar = document.createElement("div");
        bar.id = "music-bar";
        bar.hidden = true;
        bar.setAttribute("role", "group");
        bar.setAttribute("aria-label", "Điều khiển nhạc");
        bar.innerHTML = `
          <span class="mb-title">Đang tải nhạc…</span>
          <div class="mb-row">
            <button class="mb-prev" title="Bài trước" aria-label="Bài trước">⏮</button>
            <button class="mb-play" title="Tạm dừng" aria-label="Tạm dừng">⏸</button>
            <button class="mb-next" title="Bài tiếp" aria-label="Bài tiếp">⏭</button>
            <span class="mb-time mb-cur">0:00</span>
            <input class="mb-seek" type="range" min="0" max="1000" value="0" aria-label="Tua nhạc">
            <span class="mb-time mb-dur">0:00</span>
            <button class="mb-mute" title="Tắt tiếng" aria-label="Tắt tiếng">🔊</button>
            <input class="mb-vol" type="range" min="0" max="100" value="${Math.round(volume * 100)}" aria-label="Âm lượng">
          </div>`;
        document.body.appendChild(bar);

        const box = document.createElement("div");
        box.id = "music-ask";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-label", "Chuyển nhạc");
        box.innerHTML = `<p>Bạn có muốn chuyển nhạc không?</p>
          <div class="ma-row"><button class="ma-yes">Có, chuyển bài</button><button class="ma-no">Không</button></div>`;
        document.body.appendChild(box);

        // Bấm vào thanh điều khiển không kích hoạt hiệu ứng chữ bay của trang
        [bar, box].forEach(el => el.addEventListener("click", e => e.stopPropagation()));

        const q = s => bar.querySelector(s);
        const elTitle = q(".mb-title"), btnPlay = q(".mb-play"), btnMute = q(".mb-mute");
        const seek = q(".mb-seek"), vol = q(".mb-vol"), tCur = q(".mb-cur"), tDur = q(".mb-dur");

        const fmt = s => {
            if (!isFinite(s) || s < 0) return "0:00";
            return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
        };

        // ----- HỎI CHUYỂN NHẠC -----
        function hideAsk() { clearTimeout(hideTimer); box.classList.remove("show"); }
        function showAsk() {
            if (!window.bgAudio || window.bgAudio.paused) return;
            box.classList.add("show");
            clearTimeout(hideTimer);
            hideTimer = setTimeout(hideAsk, ASK_VISIBLE_MS);
        }
        function scheduleAsk() { clearTimeout(askTimer); askTimer = setTimeout(showAsk, ASK_AFTER_MS); }

        // ----- PHÁT NHẠC -----
        function playSong(i) {
            return new Promise((resolve, reject) => {
                const a = window.bgAudio;
                a.src = playlist[i].url.trim();
                a.load();
                a.play()
                    .then(() => {
                        musicIndex = i;
                        elTitle.textContent = playlist[i].title;
                        seek.value = 0; tCur.textContent = "0:00"; tDur.textContent = "0:00";
                        scheduleAsk();
                        resolve(playlist[i]);
                    })
                    .catch(() => reject("Không thể phát nhạc ngay lúc này."));
            });
        }
        // Bài nào lỗi thì tự bỏ qua, thử bài kế tiếp
        function playWithSkip(i, dir, left) {
            return playSong(i).catch(() => {
                if (left <= 1) return Promise.reject();
                return playWithSkip((i + dir + playlist.length) % playlist.length, dir, left - 1);
            });
        }
        function go(dir) {
            hideAsk();
            if (playlist.length < 2) { FuiToast.error("Playlist chỉ có 1 bài nên chưa thể chuyển."); return; }
            playWithSkip((musicIndex + dir + playlist.length) % playlist.length, dir, playlist.length)
                .then(s => FuiToast.success("Đang phát: " + s.title))
                .catch(() => FuiToast.error("Không phát được bài nào, kiểm tra lại link nhạc nhé!"));
        }

        // ----- SỰ KIỆN THANH ĐIỀU KHIỂN -----
        q(".mb-next").addEventListener("click", () => go(1));
        q(".mb-prev").addEventListener("click", () => go(-1));
        btnPlay.addEventListener("click", () => {
            const a = window.bgAudio; if (!a) return;
            if (a.paused) a.play().catch(() => {}); else a.pause();
        });
        btnMute.addEventListener("click", () => {
            const a = window.bgAudio; if (!a) return;
            a.muted = !a.muted;
            btnMute.textContent = a.muted ? "🔇" : "🔊";
        });
        vol.addEventListener("input", () => {
            volume = vol.value / 100;
            const a = window.bgAudio;
            if (a) { a.volume = volume; a.muted = false; }
            btnMute.textContent = volume === 0 ? "🔇" : "🔊";
            try { localStorage.setItem("td_vol", String(volume)); } catch (e) {}
        });
        seek.addEventListener("pointerdown", () => { dragging = true; });
        seek.addEventListener("pointerup", () => { dragging = false; });
        seek.addEventListener("input", () => {
            const a = window.bgAudio;
            if (a && isFinite(a.duration)) {
                a.currentTime = (seek.value / 1000) * a.duration;
                tCur.textContent = fmt(a.currentTime);
            }
        });

        box.querySelector(".ma-yes").addEventListener("click", () => go(1));
        box.querySelector(".ma-no").addEventListener("click", () => {
            hideAsk();
            FuiToast.success("Ok, tiếp tục phát bài hiện tại.");
        });

        // Cho nút tắt nhạc (.close-btn) gọi được
        window.hideMusicAsk = function () {
            clearTimeout(askTimer);
            hideAsk();
            bar.hidden = true;
        };

        // ----- BẤM NÚT BẬT NHẠC -----
        $("body").on("click", ".confirm-btn", function () {
            if (!playlist.length) {
                FuiToast.error("Chưa có bài nhạc nào trong playlist!");
                return;
            }

            // Dừng nhạc cũ để không bị phát chồng
            if (window.bgAudio) window.bgAudio.pause();

            const audio = new Audio();
            audio.preload = "auto";
            audio.volume = volume;
            window.bgAudio = audio;

            audio.addEventListener("play", () => { btnPlay.textContent = "⏸"; btnPlay.title = "Tạm dừng"; btnPlay.setAttribute("aria-label", "Tạm dừng"); });
            audio.addEventListener("pause", () => { btnPlay.textContent = "▶"; btnPlay.title = "Phát"; btnPlay.setAttribute("aria-label", "Phát"); });
            audio.addEventListener("loadedmetadata", () => { tDur.textContent = fmt(audio.duration); });
            audio.addEventListener("timeupdate", () => {
                if (dragging || !isFinite(audio.duration)) return;
                seek.value = (audio.currentTime / audio.duration) * 1000;
                tCur.textContent = fmt(audio.currentTime);
            });

            // Hết bài thì tự sang bài kế tiếp (bài lỗi tự bỏ qua)
            audio.addEventListener("ended", function () {
                hideAsk();
                playWithSkip((musicIndex + 1) % playlist.length, 1, playlist.length)
                    .then(s => FuiToast.success("Đang phát: " + s.title))
                    .catch(() => {});
            });

            const start = Math.floor(Math.random() * playlist.length);
            FuiToast.promise(playWithSkip(start, 1, playlist.length), {
                loading: "Đang tải nhạc...",
                success: data => "Đang phát: " + data.title,
                error: "Có lỗi khi phát nhạc!"
            }, { isClose: !0 });

            bar.hidden = false;
            $("#toast-prompt").slideUp("fast");
        });
    })();
    /* --- HẾT PHẦN XỬ LÝ NHẠC --- */

    let o = 0;
    $("body").append(`<div id="fui-toast"></div><div class="td-lock-screen"><section class="td-welcome"><div class="medias"><video class="pc item_video" autoplay loop muted playsinline><source src="./assets/video/pc.mp4?v=${c()}" type="video/mp4"></video><video class="mobile item_video" autoplay loop muted playsinline><source src="./assets/video/mb.mp4?v=${c()}" type="video/mp4"></video><div class="date"></div></div><div class="infos"><div class="logo-web-title">
<img class="logo-ws" src="https://cdn.upanhlaylink.com/i/3BmbgyZf.png" alt="Arom">
<span class="web-title">${$("html").attr("data-title-loader") || "M\xe0n H\xecnh Kho\xe1"}</span></div><span class="web_desc"></span><div><i class="ri-arrow-down-line close-lockscreen"></i></div></div></section></div>`);
    let a = (n, t) => Math.floor(Math.random() * (t - n + 1)) + n
      , s = n => {
        n.style.setProperty("--star-left", `${a(-10, 100)}%`),
        n.style.setProperty("--star-top", `${a(-40, 80)}%`),
        n.style.animation = "none",
        n.offsetHeight,
        n.style.animation = ""
    }
    ;
    for (let r of document.getElementsByClassName("magic-star"))
        setTimeout( () => {
            s(r),
            setInterval( () => s(r), 1e3)
        }
        , o++ * (1e3 / 3));
    let l = document.getElementById("croll-to-top")
      , g = l.querySelector(".text")
      , m = l.querySelector("i");
    0 === window.scrollY && (l.style.display = "none"),
    window.addEventListener("scroll", function() {
        let n = window.scrollY
          , t = document.documentElement.scrollHeight
          , e = window.innerHeight
          , i = 0;
        t > e && (i = n / (t - e) * 100),
        g.textContent = Math.round(i),
        n > 0 ? l.style.display = "block" : l.style.display = "none"
    }),
    l.addEventListener("mouseenter", function() {
        g.style.display = "none",
        m.style.display = "inline-block"
    }),
    l.addEventListener("mouseleave", function() {
        g.style.display = "inline-block",
        m.style.display = "none"
    }),
    l.addEventListener("click", function() {
        $("html, body").animate({
            scrollTop: 0
        }, "fast")
    }),
    $(document).on({
        contextmenu: function(n) {
            console.log("ctx menu button:", n.which),
            n.preventDefault()
        }
    });
    var d = 0
      , u = ["#ff6651", "#42a5f5", "#66bb6a", "#ab47bc", "#ffa726", "#ec407a", "#26c6da", "#78909c", "#ffca28", "#5c6bc0", "#8d6e63", "#26a69a"];
    jQuery(document).ready(function(n) {
        n("body").click(function(t) {
            var e = ["♥️ Năm mới vui vẻ", "❤️ Cung hỉ ph\xe1t t\xe0i", "\uD83D\uDC9B Tiền v\xf4 như nước", "\uD83D\uDC9A Vợ đẹp con ngoan", "\uD83D\uDC99 T\xe0i lộc v\xe0o nh\xe0", "\uD83D\uDC9C Ph\xfac thọ v\xf4 bi\xean", "\uD83D\uDDA4 Sống khoẻ đ\xf3n xu\xe2n", "\uD83D\uDC96 Ph\xfa qu\xfd c\xe1t tường", "\uD83D\uDC9D Đắc lộc to\xe0n gia", "\uD83D\uDC99 Hạnh ph\xfac m\xeanh mang", "❤️ Vạn sự th\xe0nh c\xf4ng", "\uD83D\uDC9A M\xe3 đ\xe1o th\xe0nh c\xf4ng", "\uD83D\uDC99 Tiền v\xf4 tỷ tỷ", "\uD83D\uDC9C T\xe0i vạn c\xf4ng danh", "\uD83D\uDC9B Hạnh ph\xfac gia an", "\uD83D\uDC96 Sức khoẻ như voi", "\uD83D\uDC9B Th\xf4ng minh vượt trội", "\uD83D\uDC96 Ph\xfac lộc trong tay", "\uD83D\uDC9A Gia chủ ph\xe1t t\xe0i", "\uD83D\uDC9A Vạn sự như \xfd", "\uD83D\uDC9A T\xfai tiền nặng k\xfd ", "\uD83D\uDDA4 L\xe0m ăn ph\xe1t đạt", "\uD83D\uDC9B V\xe0ng bạc cao sang", "\uD83D\uDC99 Sức khỏe an nh\xe0n", "\uD83D\uDC9C C\xf4ng danh hết \xfd", "\uD83D\uDDA4 Cung hỷ cung hỷ", "\uD83D\uDC9D Hạnh ph\xfac triền mi\xean", "\uD83D\uDDA4 Sung sướng như ti\xean"]
              , i = n("<span style='font-family:sans-serif;'>").text(e[d])
              , h = u[Math.floor(Math.random() * u.length)];
            d = (d + 1) % e.length;
            var c = t.pageX
              , o = t.pageY;
            i.css({
                "z-index": Math.floor(9990001 * Math.random()) + 9999,
                top: o - 20,
                left: c,
                position: "absolute",
                "font-weight": "bold",
                color: h
            }),
            n("body").append(i),
            i.animate({
                top: o - 180,
                opacity: 0
            }, 1500, function() {
                i.remove()
            })
        })
    });
    class p {
        constructor(n) {
            this.element = $(n),
            this.TimeNows(),
            setInterval( () => this.TimeNows(), 1e3)
        }
        TimeNows() {
            let n = new Date
              , t = n.getHours().toString().padStart(2, "0")
              , e = n.getMinutes().toString().padStart(2, "0")
              , i = n.getSeconds().toString().padStart(2, "0");
            this.element.text(`${t}:${e}:${i}`)
        }
    }
    function y() {
        $.ajax({
            url: "https://api.thanhdieu.com/cham-ngon",
            type: "get",
            dataType: "json",
            success: function(n) {
                $("#cham-ngon").fadeOut(300, function() {
                    $(this).text(n.msg).fadeIn(300)
                })
            },
            error: function(n, t, e) {
                console.error("Error: " + e)
            }
        })
    }
    new p("#real-time"),
    $("[data-fancybox]").length && Fancybox.bind("[data-fancybox]", {}),
    y();
    let f = new class n {
        constructor(n) {
            this.element = n
        }
        MessageRmd() {
            let n = new Date().getHours(), t;
            return (t = n >= 3 && n <= 10 ? ["Ch\xfac c\xe1c bạn c\xf3 một buổi s\xe1ng vui vẻ, v\xe0 may mắn \uD83D\uDE07", "S\xe1ng nay thật đẹp, h\xe3y bắt đầu một ng\xe0y mới tr\xe0n đầy năng lượng nh\xe9! ☀️", "Ch\xe0o buổi s\xe1ng, đừng qu\xean ăn s\xe1ng để c\xf3 năng lượng cho cả ng\xe0y!", "Khi \xf4ng Mặt trời thức dậy, mẹ l\xean rẫy, em đến trường rồi m\xe0 sao m\xe0y vẫn c\xf2n ngủ hả, dậy m\xe0 đ\xf3n lấy \xe1nh nắng t\xedch cực, khởi đầu ng\xe0y mới tr\xe0n đầy năng lượng đi.", ] : n >= 11 && n <= 15 ? ["Buổi trưa n\xe0y, đừng qu\xean ăn uống đầy đủ đấy nh\xe9 \uD83E\uDD24", "Trưa nay hơi n\xf3ng, nếu c\xf3 cần mua g\xec th\xec nhắn anh mua gi\xfap cho nh\xe9 \uD83C\uDF24️", "Ch\xfac bạn c\xf3 một buổi nghỉ trưa tr\xe0n đầy sức khoẻ!", ] : n >= 16 && n <= 18 ? ["Ch\xfac bạn c\xf3 một buổi chiều thư gi\xe3n sau những giờ l\xe0m việc căng thẳng.", "Ch\xfac buổi chiều tr\xe0n đầy năng lượng t\xedch cực, để tối nay c\xf3 thể c\xe0y phim thả ga!", "Cả ng\xe0y h\xf4m nay t\xf4i kh\xf4ng thể ngừng nghĩ về bạn ch\xfac bạn một buổi chiều vui vẻ! \uD83C\uDF05", ] : n >= 19 && n <= 21 ? ["Ch\xfac c\xe1c bạn c\xf3 một buổi tối tr\xe0n đầy hạnh ph\xfac!", "Buổi tối l\xe0 l\xfac để thư gi\xe3n v\xe0 tận hưởng cuộc sống \uD83C\uDF19", "Ch\xe0o buổi tối, đừng qu\xean d\xe0nh thời gian cho gia đ\xecnh nh\xe9 ❤️", ] : ["Onichan~ sao giờ n\xe0y chưa ngủ nữa ୧(๑•̀⌄•́๑)૭", "Khuya rồi, h\xe3y đi ngủ để mơ những giấc mơ thật đẹp nh\xe9 \uD83C\uDF0C", "Đ\xeam muộn thế n\xe0y, đừng qu\xean chăm s\xf3c sức khỏe nha \uD83C\uDF19", ])[Math.floor(Math.random() * t.length)]
        }
    }
    ($("#waiting-loader"));
    setTimeout( () => {
        let n = f.MessageRmd();
        $("#waiting-loader").text(n)
    }
    , 111),
    setInterval(y, 5321);
    let b = new class n {
        constructor(n) {
            this.descriptions = n,
            this.element = $(".web_desc"),
            this.Description()
        }
        Description() {
            let n = this.descriptions[Math.floor(Math.random() * this.descriptions.length)];
            this.element.fadeOut(500, () => {
                this.element.html(n).fadeIn(500)
            }
            )
        }
    }
    (["Anh đây chẳng thích nhiều lời, nhìn em là biết cả đời của anh.", "Danhhh - Aromm", "Chào mừng bạn đến với Profile của tôi"]);
    setInterval( () => b.Description(), 7e3),
    $(".td-lock-screen").click(function() {
        $(".td-welcome").slideUp("slow"),
        $(".td-lock-screen").animate({
            opacity: 0
        }, "slow").css("pointer-events", "none")
    }),
    $(document).on("swiperight", function() {
        $(".td-welcome").slideDown("slow"),
        $(".td-lock-screen").animate({
            opacity: 1
        }, "fast").css("pointer-events", "auto")
    }),
    $(document).on("swipeleft", function() {
        $(".td-welcome").slideUp("slow"),
        $(".td-lock-screen").animate({
            opacity: 0
        }, "slow").css("pointer-events", "none")
    }),
    $(document).on("visibilitychange", function() {
        document.hidden || setTimeout(function() {
            var n = $(window).scrollTop()
              , t = $(window).height()
              , e = $(document).height();
            0 === n && ($(".td-welcome").slideDown("slow"),
            $(".td-lock-screen").animate({
                opacity: 1
            }, "fast").css("pointer-events", "auto")),
            100 == n / (e - t) * 100 && ($(".td-welcome").slideUp("slow"),
            $(".td-lock-screen").animate({
                opacity: 0
            }, "slow").css("pointer-events", "none"))
        }, 200)
    }),
    new p(".date");
    let v = $("#loading-percentage"), w;
    w = setInterval(function() {
        var n = $(".pace-progress");
        if (n.length) {
            var t = n.attr("data-progress-text");
            if (t !== v.text()) {
                v.text(t);
                var e = parseInt(t);
                n.css("transform", "translate3d(" + e + "%, 0px, 0px)"),
                "100%" === t && ($(".pace-active").animate({
                    top: "-100px"
                }, "slow", function() {
                    $(this).hide()
                }),
                $("#loading-box").is(":visible") ? (x(),
                WsLoaded = !0,
                $(".td-loading-v2").fadeOut("slow"),
                $("#loading-box").fadeOut("slow")) : $(".td-loading-v2").fadeOut("slow"),
                clearInterval(w))
            }
        }
    }, 100);
    let k = {
        endLoading() {
            x(),
            $(".td-loading-v2").fadeOut("slow"),
            $("#loading-box").fadeOut("slow"),
            WsLoaded = !0
        },
        initLoading() {
            document.body.style.overflow = "",
            $("#loading-box").removeClass("loaded")
        }
    };
    function x() {
        $("body").removeClass("loading")
    }
    $(window).on("load", () => {
        k.endLoading()
    }
    ),
    $(document).on("pjax:send", () => {
        k.initLoading()
    }
    ),
    $(document).on("pjax:complete", () => {
        k.endLoading()
    }
    ),
    console.log("%c My Github %c https://github.com/DDanhVn25", "color:#fff;background:linear-gradient(90deg,#448bff,#44e9ff);padding:5px 0;", "color:#000;background:linear-gradient(90deg,#44e9ff,#ffffff);padding:5px 10px 5px 0px;");
    var _, C, T = new Image;
    function E(n, t, e, i, h) {
        this.x = n,
        this.y = t,
        this.s = e,
        this.r = i,
        this.fn = h
    }
    function q(n) {
        var t, e;
        switch (n) {
        case "x":
            t = Math.random() * window.innerWidth;
            break;
        case "y":
            t = Math.random() * window.innerHeight;
            break;
        case "s":
            t = Math.random();
            break;
        case "r":
            t = 6 * Math.random();
            break;
        case "fnx":
            e = -.5 + 1 * Math.random(),
            t = function(n, t) {
                return n + .5 * e - 1.7
            }
            ;
            break;
        case "fny":
            e = 1.5 + .7 * Math.random(),
            t = function(n, t) {
                return t + e
            }
            ;
            break;
        case "fnr":
            e = .03 * Math.random(),
            t = function(n) {
                return n + e
            }
        }
        return t
    }
    function S() {
        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
        var n, t, e, i, h, c, o, a, s = document.createElement("canvas");
        C = !0,
        s.height = window.innerHeight,
        s.width = window.innerWidth,
        s.setAttribute("style", "position: fixed;left: 0;top: 0;pointer-events: none;z-index: 8888;"),
        s.setAttribute("id", "canvas_sakura"),
        document.getElementsByTagName("body")[0].appendChild(s),
        a = s.getContext("2d");
        for (var r = new SakuraList, l = 0; l < 10; l++)
            t = q("x"),
            e = q("y"),
            h = q("r"),
            i = q("s"),
            c = q("fnx"),
            o = q("fny"),
            randomFnR = q("fnr"),
            (n = new E(t,e,i,h,{
                x: c,
                y: o,
                r: randomFnR
            })).draw(a),
            r.push(n);
        _ = requestAnimationFrame(function() {
            a.clearRect(0, 0, s.width, s.height),
            r.update(),
            r.draw(a),
            _ = requestAnimationFrame(arguments.callee)
        })
    }
    function A() {
        if (C) {
            var n = document.getElementById("canvas_sakura");
            n.parentNode.removeChild(n),
            window.cancelAnimationFrame(_),
            C = !1
        } else
            S()
    }
    sakura = "//i.ibb.co/CpF2yzvf/thanhdieu.png",
    leaf = "//i.ibb.co/CpF2yzvf/thanhdieu.png",
    maple = "//i.ibb.co/CpF2yzvf/thanhdieu.png",
    user = "",
    T.src = maple,
    E.prototype.draw = function(n) {
        n.save(),
        this.s,
        n.translate(this.x, this.y),
        n.rotate(this.r),
        n.drawImage(T, 0, 0, 30 * this.s, 30 * this.s),
        n.restore()
    }
    ,
    E.prototype.update = function() {
        this.x = this.fn.x(this.x, this.y),
        this.y = this.fn.y(this.y, this.y),
        this.r = this.fn.r(this.r),
        (this.x > window.innerWidth || this.x < 0 || this.y > window.innerHeight || this.y < 0) && (this.r = q("fnr"),
        Math.random() > .4 ? (this.x = q("x"),
        this.y = 0,
        this.s = q("s"),
        this.r = q("r")) : (this.x = window.innerWidth,
        this.y = q("y"),
        this.s = q("s"),
        this.r = q("r")))
    }
    ,
    (SakuraList = function() {
        this.list = []
    }
    ).prototype.push = function(n) {
        this.list.push(n)
    }
    ,
    SakuraList.prototype.update = function() {
        for (var n = 0, t = this.list.length; n < t; n++)
            this.list[n].update()
    }
    ,
    SakuraList.prototype.draw = function(n) {
        for (var t = 0, e = this.list.length; t < e; t++)
            this.list[t].draw(n)
    }
    ,
    SakuraList.prototype.get = function(n) {
        return this.list[n]
    }
    ,
    SakuraList.prototype.size = function() {
        return this.list.length
    }
    ,
    window.onresize = function() {
        document.getElementById("canvas_snow")
    }
    ,
    T.onload = function() {
        S()
    }
    ,
    $("body").on("click", "[data-ws-copy]", function(n) {
        n.preventDefault();
        var t = $(this).data("ws-copy");
        if (navigator.clipboard)
            navigator.clipboard.writeText(t).then(function() {
                FuiToast.success("Đ\xe3 sao ch\xe9p v\xe0o bộ nhớ tạm!")
            }, function(n) {
                FuiToast.error("Sao ch\xe9p thất bại: " + n)
            });
        else {
            var e = $("<textarea>").val(t).appendTo("body").select();
            try {
                document.execCommand("copy"),
                FuiToast.success("Đ\xe3 sao ch\xe9p v\xe0o bộ nhớ tạm!")
            } catch (i) {
                FuiToast.error("Sao ch\xe9p thất bại: " + i)
            }
            e.remove()
        }
    })
}();