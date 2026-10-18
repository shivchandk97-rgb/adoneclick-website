/* ==========================================================================
   AdOneClick - Motion & 3D Layer
   3D lead-network globe, scroll reveals, perspective mockup, stat counters,
   tilt cards and magnetic CTAs. Respects prefers-reduced-motion.
   ========================================================================== */

(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    document.addEventListener('DOMContentLoaded', () => {
        if (reduceMotion) return;

        initReveal();
        initStatCounters();
        initHeroGlobe();
        initMockup3D();

        if (finePointer) {
            initTiltCards();
            initBentoSpotlight();
            initMagneticButtons();
        }
    });

    /* ----------------------------------------------------------------------
       Scroll Reveal with sibling stagger
       ---------------------------------------------------------------------- */
    function initReveal() {
        const selectors = [
            '.section-header', '.stat-box', '.bento-tile', '.hero-visual', '.wf-node', '.faq-item',
            '.form-container', '.partner-logo-item', '.feature-list-item', '.pipeline-col',
            '.comparison-section table', '.cta-banner-content', '.contact-item',
            '.privacy-content > h2', '.privacy-content > p', '.privacy-content > ul',
            '.footer-col', '.footer-brand'
        ];
        const elements = document.querySelectorAll(selectors.join(','));
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        elements.forEach(el => {
            const siblings = Array.from(el.parentElement.children).filter(c => c.matches(selectors.join(',')));
            const index = Math.max(0, siblings.indexOf(el));
            el.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
            el.classList.add('reveal');
            observer.observe(el);
        });
    }

    /* ----------------------------------------------------------------------
       Count-up stat numbers ("3.8x", "99.98%", "< 120ms" ...)
       ---------------------------------------------------------------------- */
    function initStatCounters() {
        const stats = document.querySelectorAll('.stat-number');
        if (!stats.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                observer.unobserve(entry.target);
                countUp(entry.target);
            });
        }, { threshold: 0.6 });

        stats.forEach(el => {
            if (/^(\D*?)(\d+(?:\.\d+)?)(.*)$/.test(el.textContent.trim())) observer.observe(el);
        });
    }

    function countUp(el) {
        const original = el.textContent.trim();
        const [, prefix, num, suffix] = original.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
        const target = parseFloat(num);
        const decimals = (num.split('.')[1] || '').length;
        const duration = 1600;
        const start = performance.now();

        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = t < 1 ? `${prefix}${(target * eased).toFixed(decimals)}${suffix}` : original;
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    /* ----------------------------------------------------------------------
       3D Lead-Network Globe (vanilla canvas, no dependencies)
       Dots on a rotating sphere; glowing "lead" arcs fly between them.
       ---------------------------------------------------------------------- */
    function initHeroGlobe() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'hero-globe';
        canvas.setAttribute('aria-hidden', 'true');
        hero.prepend(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const COLORS = ['79,70,229', '124,58,237', '6,182,212', '16,185,129'];
        let width = 0, height = 0, dpr = 1, radius = 0, cx = 0, cy = 0;
        let points = [];
        let arcs = [];
        let rotY = 0, rotX = -0.32;
        let mouseX = 0, mouseY = 0, tiltX = 0, tiltY = 0;
        let running = false, rafId = 0, lastSpawn = 0;

        function buildSphere(count) {
            const pts = [];
            const golden = Math.PI * (3 - Math.sqrt(5));
            for (let i = 0; i < count; i++) {
                const y = 1 - (i / (count - 1)) * 2;
                const r = Math.sqrt(1 - y * y);
                const theta = golden * i;
                pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r]);
            }
            return pts;
        }

        function resize() {
            const rect = hero.getBoundingClientRect();
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const mobile = width < 768;
            const visual = hero.querySelector('.hero-visual');
            const vRect = visual ? visual.getBoundingClientRect() : null;
            if (vRect && vRect.width > 0) {
                // Centre the globe in the hero's visual column
                cx = vRect.left - rect.left + vRect.width / 2;
                cy = vRect.top - rect.top + vRect.height / 2;
                radius = Math.min(vRect.width, vRect.height) * (mobile ? 0.36 : 0.38);
            } else {
                radius = mobile ? Math.min(width * 0.62, 260) : Math.min(width * 0.27, 340);
                cx = width / 2;
                cy = mobile ? 300 : 330;
            }
            points = buildSphere(mobile ? 260 : 520);
        }

        function rotate(p) {
            const ry = rotY + tiltY, rx = rotX + tiltX;
            const cosY = Math.cos(ry), sinY = Math.sin(ry);
            const cosX = Math.cos(rx), sinX = Math.sin(rx);
            const x1 = p[0] * cosY - p[2] * sinY;
            const z1 = p[0] * sinY + p[2] * cosY;
            const y2 = p[1] * cosX - z1 * sinX;
            const z2 = p[1] * sinX + z1 * cosX;
            return [x1, y2, z2];
        }

        function project(v, scaleR = radius) {
            const fov = 3.2;
            const s = fov / (fov + v[2]);
            return [cx + v[0] * scaleR * s, cy + v[1] * scaleR * s, s, v[2]];
        }

        function slerp(a, b, t) {
            const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
            const omega = Math.acos(dot);
            if (omega < 1e-4) return a.slice();
            const so = Math.sin(omega);
            const wa = Math.sin((1 - t) * omega) / so, wb = Math.sin(t * omega) / so;
            return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
        }

        function arcPoint(arc, t) {
            const p = slerp(arc.a, arc.b, t);
            const lift = 1 + arc.height * Math.sin(Math.PI * t);
            return [p[0] * lift, p[1] * lift, p[2] * lift];
        }

        function spawnArc() {
            const a = points[Math.floor(Math.random() * points.length)];
            let b = points[Math.floor(Math.random() * points.length)];
            let tries = 0;
            while ((a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) > 0.55 && tries++ < 8) {
                b = points[Math.floor(Math.random() * points.length)];
            }
            arcs.push({
                a, b,
                t: 0,
                speed: 0.006 + Math.random() * 0.006,
                height: 0.18 + Math.random() * 0.22,
                color: COLORS[Math.floor(Math.random() * COLORS.length)]
            });
        }

        function drawCurve(fn, color) {
            ctx.strokeStyle = color;
            ctx.beginPath();
            for (let k = 0; k <= 48; k++) {
                const [x, y] = project(rotate(fn(k / 48)));
                k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        function draw(now) {
            ctx.clearRect(0, 0, width, height);

            rotY += 0.0016;
            tiltX += (mouseY * 0.25 - tiltX) * 0.05;
            tiltY += (mouseX * 0.45 - tiltY) * 0.05;

            // Atmosphere halo
            const halo = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.35);
            halo.addColorStop(0, 'rgba(99,102,241,0.10)');
            halo.addColorStop(0.6, 'rgba(6,182,212,0.05)');
            halo.addColorStop(1, 'rgba(6,182,212,0)');
            ctx.fillStyle = halo;
            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
            ctx.fill();

            // Orbit ring
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-0.28 + tiltY * 0.3);
            ctx.scale(1, 0.22 + tiltX * 0.2);
            ctx.strokeStyle = 'rgba(124,58,237,0.16)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, 0, radius * 1.32, 0, Math.PI * 2);
            ctx.stroke();
            const orbitA = now * 0.0006;
            ctx.fillStyle = 'rgba(6,182,212,0.85)';
            ctx.beginPath();
            ctx.arc(Math.cos(orbitA) * radius * 1.32, Math.sin(orbitA) * radius * 1.32, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Wireframe meridians and parallels give the sphere its 3D read
            ctx.lineWidth = 1;
            for (let m = 0; m < 8; m++) {
                const lon = (m / 8) * Math.PI;
                drawCurve((t) => {
                    const lat = t * Math.PI * 2;
                    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
                }, 'rgba(79,70,229,0.07)');
            }
            for (let l = 1; l < 6; l++) {
                const lat = -Math.PI / 2 + (l / 6) * Math.PI;
                drawCurve((t) => {
                    const lon = t * Math.PI * 2;
                    return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
                }, 'rgba(6,182,212,0.07)');
            }

            // Sphere dots (front brighter, back fainter)
            for (let i = 0; i < points.length; i++) {
                const v = rotate(points[i]);
                const [x, y, s, z] = project(v);
                const front = (1 - z) / 2; // 0 back .. 1 front
                ctx.fillStyle = `rgba(79,70,229,${0.12 + front * 0.58})`;
                const size = (1 + front * 1.8) * s;
                ctx.beginPath();
                ctx.arc(x, y, size / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Lead arcs
            if (now - lastSpawn > 520 && arcs.length < 9) {
                spawnArc();
                lastSpawn = now;
            }

            const TRAIL = 0.28, SEG = 18;
            arcs = arcs.filter(arc => arc.t < 1 + TRAIL + 0.35);
            arcs.forEach(arc => {
                arc.t += arc.speed;
                const head = Math.min(arc.t, 1);
                const tail = Math.max(0, arc.t - TRAIL);

                if (head > tail) {
                    let prev = project(rotate(arcPoint(arc, tail)));
                    for (let k = 1; k <= SEG; k++) {
                        const t = tail + (head - tail) * (k / SEG);
                        const cur = project(rotate(arcPoint(arc, t)));
                        const depth = (1 - cur[3]) / 2;
                        ctx.strokeStyle = `rgba(${arc.color},${(k / SEG) * (0.25 + depth * 0.7)})`;
                        ctx.lineWidth = 1.6 * cur[2];
                        ctx.beginPath();
                        ctx.moveTo(prev[0], prev[1]);
                        ctx.lineTo(cur[0], cur[1]);
                        ctx.stroke();
                        prev = cur;
                    }
                    if (arc.t <= 1) {
                        ctx.fillStyle = `rgba(${arc.color},0.95)`;
                        ctx.shadowColor = `rgba(${arc.color},0.9)`;
                        ctx.shadowBlur = 12;
                        ctx.beginPath();
                        ctx.arc(prev[0], prev[1], 2.6 * prev[2], 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }

                // Landing ripple when a lead reaches its destination
                if (arc.t > 1) {
                    const p = project(rotate(arc.b));
                    const k = (arc.t - 1) / (TRAIL + 0.35);
                    ctx.strokeStyle = `rgba(${arc.color},${(1 - k) * 0.8})`;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(p[0], p[1], 3 + k * 16 * p[2], 0, Math.PI * 2);
                    ctx.stroke();
                }
            });

            rafId = requestAnimationFrame(draw);
        }

        function start() {
            if (running) return;
            running = true;
            rafId = requestAnimationFrame(draw);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        resize();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        if (finePointer) {
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                mouseX = (e.clientX - rect.left) / rect.width - 0.5;
                mouseY = (e.clientY - rect.top) / rect.height - 0.5;
            });
            hero.addEventListener('mouseleave', () => { mouseX = 0; mouseY = 0; });
        }

        new IntersectionObserver(([entry]) => {
            entry.isIntersecting && !document.hidden ? start() : stop();
        }).observe(hero);

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stop();
            else if (hero.getBoundingClientRect().bottom > 0) start();
        });

        requestAnimationFrame(() => canvas.classList.add('ready'));
    }

    /* ----------------------------------------------------------------------
       Hero Mockup: tilted back in 3D, flattens as it scrolls into view,
       follows the mouse; floating cards drift on a parallax layer.
       ---------------------------------------------------------------------- */
    function initMockup3D() {
        const wrapper = document.querySelector('.hero-mockup-wrapper');
        if (!wrapper) return;

        wrapper.classList.add('is-3d');
        const floats = wrapper.querySelectorAll('.hero-floating-card');
        const maxAngle = window.innerWidth < 768 ? 12 : 24;
        let mouseRy = 0, mouseRx = 0, ticking = false;

        function update() {
            ticking = false;
            const rect = wrapper.getBoundingClientRect();
            const vh = window.innerHeight;
            // 0 when the wrapper top is at the viewport bottom, 1 when it reaches 25% from the top
            const progress = Math.min(Math.max((vh - rect.top) / (vh * 0.75), 0), 1);
            const eased = 1 - Math.pow(1 - progress, 2);
            wrapper.style.setProperty('--mock-rx', `${(maxAngle * (1 - eased) + mouseRx).toFixed(2)}deg`);
            wrapper.style.setProperty('--mock-ry', `${mouseRy.toFixed(2)}deg`);
            wrapper.style.setProperty('--mock-scale', (0.92 + 0.08 * eased).toFixed(4));
        }

        function requestUpdate() {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        update();

        if (!finePointer) return;

        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            mouseRy = px * 6;
            mouseRx = -py * 4;
            floats.forEach((card, i) => {
                const depth = i % 2 === 0 ? 22 : -18;
                card.style.translate = `${(px * depth).toFixed(1)}px ${(py * depth).toFixed(1)}px`;
            });
            requestUpdate();
        });

        wrapper.addEventListener('mouseleave', () => {
            mouseRy = 0;
            mouseRx = 0;
            floats.forEach(card => { card.style.translate = ''; });
            requestUpdate();
        });
    }

    /* ----------------------------------------------------------------------
       3D Tilt Cards with moving glare
       ---------------------------------------------------------------------- */
    function initTiltCards() {
        const cards = document.querySelectorAll('.stat-box, .wf-node, .contact-item');
        cards.forEach(card => {
            card.classList.add('tilt-card');
            const strength = 9;
            let glare = null;
            if (card.matches('.stat-box')) {
                glare = document.createElement('span');
                glare.className = 'tilt-glare';
                card.appendChild(glare);
            }

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                card.classList.add('tilt-active');
                card.style.transform =
                    `perspective(900px) rotateX(${((0.5 - py) * strength).toFixed(2)}deg) ` +
                    `rotateY(${((px - 0.5) * strength).toFixed(2)}deg) translateY(-4px)`;
                if (glare) {
                    card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
                    card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
                }
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('tilt-active');
                card.style.transform = '';
            });
        });
    }

    /* ----------------------------------------------------------------------
       Bento tiles: spotlight follows the cursor
       ---------------------------------------------------------------------- */
    function initBentoSpotlight() {
        document.querySelectorAll('.bento-tile').forEach(tile => {
            tile.addEventListener('mousemove', (e) => {
                const rect = tile.getBoundingClientRect();
                tile.style.setProperty('--mx', `${(e.clientX - rect.left).toFixed(0)}px`);
                tile.style.setProperty('--my', `${(e.clientY - rect.top).toFixed(0)}px`);
            });
        });
    }

    /* ----------------------------------------------------------------------
       Magnetic CTA buttons
       ---------------------------------------------------------------------- */
    function initMagneticButtons() {
        document.querySelectorAll('.btn-lg').forEach(btn => {
            btn.classList.add('magnetic');
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const dx = e.clientX - (rect.left + rect.width / 2);
                const dy = e.clientY - (rect.top + rect.height / 2);
                btn.style.translate = `${(dx * 0.18).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.translate = ''; });
        });
    }
})();
