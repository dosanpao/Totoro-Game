/**
 * VALENTINE SCREEN
 * The final reveal - displaying "Will you be my Valentine?"
 * A beautiful, screenshot-ready aesthetic screen
 */

class ValentineScreen {
    constructor(game) {
        this.game = game;
        
        // State
        this.celebrating = false;
        this.celebrationTimer = 0;
        this.fadeInProgress = 0;
        
        // Player light at center
        this.playerLight = null;
        
        // Floating hearts and particles
        this.floatingHearts = [];
        this.sparkles = [];
        
        // Background gradient animation
        this.gradientPhase = 0;
    }

    /**
     * Called when entering this screen
     */
    enter() {
        Utils.hideAllScreens();
        Utils.showUI('valentineUI');
        
        this.celebrating = false;
        this.celebrationTimer = 0;
        this.fadeInProgress = 0;
        this.gradientPhase = 0;
        
        // Block keyboard input
        this.blockKeyboard();
        
        // Get player's chosen light color
        const lightColor = this.game.state.lightColor || CONFIG.lightColors[0];
        
        // Initialize player light at center
        this.playerLight = {
            x: CONFIG.canvas.width / 2,
            y: CONFIG.canvas.height / 2 - 50,
            size: 40,
            color: lightColor.color,
            glow: lightColor.glow,
            pulsePhase: 0
        };
        
        // Initialize floating hearts
        this.floatingHearts = this.initFloatingHearts();
        
        // Initialize sparkles
        this.sparkles = this.initSparkles();

        // Show the valentine message as pure text — no buttons, no choices
        const valentineBox = document.querySelector('.valentine-box');
        if (valentineBox) {
            valentineBox.innerHTML = `
                <p class="valentine-question">Will you be my Valentine?</p>
            `;
        }
    }
    
