/* ============================================================
   CHỌN MÀU CHỦ ĐỀ + HIỆU ỨNG GÕ CHỮ
   Gắn trong index.html, SAU index.js:
   <script src="./assets/js/theme-typing.js"></script>
   ============================================================ */
try {
(function () {
    // ====== CẤU HÌNH ======
    var TYPING = {
        phrases: [
            "Developer",
            "Designer",
            "Học sinh lớp 10",
            "mê đập lọ",
            "trùm đập lọ 🐿️",
            "chơi cờ zzzua ♟️",
            "lốp siêu bền",
        ],
        typeMs: 70,      // tốc độ gõ mỗi ký tự
        deleteMs: 35,    // tốc độ xóa mỗi ký tự
        holdMs: 1600,    // dừng lại sau khi gõ xong một câu
        gapMs: 400       // nghỉ trước khi gõ câu mới
    };

    // Mỗi màu có 2 sắc độ: dark (hợp nền tối) và light (hợp nền sáng)
    var PALETTE = [
        { key: "default", name: "Mặc định" },
        { key: "purple", name: "Tím",        dark: "#b9a7ff", light: "#6c4bff" },
        { key: "pink",   name: "Hồng",       dark: "#ff9ec7", light: "#d6336c" },
        { key: "blue",   name: "Xanh dương", dark: "#8fc8ff", light: "#1971c2" },
        { key: "green",  name: "Xanh lá",    dark: "#8ff0b6", light: "#2b8a3e" },
        { key: "yellow", name: "Vàng",       dark: "#ffd978", light: "#b8860b" },
        { key: "orange", name: "Cam",        dark: "#ffab7a", light: "#d9480f" },
        { key: "red",    name: "Đỏ",         dark: "#ff8a8a", light: "#c92a2a" }
    ];
    var STORE_KEY = "td_theme_color";
    // =======================

    var root = document.documentElement;

    function store(k, v) {
        try {
            if (v === undefined) return localStorage.getItem(k);
            if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
        } catch (e) {}
        return null;
    }
    function isDark() {
        if (root.classList.contains("dark")) return true;
        if (root.classList.contains("light")) return false;
        return !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    }
    function rgb(hex) {
        var n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function fgFor(hex) {
        var c = rgb(hex);
        return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255 > 0.6 ? "#161233" : "#ffffff";
    }
    function find(key) {
        for (var i = 0; i < PALETTE.length; i++) if (PALETTE[i].key === key) return PALETTE[i];
        return PALETTE[0];
    }

    function hslOf(hex) {
        var c = rgb(hex).map(function (v) { return v / 255; });
        var r = c[0], g = c[1], b = c[2];
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, sat = 0, d = mx - mn;
        if (d) {
            sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
            h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
            h *= 60;
        }
        return [Math.round(h), Math.round(sat * 100), Math.round(l * 100)];
    }

    // Chỉ chạm vào thuộc tính class khi trạng thái thật sự thay đổi.
    // (classList.add/remove dù không đổi gì vẫn làm MutationObserver chạy lại -> vòng lặp vô hạn)
    function setCustom(on) {
        if (root.classList.contains("tc-custom") !== on) root.classList.toggle("tc-custom", on);
    }

    // ---------- ÁP DỤNG MÀU ----------
    var glow = null, glowOrig = null;
    var VARS = ["--primary", "--nq-accent-fg", "--tc-accent", "--tc-accent-fg", "--tc-g1", "--tc-g3"];

    function applyColor(key) {
        var p = find(key), s = root.style;
        glow = glow || document.querySelector(".pointer-events-none.absolute.start-0.top-0");
        if (glow && glowOrig === null) glowOrig = glow.style.backgroundImage;

        if (p.key === "default") {
            VARS.forEach(function (v) { s.removeProperty(v); });
            setCustom(false);
            if (glow && glowOrig !== null) glow.style.backgroundImage = glowOrig;
            return;
        }
        var hex = isDark() ? p.dark : p.light, c = rgb(hex), fg = fgFor(hex);
        var hl = hslOf(hex);
        // --primary là bộ ba H S% L% (đúng định dạng hsl(var(--primary)) của trang)
        s.setProperty("--primary", hl[0] + " " + hl[1] + "% " + hl[2] + "%");
        s.setProperty("--nq-accent-fg", fg);
        s.setProperty("--tc-accent", hex);
        s.setProperty("--tc-accent-fg", fg);
        // màu chuyển cho chữ HOME: tối hơn, và lệch tông sang màu sáng hơn
        s.setProperty("--tc-g1", "hsl(" + hl[0] + "," + hl[1] + "%," + Math.max(hl[2] - 22, 12) + "%)");
        s.setProperty("--tc-g3", "hsl(" + ((hl[0] + 35) % 360) + "," + hl[1] + "%," + Math.min(hl[2] + 12, 85) + "%)");
        setCustom(true);
        if (glow) glow.style.backgroundImage = "linear-gradient(rgba(" + c.join(",") + ",.4), transparent)";
    }

    function init() {
        // ---------- CSS ----------
        var css = document.createElement("style");
        css.textContent = [
            ".tc-btn{background:none;border:0;color:inherit;cursor:pointer;line-height:1;font-size:inherit}",
            ".tc-btn:focus-visible,#tc-pop button:focus-visible{outline:3px solid var(--tc-accent,var(--nq-accent,currentColor));outline-offset:2px}",
            "#tc-pop{position:fixed;z-index:2147483000;width:236px;padding:14px;border-radius:16px;",
            "font:500 13px/1.4 system-ui,'Be Vietnam Pro',sans-serif;color:var(--nq-fg,#fff);",
            "background:var(--nq-bg-strong,rgba(20,22,44,.97));backdrop-filter:blur(10px);",
            "box-shadow:var(--nq-shadow-lg,0 12px 40px rgba(0,0,0,.35));border:1px solid var(--nq-line,rgba(255,255,255,.12))}",
            "#tc-pop[hidden]{display:none}",
            "#tc-pop .tc-title{margin:0 0 10px;font-weight:700}",
            "#tc-pop .tc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}",
            "#tc-pop .tc-sw{width:100%;aspect-ratio:1;border-radius:50%;border:2px solid transparent;cursor:pointer;",
            "background:var(--c);color:#fff;display:grid;place-items:center;font-size:14px;padding:0;",
            "box-shadow:inset 0 0 0 1px rgba(0,0,0,.18)}",
            "#tc-pop .tc-sw[aria-pressed=true]{border-color:var(--nq-fg,#fff);box-shadow:0 0 0 2px var(--c)}",
            "#tc-pop .tc-def{background:conic-gradient(#b9a7ff,#ff9ec7,#ffd978,#8ff0b6,#8fc8ff,#b9a7ff)}",
            "#tc-pop .tc-name{margin:10px 0 0;font-size:12px;opacity:.7;min-height:1.2em}",
            "html.tc-custom ::selection{background:var(--tc-accent);color:var(--tc-accent-fg)}",
            "html.tc-custom h1>.magic>.magic-text{background-image:linear-gradient(to right,var(--tc-g1),var(--tc-accent),var(--tc-g3),var(--tc-g1))}",
            "html.tc-custom h1>.magic>.magic-star>svg>path{fill:var(--tc-accent)}",
            "html.tc-custom .confirm-btn{background:var(--tc-accent);color:var(--tc-accent-fg)}",
            ".tc-typing{margin:0;min-height:1.6em;font-weight:600;color:var(--tc-accent,var(--nq-accent,inherit));text-align:center}",
            ".tc-typing-text::after{content:'';display:inline-block;width:2px;height:1.1em;margin-left:3px;",
            "vertical-align:-.15em;background:currentColor;animation:tc-blink 1s steps(1) infinite}",
            "@keyframes tc-blink{50%{opacity:0}}",
            ".tc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}",
            "@media (prefers-reduced-motion:reduce){.tc-typing-text::after{animation:none}}"
        ].join("");
        document.head.appendChild(css);

        // ---------- NÚT CHỌN MÀU (cạnh nút sáng/tối) ----------
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tc-btn rounded-md p-2 transition-all";
        btn.title = "Chọn màu chủ đề";
        btn.setAttribute("aria-label", "Chọn màu chủ đề");
        btn.setAttribute("aria-haspopup", "dialog");
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML = '<i class="ri-palette-line"></i>';

        var themeBtn = document.querySelector(".change-theme");
        if (themeBtn && themeBtn.parentNode) {
            themeBtn.parentNode.insertBefore(btn, themeBtn);
        } else {
            btn.style.cssText = "position:fixed;top:12px;right:12px;z-index:2147482990";
            document.body.appendChild(btn);
        }

        // ---------- HỘP MÀU ----------
        var pop = document.createElement("div");
        pop.id = "tc-pop";
        pop.hidden = true;
        pop.setAttribute("role", "dialog");
        pop.setAttribute("aria-label", "Chọn màu chủ đề");
        var grid = '';
        PALETTE.forEach(function (p) {
            grid += '<button type="button" class="tc-sw' + (p.key === "default" ? " tc-def" : "") +
                '" data-key="' + p.key + '" aria-label="' + p.name + '" title="' + p.name + '" aria-pressed="false"></button>';
        });
        pop.innerHTML = '<p class="tc-title">🎨 Màu chủ đề</p><div class="tc-grid">' + grid + '</div><p class="tc-name"></p>';
        document.body.appendChild(pop);

        var nameEl = pop.querySelector(".tc-name");
        var swatches = [].slice.call(pop.querySelectorAll(".tc-sw"));
        var current = store(STORE_KEY) || "default";

        function paintSwatches() {
            swatches.forEach(function (b) {
                var p = find(b.getAttribute("data-key"));
                if (p.key !== "default") b.style.setProperty("--c", isDark() ? p.dark : p.light);
                b.setAttribute("aria-pressed", String(p.key === current));
            });
            nameEl.textContent = "Đang dùng: " + find(current).name;
        }
        function choose(key) {
            current = key;
            store(STORE_KEY, key === "default" ? null : key);
            applyColor(key);
            paintSwatches();
        }

        // Bấm vào nút/hộp không kích hoạt hiệu ứng chữ bay của trang
        btn.addEventListener("click", function (e) { e.stopPropagation(); toggle(); });
        pop.addEventListener("click", function (e) {
            e.stopPropagation();
            var b = e.target.closest && e.target.closest(".tc-sw");
            if (b) choose(b.getAttribute("data-key"));
        });

        function place() {
            var r = btn.getBoundingClientRect();
            var right = Math.max(8, window.innerWidth - r.right);
            pop.style.top = Math.round(r.bottom + 8) + "px";
            pop.style.right = Math.round(right) + "px";
        }
        function open() {
            place();
            pop.hidden = false;
            btn.setAttribute("aria-expanded", "true");
        }
        function close() {
            pop.hidden = true;
            btn.setAttribute("aria-expanded", "false");
        }
        function toggle() { pop.hidden ? open() : close(); }

        document.addEventListener("click", function (e) {
            if (!pop.hidden && !pop.contains(e.target) && !btn.contains(e.target)) close();
        }, true);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && !pop.hidden) { close(); btn.focus(); }
        });
        window.addEventListener("resize", function () { if (!pop.hidden) place(); });

        // Đổi sáng/tối thì đổi sắc độ cho hợp
        var lastDark = isDark();
        new MutationObserver(function () {
            var d = isDark();
            if (d === lastDark) return;      // class đổi vì lý do khác (td-locked, tc-custom...) thì bỏ qua
            lastDark = d;
            applyColor(current);
            paintSwatches();
        }).observe(root, { attributes: true, attributeFilter: ["class"] });

        applyColor(current);
        paintSwatches();

        // ---------- HIỆU ỨNG GÕ CHỮ ----------
        var el = document.getElementById("typing-text");
        if (!el) {
            var h1 = document.querySelector("h1.text-3xl");
            if (h1) {
                var p = document.createElement("p");
                p.className = "tc-typing";
                el = document.createElement("span");
                el.id = "typing-text";
                p.appendChild(el);
                h1.insertAdjacentElement("afterend", p);
            }
        }
        if (!el) return;
        el.classList.add("tc-typing-text");
        el.setAttribute("aria-hidden", "true");
        var sr = document.createElement("span");
        sr.className = "tc-sr";
        sr.textContent = TYPING.phrases.join(", ");
        el.parentNode.appendChild(sr);

        var started = false;
        function startTyping() {
            if (started) return;
            started = true;
            var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
            var phrases = TYPING.phrases, i = 0;

            if (reduce) {                       // không gõ từng chữ, chỉ đổi câu
                el.textContent = phrases[0];
                setInterval(function () { i = (i + 1) % phrases.length; el.textContent = phrases[i]; }, 3000);
                return;
            }
            var n = 0, deleting = false;
            (function tick() {
                if (document.hidden) return void setTimeout(tick, 500);
                var chars = Array.from(phrases[i]);       // tách đúng cả emoji
                if (!deleting) {
                    n++;
                    el.textContent = chars.slice(0, n).join("");
                    if (n >= chars.length) { deleting = true; return void setTimeout(tick, TYPING.holdMs); }
                    return void setTimeout(tick, TYPING.typeMs + Math.random() * 40);
                }
                n--;
                el.textContent = chars.slice(0, n).join("");
                if (n <= 0) { deleting = false; i = (i + 1) % phrases.length; return void setTimeout(tick, TYPING.gapMs); }
                setTimeout(tick, TYPING.deleteMs);
            })();
        }

        // Bắt đầu gõ khi người xem vào web (bấm màn hình chờ)
        document.addEventListener("click", function h(e) {
            if (e.target.closest && e.target.closest(".td-lock-screen")) {
                document.removeEventListener("click", h, true);
                setTimeout(startTyping, 500);
            }
        }, true);
        // Phòng khi trang không có màn hình chờ
        setTimeout(function () {
            if (!document.querySelector(".td-lock-screen")) startTyping();
        }, 3000);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
} catch (e) { console.error("Theme/Typing error:", e); }