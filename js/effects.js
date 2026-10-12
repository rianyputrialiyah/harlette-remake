(function () {
    'use strict';
 
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;   // pengguna yang mematikan animasi: tampilkan halaman biasa
 
    function $(selector, root) {
        return (root || document).querySelector(selector);
    }
 
    function $$(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }
 
 
    /* ---------- CSS EFEK (disuntik otomatis) ---------- */
    var css = [
        /* muncul saat halaman dibuka */
        '.ld { opacity: 0; transform: translateY(26px); transition: opacity .8s ease, transform .8s ease; }',
        '.ld.ld-right { transform: translateX(70px); }',
        '.ld-ready .ld { opacity: 1; transform: none; }',
 
        /* judul hero: kata naik satu per satu */
        '.hero-text h1 .ld-word { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .12em; margin-bottom: -.12em; }',
        '.hero-text h1 .ld-word-in { display: inline-block; transform: translateY(115%); transition: transform .85s cubic-bezier(.2,.7,.2,1); }',
        '.ld-ready .hero-text h1 .ld-word-in { transform: translateY(0); }',
 
        /* muncul saat di-scroll */
        '.rv { opacity: 0; transition: opacity .8s ease, transform .8s cubic-bezier(.2,.7,.2,1); }',
        '.rv.rv-up { transform: translateY(40px); }',
        '.rv.rv-left { transform: translateX(-60px); }',
        '.rv.rv-right { transform: translateX(60px); }',
        '.rv.rv-zoom { transform: scale(.92); }',
        '.rv.rv-in { opacity: 1; transform: none; }'
    ].join('\n');
 
    var style = document.createElement('style');
    style.id = 'effects-style';
    style.textContent = css;
    document.head.appendChild(style);
 
 
    /* =========================================================
       1. ANIMASI SAAT HALAMAN DIBUKA (hero)
       ========================================================= */
    function splitWords(el) {
        var count = 0;
 
        (function walk(node) {
            Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                if (child.nodeType === 3) {
                    var parts = child.textContent.split(/(\s+)/);
                    var fragment = document.createDocumentFragment();
 
                    parts.forEach(function (part) {
                        if (!part) return;
 
                        if (/^\s+$/.test(part)) {
                            fragment.appendChild(document.createTextNode(part));
                            return;
                        }
 
                        var wrap = document.createElement('span');
                        var inner = document.createElement('span');
                        wrap.className = 'ld-word';
                        inner.className = 'ld-word-in';
                        inner.textContent = part;
                        inner.style.transitionDelay = (count * 90) + 'ms';
                        count++;
 
                        wrap.appendChild(inner);
                        fragment.appendChild(wrap);
                    });
 
                    node.replaceChild(fragment, child);
                } else if (child.nodeType === 1) {
                    walk(child);
                }
            });
        })(el);
 
        return count;
    }
 
    var title = $('.hero-text h1');
    var wordCount = 0;
 
    if (title) {
        title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
        wordCount = splitWords(title);
    }
 
    var afterTitle = wordCount * 90 + 150;
 
    [
        ['.hero-text p', afterTitle, ''],
        ['.hero-button', afterTitle + 150, ''],
        ['.hero-img-wrap img', 250, 'ld-right']
    ].forEach(function (item) {
        var el = $(item[0]);
        if (!el) return;
        el.classList.add('ld');
        if (item[2]) el.classList.add(item[2]);
        el.style.transitionDelay = item[1] + 'ms';
    });
 
    // mulai setelah font siap (maksimal tunggu 0,8 detik)
    var started = false;
    function start() {
        if (started) return;
        started = true;
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                document.documentElement.classList.add('ld-ready');
            });
        });
    }
 
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    setTimeout(start, 800);
 
 
    /* =========================================================
       2. MUNCUL SAAT DI-SCROLL
       ========================================================= */
    var revealMap = [
        ['.sidebar', 'rv-up'],
        ['.stat-info', 'rv-up'],
        ['.bestseller-sec .title', 'rv-up'],
        ['.bestseller-sec img', 'rv-zoom'],
        ['.whyus-head', 'rv-up'],
        ['.whyus-photo', 'rv-left'],
        ['.whyus-card', 'rv-right'],
        ['.whyus-checks li', 'rv-up'],
        ['.testi-title', 'rv-up'],
        ['.testi-card', 'rv-up'],
        ['.contact-grid > *', 'rv-up'],
        ['.footer-grid > *', 'rv-up']
    ];
 
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                // yang sudah terlewat (misal halaman di-refresh di tengah) ikut ditampilkan
                if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
                    entry.target.classList.add('rv-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
 
        revealMap.forEach(function (item) {
            $$(item[0]).forEach(function (el) {
                var index = Array.prototype.indexOf.call(el.parentNode.children, el);
 
                el.classList.add('rv', item[1]);
                el.style.transitionDelay = Math.min(index, 5) * 110 + 'ms';
                observer.observe(el);
            });
        });
    }
 
 
    /* =========================================================
       3. ANGKA STATISTIK MENGHITUNG NAIK
       ========================================================= */
    $$('.stat-info span').forEach(function (el) {
        var raw = el.textContent.trim();
        var num = parseFloat(raw.replace(/[^\d.]/g, ''));
        if (isNaN(num)) return;
 
        var suffix = raw.replace(/[\d.\s]/g, '');
        var isInt = num % 1 === 0;
 
        el.textContent = (isInt ? '0' : '0.0') + suffix;
 
        var counter = new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting) return;
            counter.disconnect();
 
            var begin = null;
            var duration = 1400;
 
            function tick(t) {
                if (!begin) begin = t;
                var p = Math.min((t - begin) / duration, 1);
                var value = num * (1 - Math.pow(1 - p, 3));
 
                el.textContent = (isInt ? Math.round(value) : value.toFixed(1)) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
        });
 
        counter.observe(el);
    });
})();
 