    /**
     * Block keyboard input (accessibility: allow Tab)
     */
    blockKeyboard() {
        this.keyboardBlocker = (e) => {
            if (e.key !== 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
        
        document.addEventListener('keydown', this.keyboardBlocker, true);
        document.addEventListener('keyup', this.keyboardBlocker, true);
        document.addEventListener('keypress', this.keyboardBlocker, true);
    }
    
    /**
     * Unblock keyboard when leaving (cleanup)
     */
    unblockKeyboard() {
        if (this.keyboardBlocker) {
            document.removeEventListener('keydown', this.keyboardBlocker, true);
            document.removeEventListener('keyup', this.keyboardBlocker, true);
            document.removeEventListener('keypress', this.keyboardBlocker, true);
            this.keyboardBlocker = null;
        }
    }
    
    /**
     * Initialize floating hearts
     */
    initFloatingHearts() {
        const hearts = [];
        for (let i = 0; i < 12; i++) {
            hearts.push({
                x: Math.random() * CONFIG.canvas.width,
                y: CONFIG.canvas.height + Math.random() * 200,
                size: 15 + Math.random() * 15,
                speed: 0.3 + Math.random() * 0.4,
                sway: Math.random() * Math.PI * 2,
                swaySpeed: 0.02 + Math.random() * 0.02,
                alpha: 0.3 + Math.random() * 0.4
            });
        }
        return hearts;
    }
    
    /**
     * Initialize sparkles
     */
    initSparkles() {
        const sparkles = [];
        for (let i = 0; i < 25; i++) {
            sparkles.push({
                x: Math.random() * CONFIG.canvas.width,
                y: Math.random() * CONFIG.canvas.height,
                size: 1 + Math.random() * 2,
                alpha: Math.random(),
                phase: Math.random() * Math.PI * 2,
                speed: 0.03 + Math.random() * 0.03
            });
        }
        return sparkles;
    }

    /**
     * Update valentine screen
     */
    update() {
        // Fade in
        if (this.fadeInProgress < 1) {
            this.fadeInProgress += 0.01;
        }
        
        // Update gradient animation
        this.gradientPhase += 0.003;
        
        // Update player light pulse
        if (this.playerLight) {
            this.playerLight.pulsePhase += 0.05;
        }
        
        // Update floating hearts
        this.updateFloatingHearts();
        
        // Update sparkles
        this.updateSparkles();
    }
    
    /**
     * Update floating hearts
     */
    updateFloatingHearts() {
        for (let i = this.floatingHearts.length - 1; i >= 0; i--) {
            const heart = this.floatingHearts[i];
            
            if (heart.isBurst) {
                // Burst particles
                heart.x += heart.vx;
                heart.y += heart.vy;
                heart.vy += 0.05; // Gravity
                heart.life--;
                heart.alpha = heart.life / 180;
                
                if (heart.life <= 0) {
                    this.floatingHearts.splice(i, 1);
                }
            } else {
                // Floating hearts
                heart.y -= heart.speed;
                heart.sway += heart.swaySpeed;
                heart.x += Math.sin(heart.sway) * 0.5;
                
                // Reset when off screen
                if (heart.y < -50) {
                    heart.y = CONFIG.canvas.height + 50;
                    heart.x = Math.random() * CONFIG.canvas.width;
                }
            }
        }
    }
    
    /**
     * Update sparkles
     */
    updateSparkles() {
        this.sparkles.forEach(sparkle => {
            sparkle.phase += sparkle.speed;
            sparkle.alpha = (Math.sin(sparkle.phase) + 1) / 2;
        });
    }

    /**
     * Draw valentine screen
     */
    draw(ctx) {
        // Pastel animated gradient background
        this.drawAnimatedBackground(ctx);
        
        // Apply fade in
        ctx.globalAlpha = this.fadeInProgress;
        
        // Draw sparkles
        this.drawSparkles(ctx);
        
        // Draw floating hearts
        this.drawFloatingHearts(ctx);
        
        // Draw player light at center
        this.drawPlayerLight(ctx);
        
        ctx.globalAlpha = 1;
    }

    /**
     * Draw animated pastel gradient background
     */
    drawAnimatedBackground(ctx) {
        const colors = [
            { r: 255, g: 240, b: 245 }, // Light pink
            { r: 255, g: 235, b: 250 }, // Lavender pink
            { r: 255, g: 245, b: 235 }, // Peach
            { r: 250, g: 240, b: 255 }  // Soft purple
        ];
        
        const phase = (Math.sin(this.gradientPhase) + 1) / 2;
        const index = Math.floor(phase * (colors.length - 1));
        const nextIndex = Math.min(index + 1, colors.length - 1);
        const blend = (phase * (colors.length - 1)) % 1;
        
        const c1 = colors[index];
        const c2 = colors[nextIndex];
        
        const r = Math.floor(c1.r + (c2.r - c1.r) * blend);
        const g = Math.floor(c1.g + (c2.g - c1.g) * blend);
        const b = Math.floor(c1.b + (c2.b - c1.b) * blend);
        
        const gradient = ctx.createRadialGradient(
            CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, 0,
            CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width
        );
        
        gradient.addColorStop(0, `rgb(${Math.min(255, r + 10)}, ${Math.min(255, g + 10)}, ${Math.min(255, b + 10)})`);
        gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    }

    /**
     * Draw sparkles
     */
    drawSparkles(ctx) {
        this.sparkles.forEach(sparkle => {
            ctx.fillStyle = `rgba(255, 215, 180, ${sparkle.alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw floating hearts
     */
    drawFloatingHearts(ctx) {
        this.floatingHearts.forEach(heart => {
            ctx.save();
            ctx.globalAlpha = heart.alpha;
            ctx.translate(heart.x, heart.y);
            this.drawHeart(ctx, 0, 0, heart.size, '#ffb3ba');
            ctx.restore();
        });
    }

    /**
     * Draw a heart shape
     */
    drawHeart(ctx, x, y, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y + size * 0.3);
        ctx.bezierCurveTo(x, y, x - size * 0.5, y - size * 0.5, x - size * 0.75, y - size * 0.25);
        ctx.bezierCurveTo(x - size, y, x - size, y + size * 0.5, x - size, y + size * 0.5);
        ctx.bezierCurveTo(x - size, y + size, x - size * 0.5, y + size * 1.25, x, y + size * 1.5);
        ctx.bezierCurveTo(x + size * 0.5, y + size * 1.25, x + size, y + size, x + size, y + size * 0.5);
        ctx.bezierCurveTo(x + size, y + size * 0.5, x + size, y, x + size * 0.75, y - size * 0.25);
        ctx.bezierCurveTo(x + size * 0.5, y - size * 0.5, x, y, x, y + size * 0.3);
        ctx.fill();
    }

    /**
     * Draw player light at center
     */
    drawPlayerLight(ctx) {
        if (!this.playerLight) return;
        
        const light = this.playerLight;
        const pulse = 1 + Math.sin(light.pulsePhase) * 0.15;
        
        // Enhanced glow layers
        for (let i = 5; i >= 0; i--) {
            const glowRadius = (light.size + i * 18) * pulse;
            const alpha = (0.35 - i * 0.06) * pulse;
            
            const gradient = ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, glowRadius
            );
            
            gradient.addColorStop(0, this.hexToRgba(light.color, alpha));
            gradient.addColorStop(0.5, this.hexToRgba(light.glow, alpha * 0.6));
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(light.x, light.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Core light
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.size / 2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(light.x, light.y, (light.size / 4) * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Orbiting particles
        const time = Date.now() / 1000;
        for (let i = 0; i < 8; i++) {
            const angle = (time + i * Math.PI / 4) * 0.5;
            const distance = 50 + Math.sin(time * 2 + i) * 10;
            const px = light.x + Math.cos(angle) * distance;
            const py = light.y + Math.sin(angle) * distance;
            const particleAlpha = Math.sin(time * 3 + i) * 0.5 + 0.5;
            
            ctx.fillStyle = this.hexToRgba(light.glow, particleAlpha * 0.6);
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Convert hex to rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}