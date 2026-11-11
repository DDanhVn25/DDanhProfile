/* --- ĐANG NGHE / ĐANG CHƠI + HỎI ĐÁP ẨN DANH --- */
try {
(function () {
    // ====== CẤU HÌNH ======
    var CFG = {
        // (Tuỳ chọn) ID Discord để lấy "đang nghe Spotify / đang chơi game" THẬT qua Lanyard.
        // Cần vào server Discord của Lanyard 1 lần: https://discord.gg/lanyard
        DISCORD_ID: "1325823803296845920",

        // Đang chơi (nhập tay). Đặt null nếu muốn ẩn. Nếu có Lanyard và đang chơi game thật thì ưu tiên game thật.
        PLAYING: { name: "đập lọ", detail: "mục tiêu 100 quả", icon: "🎮" },

        // Đang nghe (nhập tay) khi chưa bật nhạc và không có Spotify. Đặt null để ẩn.
        LISTENING_FALLBACK: null, // ví dụ: { song: "Em Ngốc Quá", artist: "đanh" }

        // Hỏi đáp ẩn danh (Supabase). Để trống thì phần gửi câu hỏi bị tắt.
        SUPABASE_URL: "https://gtempylzpagovbyiwbhm.supabase.co",   // ví dụ: https://abcdxyz.supabase.co
        SUPABASE_KEY: "sb_publishable_a_FV_bITUqhOZWOwjqx74g_h_NlihsY",   // anon / publishable key (key công khai, KHÔNG dùng service_role)
        TABLE: "questions",

        MAX_LEN: 300,            // tối đa ký tự mỗi câu hỏi
        COOLDOWN_MS: 60000,      // 1 máy chỉ gửi lại sau 60 giây
        LIST_LIMIT: 20,          // số câu đã trả lời hiển thị
        POLL_MS: 15000           // chu kỳ cập nhật Lanyard
    };
    // =======================

    function h(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;   // luôn dùng textContent -> chống chèn mã độc
        return e;
    }
    function store(k, v) {
        try {
            if (v === undefined) return localStorage.getItem(k);
            localStorage.setItem(k, v);
        } catch (e) {}
        return null;
    }
    function ago(iso) {
        var s = (Date.now() - new Date(iso).getTime()) / 1000;
        if (s < 60) return "vừa xong";
        var m = s / 60; if (m < 60) return Math.floor(m) + " phút trước";
        var hr = m / 60; if (hr < 24) return Math.floor(hr) + " giờ trước";
        var d = hr / 24; if (d < 30) return Math.floor(d) + " ngày trước";
        return new Date(iso).toLocaleDateString("vi-VN");
    }

    function init() {
        // ---------- GIAO DIỆN ----------
        var css = document.createElement("style");
        css.textContent = `
        #nq-card,#nq-modal .nq-panel{font:500 13px/1.45 system-ui,"Be Vietnam Pro",sans-serif;color:#fff;
          background:rgba(20,22,44,.88);backdrop-filter:blur(10px);box-shadow:0 8px 28px rgba(0,0,0,.3)}
        #nq-card{position:fixed;z-index:2147482990;left:12px;top:calc(52px + env(safe-area-inset-top,0px));
          width:min(240px,calc(100vw - 24px));padding:10px 12px;border-radius:16px;
          opacity:0;transform:translateY(-8px);transition:opacity .35s,transform .35s}
        #nq-card.show{opacity:1;transform:none}
        #nq-card[hidden]{display:none}
        #nq-card .nq-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
        #nq-card .nq-head b{font-size:12px;letter-spacing:.04em;text-transform:uppercase;opacity:.75}
        #nq-card .nq-toggle{border:0;background:rgba(255,255,255,.12);color:#fff;width:24px;height:24px;
          border-radius:50%;cursor:pointer;line-height:1}
        #nq-card.min .nq-body{display:none}
        #nq-card .nq-row{display:flex;gap:9px;align-items:center;margin-top:9px}
        #nq-card .nq-row[hidden]{display:none}
        #nq-card .nq-ico{flex:none;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;
          background:rgba(185,167,255,.2);font-size:15px}
        #nq-card .nq-txt{min-width:0}
        #nq-card .nq-lbl{display:block;font-size:11px;opacity:.65}
        #nq-card .nq-val{display:block;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #nq-card .nq-sub{display:block;font-size:12px;opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        #nq-card .nq-eq{display:inline-flex;gap:2px;align-items:flex-end;height:11px;margin-left:6px;vertical-align:baseline}
        #nq-card .nq-eq i{width:3px;height:100%;background:#b9a7ff;border-radius:2px;transform-origin:bottom;
          animation:nq-eq 0.9s ease-in-out infinite}
        #nq-card .nq-eq i:nth-child(2){animation-delay:.2s}
        #nq-card .nq-eq i:nth-child(3){animation-delay:.4s}
        #nq-card .nq-eq.off i{animation:none;transform:scaleY(.3)}
        @keyframes nq-eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
        #nq-card .nq-ask{margin-top:11px;width:100%;border:0;border-radius:10px;padding:9px 10px;cursor:pointer;
          font:inherit;font-weight:700;background:#b9a7ff;color:#161233}

        #nq-modal{position:fixed;inset:0;z-index:2147483001;display:none;align-items:center;justify-content:center;
          padding:16px;background:rgba(8,9,20,.6)}
        #nq-modal.open{display:flex}
        #nq-modal .nq-panel{width:min(480px,100%);max-height:min(640px,calc(100vh - 32px));display:flex;
          flex-direction:column;border-radius:20px;background:rgba(20,22,44,.97);padding:16px}
        #nq-modal .nq-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
        #nq-modal h2{margin:0;font-size:17px}
        #nq-modal .nq-close{border:0;background:rgba(255,255,255,.12);color:#fff;width:32px;height:32px;
          border-radius:50%;cursor:pointer;font-size:14px}
        #nq-modal .nq-hint{margin:0 0 10px;font-size:12px;opacity:.7}
        #nq-modal textarea{width:100%;box-sizing:border-box;min-height:84px;resize:vertical;border-radius:12px;
          border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;padding:10px 12px;
          font:inherit;font-size:14px}
        #nq-modal textarea::placeholder{color:rgba(255,255,255,.45)}
        #nq-modal .nq-bar{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:8px}
        #nq-modal .nq-count{font-size:12px;opacity:.65;font-variant-numeric:tabular-nums}
        #nq-modal .nq-send{border:0;border-radius:10px;padding:9px 16px;cursor:pointer;font:inherit;font-weight:700;
          background:#b9a7ff;color:#161233}
        #nq-modal .nq-send:disabled{opacity:.5;cursor:not-allowed}
        #nq-modal .nq-msg{min-height:18px;margin:8px 0 0;font-size:12.5px}
        #nq-modal .nq-msg.err{color:#ff9aa8}
        #nq-modal .nq-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
        #nq-modal .nq-list{margin-top:10px;overflow:auto;display:flex;flex-direction:column;gap:10px;
          padding-right:2px;border-top:1px solid rgba(255,255,255,.12);padding-top:12px}
        #nq-modal .nq-item{border-radius:12px;background:rgba(255,255,255,.06);padding:10px 12px}
        #nq-modal .nq-q{margin:0;font-weight:700;word-break:break-word}
        #nq-modal .nq-a{margin:6px 0 0;opacity:.92;word-break:break-word}
        #nq-modal .nq-time{display:block;margin-top:6px;font-size:11px;opacity:.55}
        #nq-modal .nq-empty{opacity:.6;text-align:center;padding:8px 0}
        #nq-card button:focus-visible,#nq-modal button:focus-visible,#nq-modal textarea:focus-visible{
          outline:3px solid #fff;outline-offset:2px}
        @media (prefers-reduced-motion:reduce){#nq-card{transition:none}#nq-card .nq-eq i{animation:none}}`;
        document.head.appendChild(css);

        // ---------- CARD: ĐANG NGHE / ĐANG CHƠI ----------
        var card = h("div"); card.id = "nq-card"; card.hidden = true;
        card.setAttribute("aria-label", "Trạng thái hiện tại");
        card.innerHTML =
            '<div class="nq-head"><b>Trạng thái</b>' +
            '<button class="nq-toggle" type="button" aria-label="Thu gọn / mở rộng" title="Thu gọn">–</button></div>' +
            '<div class="nq-body">' +
              '<div class="nq-row nq-listen" hidden><span class="nq-ico">🎧</span><span class="nq-txt">' +
                '<span class="nq-lbl"><span class="nq-l1">Đang nghe</span>' +
                '<span class="nq-eq"><i></i><i></i><i></i></span></span>' +
                '<span class="nq-val nq-song"></span><span class="nq-sub nq-artist"></span></span></div>' +
              '<div class="nq-row nq-play" hidden><span class="nq-ico nq-gico">🎮</span><span class="nq-txt">' +
                '<span class="nq-lbl">Đang chơi</span>' +
                '<span class="nq-val nq-game"></span><span class="nq-sub nq-gdet"></span></span></div>' +
              '<button class="nq-ask" type="button">💬 Hỏi đáp ẩn danh</button>' +
            '</div>';
        document.body.appendChild(card);

        // Bấm vào card/modal không kích hoạt hiệu ứng chữ bay của trang
        card.addEventListener("click", function (e) { e.stopPropagation(); });

        function q(s) { return card.querySelector(s); }
        var rowL = q(".nq-listen"), rowP = q(".nq-play"), eq = q(".nq-eq");
        var lblL = q(".nq-l1"), song = q(".nq-song"), artist = q(".nq-artist");
        var gIco = q(".nq-gico"), gName = q(".nq-game"), gDet = q(".nq-gdet");

        if (store("td_nq_min") === "1") card.classList.add("min");
        q(".nq-toggle").addEventListener("click", function () {
            var min = card.classList.toggle("min");
            store("td_nq_min", min ? "1" : "0");
            this.textContent = min ? "+" : "–";
        });
        q(".nq-toggle").textContent = card.classList.contains("min") ? "+" : "–";

        // ----- dữ liệu -----
        var lan = { spotify: null, game: null };

        function localListening() {
            var a = window.bgAudio, t = document.querySelector("#music-bar .mb-title");
            if (!a || !t) return null;
            var title = (t.textContent || "").trim();
            if (!title || /Đang tải/.test(title)) return null;
            var i = title.lastIndexOf(" - ");
            return {
                song: i > 0 ? title.slice(0, i) : title,
                artist: i > 0 ? title.slice(i + 3) : "",
                playing: !a.paused && !a.ended
            };
        }

        function render() {
            // --- đang nghe ---
            var lis = null;
            if (lan.spotify) {
                lis = { song: lan.spotify.song, artist: lan.spotify.artist + " · Spotify", playing: true, live: true };
            } else {
                var loc = localListening();
                if (loc) lis = { song: loc.song, artist: (loc.artist ? loc.artist + " · " : "") + "Nhạc trên trang", playing: loc.playing };
                else if (CFG.LISTENING_FALLBACK) lis = { song: CFG.LISTENING_FALLBACK.song, artist: CFG.LISTENING_FALLBACK.artist || "", playing: false, manual: true };
            }
            rowL.hidden = !lis;
            if (lis) {
                lblL.textContent = lis.playing ? "Đang nghe" : (lis.manual ? "Hay nghe" : "Tạm dừng");
                song.textContent = lis.song;
                artist.textContent = lis.artist;
                eq.style.display = lis.manual ? "none" : "";
                eq.classList.toggle("off", !lis.playing);
            }

            // --- đang chơi ---
            var g = lan.game || CFG.PLAYING;
            rowP.hidden = !g;
            if (g) {
                gIco.textContent = g.icon || "🎮";
                gName.textContent = g.name || "";
                gDet.textContent = g.detail || "";
            }
        }

        function pollLanyard() {
            if (!CFG.DISCORD_ID || document.hidden) return;
            fetch("https://api.lanyard.rest/v1/users/" + encodeURIComponent(CFG.DISCORD_ID))
                .then(function (r) { if (!r.ok) throw 0; return r.json(); })
                .then(function (j) {
                    if (!j || !j.success) throw 0;
                    var d = j.data || {};
                    lan.spotify = d.listening_to_spotify && d.spotify ? d.spotify : null;
                    var act = (d.activities || []).filter(function (a) { return a.type === 0; })[0];
                    lan.game = act ? { name: act.name, detail: act.details || act.state || "", icon: "🎮" } : null;
                    render();
                })
                .catch(function () {});
        }

        render();
        setInterval(render, 1500);          // theo dõi trình phát nhạc của trang
        pollLanyard();
        setInterval(pollLanyard, CFG.POLL_MS);

        // ---------- MODAL: HỎI ĐÁP ẨN DANH ----------
        var modal = h("div"); modal.id = "nq-modal";
        modal.innerHTML =
            '<div class="nq-panel" role="dialog" aria-modal="true" aria-labelledby="nq-title">' +
              '<div class="nq-top"><h2 id="nq-title">💬 Hỏi đáp ẩn danh</h2>' +
              '<button class="nq-close" type="button" aria-label="Đóng">✕</button></div>' +
              '<p class="nq-hint">Không cần tên, không cần đăng nhập. Câu hỏi sẽ hiện sau khi mình duyệt và trả lời.</p>' +
              '<textarea class="nq-ta" maxlength="' + CFG.MAX_LEN + '" placeholder="Bạn muốn hỏi gì nào?" aria-label="Câu hỏi của bạn"></textarea>' +
              '<input class="nq-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
              '<div class="nq-bar"><span class="nq-count">0/' + CFG.MAX_LEN + '</span>' +
              '<button class="nq-send" type="button">Gửi ẩn danh</button></div>' +
              '<p class="nq-msg" role="status" aria-live="polite"></p>' +
              '<div class="nq-list" aria-label="Các câu đã được trả lời"></div>' +
            '</div>';
        document.body.appendChild(modal);

        var mq = function (s) { return modal.querySelector(s); };
        var ta = mq(".nq-ta"), hp = mq(".nq-hp"), cnt = mq(".nq-count"),
            btn = mq(".nq-send"), msg = mq(".nq-msg"), list = mq(".nq-list");

        modal.addEventListener("click", function (e) {
            e.stopPropagation();
            if (e.target === modal) closeModal();
        });
        mq(".nq-close").addEventListener("click", closeModal);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
        });

        var configured = !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
        if (!configured) {
            btn.disabled = true; ta.disabled = true;
            ta.placeholder = "Góc hỏi đáp chưa được bật.";
        }

        function say(t, err) {
            msg.textContent = t || "";
            msg.className = "nq-msg" + (err ? " err" : "");
        }
        ta.addEventListener("input", function () { cnt.textContent = ta.value.length + "/" + CFG.MAX_LEN; });

        function api(path, opts) {
            opts = opts || {};
            opts.headers = Object.assign({ apikey: CFG.SUPABASE_KEY, "Content-Type": "application/json" }, opts.headers || {});
            return fetch(CFG.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/" + path, opts);
        }

        function loadList() {
            list.textContent = "";
            if (!configured) { list.appendChild(h("div", "nq-empty", "Chưa có dữ liệu.")); return; }
            list.appendChild(h("div", "nq-empty", "Đang tải…"));
            api(CFG.TABLE + "?select=id,created_at,question,answer&approved=eq.true&order=created_at.desc&limit=" + CFG.LIST_LIMIT)
                .then(function (r) { if (!r.ok) throw 0; return r.json(); })
                .then(function (rows) {
                    list.textContent = "";
                    if (!rows.length) { list.appendChild(h("div", "nq-empty", "Chưa có câu hỏi nào được trả lời. Bạn hỏi đầu tiên nhé!")); return; }
                    rows.forEach(function (it) {
                        var box = h("div", "nq-item");
                        box.appendChild(h("p", "nq-q", "❓ " + it.question));
                        if (it.answer) box.appendChild(h("p", "nq-a", "💜 " + it.answer));
                        box.appendChild(h("span", "nq-time", ago(it.created_at)));
                        list.appendChild(box);
                    });
                })
                .catch(function () {
                    list.textContent = "";
                    list.appendChild(h("div", "nq-empty", "Không tải được danh sách, thử lại sau nhé."));
                });
        }

        var lastFocus = null;
        function openModal() {
            lastFocus = document.activeElement;
            modal.classList.add("open");
            say("");
            loadList();
            setTimeout(function () { if (!ta.disabled) ta.focus(); }, 50);
        }
        function closeModal() {
            modal.classList.remove("open");
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        btn.addEventListener("click", function () {
            if (!configured) return;
            if (hp.value) { ta.value = ""; say("Đã gửi!"); return; }   // bẫy bot: giả vờ thành công
            var text = ta.value.trim();
            if (text.length < 3) { say("Câu hỏi hơi ngắn, viết thêm chút nhé.", true); return; }
            var last = parseInt(store("td_qa_last"), 10) || 0;
            var wait = CFG.COOLDOWN_MS - (Date.now() - last);
            if (wait > 0) { say("Chờ " + Math.ceil(wait / 1000) + " giây nữa rồi gửi tiếp nhé.", true); return; }

            btn.disabled = true; say("Đang gửi…");
            api(CFG.TABLE, {
                method: "POST",
                headers: { Prefer: "return=minimal" },
                body: JSON.stringify({ question: text.slice(0, CFG.MAX_LEN) })
            })
                .then(function (r) {
                    if (!r.ok) throw new Error(r.status);
                    store("td_qa_last", String(Date.now()));
                    ta.value = ""; cnt.textContent = "0/" + CFG.MAX_LEN;
                    say("Đã gửi! Câu hỏi sẽ hiện ra sau khi mình duyệt và trả lời 💜");
                })
                .catch(function () { say("Gửi không được, thử lại sau nhé.", true); })
                .then(function () { btn.disabled = false; });
        });

        q(".nq-ask").addEventListener("click", openModal);
        // Nếu trong HTML của bạn có sẵn nút riêng, chỉ cần thêm class="nq-open" là mở được góc hỏi đáp
        document.addEventListener("click", function (e) {
            var t = e.target.closest && e.target.closest(".nq-open");
            if (t) { e.preventDefault(); openModal(); }
        });

        // ---------- HIỆN CARD SAU KHI MỞ MÀN HÌNH KHÓA ----------
        var revealed = false;
        function reveal() {
            if (revealed) return;
            revealed = true;
            card.hidden = false;
            requestAnimationFrame(function () { card.classList.add("show"); });
        }
        var delay = window.innerWidth <= 700 ? 7000 : 1200;  // trên điện thoại chờ lời chào ẩn đi
        document.addEventListener("click", function hnd(e) {
            if (e.target.closest && e.target.closest(".td-lock-screen")) {
                document.removeEventListener("click", hnd, true);
                setTimeout(reveal, delay);
            }
        }, true);
        setTimeout(function () {
            if (!document.querySelector(".td-lock-screen")) reveal();
        }, 3000);
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
} catch (e) { console.error("Status/QA error:", e); }
/* --- HẾT ĐANG NGHE / ĐANG CHƠI + HỎI ĐÁP --- */