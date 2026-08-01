document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 0. SCRATCH TO OPEN INVITE
    // ==========================================
    const scratchCanvas = document.getElementById("scratchCanvas");
    const scratchScreen = document.getElementById("scratchScreen");
    const bgAudio = document.getElementById('bg-audio');
    const audioToggle = document.getElementById('audio-toggle');
    const audioIcon = document.getElementById('audio-icon');

    if (scratchCanvas && scratchScreen) {
        const ctx = scratchCanvas.getContext("2d");
        let isDrawing = false;
        let isFinished = false;

        function resizeCanvas() {
            if (isFinished) return;
            const rect = scratchCanvas.parentNode.getBoundingClientRect();
            scratchCanvas.width = rect.width;
            scratchCanvas.height = rect.height;
            drawGoldFoil();
        }

        // Draw Gold Foil Texture programmatically (Emerald + Gold luxury theme)
        function drawGoldFoil() {
            const w = scratchCanvas.width;
            const h = scratchCanvas.height;

            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#D4AF37');
            grad.addColorStop(0.25, '#f5e6a8');
            grad.addColorStop(0.5, '#0B5D4B');
            grad.addColorStop(0.75, '#f5e6a8');
            grad.addColorStop(1, '#a8842a');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            const imgData = ctx.getImageData(0, 0, w, h);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 22;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
            ctx.putImageData(imgData, 0, 0);

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
            ctx.lineWidth = 1;
            const gridSize = 45;
            ctx.beginPath();
            for (let x = 0; x < w; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
            }
            for (let y = 0; y < h; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
            }
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 8;
            ctx.strokeRect(15, 15, w - 30, h - 30);

            ctx.strokeStyle = 'rgba(11, 93, 75, 0.35)';
            ctx.lineWidth = 2;
            ctx.strokeRect(24, 24, w - 48, h - 48);

            ctx.fillStyle = '#0B5D4B';
            ctx.font = '600 15px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.lineWidth = 4;
            ctx.strokeText('Scratch to Reveal Invitation', w / 2, h / 2);
            ctx.fillText('Scratch to Reveal Invitation', w / 2, h / 2);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        ctx.globalCompositeOperation = "destination-out";

        let autoRevealStarted = false;
        let isChecking = false;

        function getMousePos(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
                return {
                    x: e.touches[0].clientX - rect.left,
                    y: e.touches[0].clientY - rect.top
                };
            }
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }

        function scratch(x, y) {
            if (autoRevealStarted) return;
            ctx.beginPath();
            ctx.arc(x, y, 35, 0, Math.PI * 2);
            ctx.fill();
            checkReveal();
        }

        function checkReveal() {
            if (autoRevealStarted) return;
            if (isChecking) return;
            isChecking = true;

            setTimeout(() => {
                isChecking = false;
                if (autoRevealStarted) return;

                const w = scratchCanvas.width;
                const h = scratchCanvas.height;
                const imgData = ctx.getImageData(0, 0, w, h);
                const pixels = imgData.data;
                let transparent = 0;

                const step = 24;
                let totalChecked = 0;
                for (let i = 3; i < pixels.length; i += 4 * step) {
                    totalChecked++;
                    if (pixels[i] === 0) {
                        transparent++;
                    }
                }

                const percent = transparent / totalChecked;

                if (percent >= 0.22) {
                    revealInvitation();
                }
            }, 80);
        }

        scratchCanvas.addEventListener("mousedown", (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        });

        scratchCanvas.addEventListener("mousemove", (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        });

        window.addEventListener("mouseup", () => { isDrawing = false; });

        scratchCanvas.addEventListener("touchstart", (e) => {
            isDrawing = true;
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        }, { passive: false });

        scratchCanvas.addEventListener("touchmove", (e) => {
            if (!isDrawing) return;
            e.preventDefault();
            const pos = getMousePos(e);
            scratch(pos.x, pos.y);
        }, { passive: false });

        window.addEventListener("touchend", () => { isDrawing = false; });

        function revealInvitation() {
            if (autoRevealStarted) return;
            autoRevealStarted = true;
            isFinished = true;

            // Auto-play music after this first interaction (satisfies autoplay policy)
            if (bgAudio) {
                bgAudio.play()
                    .then(() => {
                        audioIcon.innerHTML = `
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        `;
                        audioToggle.setAttribute('title', 'Pause Music');
                    })
                    .catch(err => {
                        console.log("Audio playback blocked by browser:", err);
                    });
            }

            if (window.gsap) {
                gsap.to("#scratchCanvas", {
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete() {
                        gsap.to("#scratchScreen", {
                            opacity: 0,
                            duration: 0.6,
                            ease: "power2.out",
                            onComplete() {
                                scratchScreen.remove();
                            }
                        });
                    }
                });

                gsap.from(".hero", { scale: 1.05, opacity: 0, duration: 1.2, ease: "power3.out" });
                gsap.from(".hero-content > *", { y: 60, opacity: 0, stagger: 0.15, duration: 1, ease: "power3.out" });
            } else {
                scratchScreen.style.transition = 'opacity 0.6s ease';
                scratchScreen.style.opacity = '0';
                setTimeout(() => scratchScreen.remove(), 600);
            }
        }
    }

    // ==========================================
    // 1. LIVE COUNTDOWN TIMER
    // Target: 27 August 2026, 7:00 PM (Indian Standard Time: +05:30)
    // ==========================================
    const targetDate = new Date('2026-08-27T19:00:00+05:30').getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            clearInterval(countdownTimer);
            document.getElementById('days').innerText = "00";
            document.getElementById('hours').innerText = "00";
            document.getElementById('minutes').innerText = "00";
            document.getElementById('seconds').innerText = "00";

            const titleEl = document.querySelector('.countdown-title');
            if (titleEl) titleEl.innerText = "The Celebration Has Begun!";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    }, 1000);


    // ==========================================
    // 2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
    // ==========================================
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    } else {
        revealElements.forEach(el => el.classList.add('active'));
    }


    // ==========================================
    // 3. AUDIO CONTROLLER PLAYBACK
    // ==========================================
    function playAudio() {
        if (bgAudio && bgAudio.paused) {
            bgAudio.play()
                .then(() => {
                    audioIcon.innerHTML = `
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    `;
                    audioToggle.setAttribute('title', 'Pause Music');
                })
                .catch(err => {
                    console.log("Audio playback failed:", err);
                });
        }
    }

    function pauseAudio() {
        if (bgAudio && !bgAudio.paused) {
            bgAudio.pause();
            audioIcon.innerHTML = `
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM12 4L9.91 6.09 12 8.18V4zm-8.09-.09L2.81 5.09 6.82 9H4v6h4l5 5v-6.83l4.88 4.88c-.62.47-1.31.85-2.08 1.09v2.01c1.3-.3 2.49-.93 3.47-1.76l2.62 2.62 1.41-1.41L4.82 2.81 3.91 3.91zM12 15.17L9.83 13H8v-2h1.83l.26-.26 1.91 1.91v2.52z"/>
            `;
            audioToggle.setAttribute('title', 'Play Music');
        }
    }

    if (audioToggle && bgAudio && audioIcon) {
        audioToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgAudio.paused) {
                playAudio();
            } else {
                pauseAudio();
            }
        });
    }

    // Fallback: start music on first general interaction if scratch card is absent / already skipped
    let musicStarted = false;
    function tryStartMusicOnce() {
        if (musicStarted || !bgAudio) return;
        if (bgAudio.paused) {
            bgAudio.play().then(() => {
                musicStarted = true;
                audioIcon.innerHTML = `
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                `;
            }).catch(() => {});
        }
    }
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.body.addEventListener(evt, tryStartMusicOnce, { once: true, passive: true });
    });


    // ==========================================
    // 4. FLOATING PARTICLES (ambient gold dust)
    // ==========================================
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        const particleCount = window.innerWidth < 768 ? 16 : 28;
        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            const size = 3 + Math.random() * 4;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;
            p.style.setProperty('--drift', `${(Math.random() * 60 - 30)}px`);
            const duration = 10 + Math.random() * 12;
            p.style.animationDuration = `${duration}s`;
            p.style.animationDelay = `${Math.random() * duration}s`;
            particlesContainer.appendChild(p);
        }
    }


    // ==========================================
    // 5. HERO PARALLAX ON SCROLL (subtle)
    // ==========================================
    const heroImg = document.getElementById('heroImg');
    if (heroImg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const offset = window.scrollY;
                    if (offset < window.innerHeight) {
                        heroImg.style.transform = `translateY(${offset * 0.15}px) scale(1.08)`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

});
