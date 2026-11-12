/* --- ẨN TIỆN ÍCH KHI ĐANG Ở MÀN HÌNH CHỜ (KHÓA) --- */
(function () {
    // Các tiện ích cần ẩn khi màn hình chờ đang hiện
    var WIDGETS = "#music-bar,#music-ask,#nq-card,#nq-modal,#view-count,#greet-stack,#tc-pop";
    var GRACE_MS = 3000;  // chờ tối đa bấy lâu để màn hình chờ xuất hiện; không có thì coi như đã mở
    var CHECK_MS = 100;   // tần suất kiểm tra trạng thái màn hình chờ

    var css = document.createElement("style");
    css.textContent =
        "html.td-locked " + WIDGETS.split(",").join(",html.td-locked ") +
        "{opacity:0!important;visibility:hidden!important;pointer-events:none!important}";
    document.head.appendChild(css);

    var t0 = Date.now(), wasLocked = false;

    function isLocked() {
        var el = document.querySelector(".td-lock-screen");
        if (!el) return Date.now() - t0 < GRACE_MS;   // màn hình chờ chưa được tạo thì vẫn ẩn
        var cs = getComputedStyle(el);
        return cs.display !== "none" &&
               cs.visibility !== "hidden" &&
               cs.pointerEvents !== "none" &&
               parseFloat(cs.opacity) > 0.05;
    }

    // Khi màn hình chờ hiện lại thì đóng luôn các hộp đang mở,
    // để lúc mở khóa không có hộp nào tự bật sẵn
    function closeOverlays() {
        var pop = document.getElementById("tc-pop");        // hộp chọn màu
        if (pop) pop.hidden = true;
        var tb = document.querySelector(".tc-btn");
        if (tb) tb.setAttribute("aria-expanded", "false");
        var modal = document.getElementById("nq-modal");    // hộp hỏi đáp ẩn danh
        if (modal) modal.classList.remove("open");
        var ask = document.getElementById("music-ask");     // khung hỏi chuyển nhạc
        if (ask) ask.classList.remove("show");
    }

    function update() {
        var locked = isLocked();
        document.documentElement.classList.toggle("td-locked", locked);
        if (locked && !wasLocked) closeOverlays();
        wasLocked = locked;
    }

    update();                              // ẩn ngay từ đầu
    setInterval(update, CHECK_MS);         // mở khóa thì hiện, kéo lại màn hình chờ thì ẩn
    document.addEventListener("click", function () { setTimeout(update, 0); }, true);
})();
/* --- HẾT PHẦN ẨN TIỆN ÍCH --- */