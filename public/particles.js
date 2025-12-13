// Space Background System (Starfield)
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return; // Guard clause

    const ctx = canvas.getContext('2d');

    let width, height;
    let stars = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5; // Small stars
            this.speedZ = Math.random() * 2; // Depth speed
            this.opacity = Math.random();
            this.twinkleSpeed = Math.random() * 0.02;
        }

        update() {
            // "Warp" effect or simple drift
            this.y -= 0.2; // Slowly drift up

            // Twinkle
            this.opacity += this.twinkleSpeed;
            if (this.opacity > 1 || this.opacity < 0.2) {
                this.twinkleSpeed = -this.twinkleSpeed;
            }

            // Reset usage
            if (this.y < 0) {
                this.y = height;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.globalAlpha = Math.abs(this.opacity);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Optional: Glow for bigger stars
            if (this.size > 1.2) {
                ctx.shadowBlur = 4;
                ctx.shadowColor = "white";
            } else {
                ctx.shadowBlur = 0;
            }
        }
    }

    function createStars() {
        stars = [];
        const count = Math.floor((width * height) / 4000);
        for (let i = 0; i < count; i++) {
            stars.push(new Star());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(star => {
            star.update();
            star.draw();
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    resize();
    createStars();
    animate();
}

document.addEventListener('DOMContentLoaded', initParticles);
