/**
 * CUTSCENE SCREEN
 * Beautiful cinematic sequence after Level 8
 * A love letter directly to the player
 */

class CutsceneScreen {
    constructor(game) {
        this.game = game;
        
        // Cutscene state
        this.phase = 'fadeIn'; // fadeIn -> showLights -> dialogue -> peak -> fadeToValentine
        this.timer = 0;
        this.currentDialogueIndex = -1;
        this.dialogueOpacity = 0;
        this.sceneOpacity = 0;
        
        // Two lights state
        this.playerLight = null;
        this.companionLight = null;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.008;
        this.orbitDistance = 60;
        
        // Particle effects
        this.particles = [];
        this.sparkles = [];
        
        // Background gradient animation
        this.gradientPhase = 0;
        
        // Dialogue lines (the love letter)
        this.dialogueLines = [
            "I know this started as just a little game…",
            "But every part of it was made with you in mind.",
            "Every color. Every moment of light finding its way.",
            "I wanted to make something peaceful.",
            "Something warm.",
            "Something that felt like how you make me feel.",
            "And I guess what I'm really trying to say is—",
            "I want you to be my little light."
        ];
        
        // Timing
        this.fadeInDuration = 120; // 2 seconds
        this.lineDisplayDuration = 240; // 4 seconds per line
        this.lineFadeDuration = 30; // 0.5 seconds fade
        this.peakDuration = 180; // 3 seconds at peak moment
        this.fadeToValentineDuration = 90; // 1.5 seconds
    }

    /**
     * Called when entering this screen
     */
    enter() {
        Utils.hideAllScreens();
        
        // Reset state
        this.phase = 'fadeIn';
        this.timer = 0;
        this.currentDialogueIndex = -1;
        this.dialogueOpacity = 0;
        this.sceneOpacity = 0;
        this.orbitAngle = 0;
        this.gradientPhase = 0;
        
        // Get player's chosen light color
        const lightColor = this.game.state.lightColor || CONFIG.lightColors[0];
        
        // Initialize the two lights at center
        const centerX = CONFIG.canvas.width / 2;
        const centerY = CONFIG.canvas.height / 2;
        
        this.playerLight = {
            x: centerX - 30,
            y: centerY,
            size: 35,
            color: lightColor.color,
            glow: lightColor.glow,
            pulsePhase: 0,
            trail: []
        };
        
        this.companionLight = {
            x: centerX + 30,
            y: centerY,
            size: 35,
            color: lightColor.color,
            glow: lightColor.glow,
            pulsePhase: Math.PI, // Offset pulse
            trail: []
        };
        
        // Initialize particles
        this.particles = [];
        this.sparkles = this.initSparkles();
    }

    /**
     * Initialize ambient sparkles
     */
    initSparkles() {
        const sparkles = [];
        for (let i = 0; i < 30; i++) {
            sparkles.push({
                x: Math.random() * CONFIG.canvas.width,
                y: Math.random() * CONFIG.canvas.height,
                size: 1 + Math.random() * 2,
                alpha: Math.random(),
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            });
        }
        return sparkles;
    }

    /**
     * Update cutscene
     */
    update() {
        this.timer++;
        this.gradientPhase += 0.003;
        
        // Update based on current phase
        switch (this.phase) {
            case 'fadeIn':
                this.updateFadeIn();
                break;
            case 'showLights':
                this.updateShowLights();
                break;
            case 'dialogue':
                this.updateDialogue();
                break;
            case 'peak':
                this.updatePeak();
                break;
            case 'fadeToValentine':
                this.updateFadeToValentine();
                break;
        }
        
        // Always update lights and particles
        this.updateLights();
        this.updateParticles();
        this.updateSparkles();
    }

    /**
     * Fade in phase
     */
    updateFadeIn() {
        this.sceneOpacity = Math.min(1, this.timer / this.fadeInDuration);
        
        if (this.timer >= this.fadeInDuration) {
            this.phase = 'showLights';
            this.timer = 0;
        }
    }

    /**
     * Show lights phase (brief pause before dialogue)
     */
    updateShowLights() {
        if (this.timer >= 60) { // 1 second pause
            this.phase = 'dialogue';
            this.timer = 0;
            this.currentDialogueIndex = 0;
        }
    }

    /**
     * Dialogue phase
     */
    updateDialogue() {
        const lineProgress = this.timer % this.lineDisplayDuration;
        
        // Fade in dialogue text
        if (lineProgress < this.lineFadeDuration) {
            this.dialogueOpacity = lineProgress / this.lineFadeDuration;
        }
        // Hold
        else if (lineProgress < this.lineDisplayDuration - this.lineFadeDuration) {
            this.dialogueOpacity = 1;
        }
        // Fade out
        else {
            this.dialogueOpacity = 1 - (lineProgress - (this.lineDisplayDuration - this.lineFadeDuration)) / this.lineFadeDuration;
        }
        
        // Move to next line
        if (this.timer > 0 && this.timer % this.lineDisplayDuration === 0) {
            this.currentDialogueIndex++;
            
            // Check if we've reached the final line
            if (this.currentDialogueIndex >= this.dialogueLines.length) {
                this.phase = 'peak';
                this.timer = 0;
                this.dialogueOpacity = 0;
                return;
            }
        }
    }

    /**
     * Peak moment phase (after final line)
     */
    updatePeak() {
        // Create heart particles
        if (this.timer % 8 === 0) {
            this.createHeartParticle();
        }
        
        // Enhanced glow
        const peakPulse = Math.sin(this.timer * 0.1) * 0.3 + 0.7;
        this.playerLight.peakIntensity = peakPulse;
        this.companionLight.peakIntensity = peakPulse;
        
        if (this.timer >= this.peakDuration) {
            this.phase = 'fadeToValentine';
            this.timer = 0;
        }
    }

    /**
     * Fade to Valentine screen
     */
    updateFadeToValentine() {
        this.sceneOpacity = 1 - (this.timer / this.fadeToValentineDuration);
        
        if (this.timer >= this.fadeToValentineDuration) {
            // Transition to new Valentine screen
            this.game.changeScreen('valentine');
        }
    }

    /**
     * Update lights (orbital movement)
     */
    updateLights() {
        this.orbitAngle += this.orbitSpeed;
        
        const centerX = CONFIG.canvas.width / 2;
        const centerY = CONFIG.canvas.height / 2;
        
        // Gentle orbit
        this.playerLight.x = centerX + Math.cos(this.orbitAngle) * this.orbitDistance;
        this.playerLight.y = centerY + Math.sin(this.orbitAngle) * this.orbitDistance;
        
        this.companionLight.x = centerX - Math.cos(this.orbitAngle) * this.orbitDistance;
        this.companionLight.y = centerY - Math.sin(this.orbitAngle) * this.orbitDistance;
        
        // Update pulse phases
        this.playerLight.pulsePhase += 0.05;
        this.companionLight.pulsePhase += 0.05;
        
        // Update trails
        this.updateLightTrail(this.playerLight);
        this.updateLightTrail(this.companionLight);
    }

    /**
     * Update light trail
     */
    updateLightTrail(light) {
        // Add current position to trail
        light.trail.unshift({ x: light.x, y: light.y });
        
        // Keep trail length manageable
        if (light.trail.length > 20) {
            light.trail.pop();
        }
    }

    /**
     * Create a heart particle at peak moment
     */
    createHeartParticle() {
        const centerX = CONFIG.canvas.width / 2;
        const centerY = CONFIG.canvas.height / 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1;
        
        this.particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 8 + Math.random() * 6,
            alpha: 1,
            life: 120,
            maxLife: 120,
            type: 'heart'
        });
    }

    /**
     * Update particles
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.02; // Gentle float upward
            p.life--;
            p.alpha = p.life / p.maxLife;
            
            if (p.life <= 0) {
                this.particles.splice(i, 1);
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
     * Draw cutscene
     */
    draw(ctx) {
        // Animated gradient background (navy → lavender → rose → warm gold)
        this.drawAnimatedBackground(ctx);
        
        // Draw everything with scene opacity for fade effects
        ctx.globalAlpha = this.sceneOpacity;
        
        // Draw sparkles
        this.drawSparkles(ctx);
        
        // Draw light trails
        this.drawLightTrails(ctx);
        
        // Draw the two lights
        this.drawLight(ctx, this.playerLight);
        this.drawLight(ctx, this.companionLight);
        
        // Draw particles (hearts)
        this.drawParticles(ctx);
        
        // Draw dialogue text if in dialogue or peak phase
        if ((this.phase === 'dialogue' || this.currentDialogueIndex === this.dialogueLines.length - 1) && this.currentDialogueIndex >= 0) {
            this.drawDialogue(ctx);
        }
        
        ctx.globalAlpha = 1;
    }

    /**
     * Draw animated gradient background
     */
    drawAnimatedBackground(ctx) {
        const colors = [
            { r: 25, g: 25, b: 60 },    // Navy
            { r: 140, g: 100, b: 180 }, // Lavender
            { r: 255, g: 150, b: 180 }, // Rose
            { r: 255, g: 200, b: 150 }  // Warm gold
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
            CONFIG.canvas.width / 2, CONFIG.canvas.height / 2, CONFIG.canvas.width / 1.5
        );
        
        gradient.addColorStop(0, `rgb(${r + 30}, ${g + 30}, ${b + 30})`);
        gradient.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    }

    /**
     * Draw sparkles
     */
    drawSparkles(ctx) {
        this.sparkles.forEach(sparkle => {
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkle.alpha * 0.6})`;
            ctx.beginPath();
            ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Draw light trails
     */
    drawLightTrails(ctx) {
        [this.playerLight, this.companionLight].forEach(light => {
            light.trail.forEach((point, i) => {
                const alpha = (1 - i / light.trail.length) * 0.3;
                const size = (1 - i / light.trail.length) * 15;
                
                ctx.fillStyle = this.hexToRgba(light.glow, alpha);
                ctx.beginPath();
                ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    }

    /**
     * Draw a single light
     */
    drawLight(ctx, light) {
        const pulse = 1 + Math.sin(light.pulsePhase) * 0.2;
        const peakBoost = this.phase === 'peak' ? (light.peakIntensity || 1) : 1;
        
        // Enhanced glow layers
        for (let i = 4; i >= 0; i--) {
            const glowRadius = (light.size + i * 20) * pulse * peakBoost;
            const alpha = (0.4 - i * 0.08) * pulse * peakBoost;
            
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
        
        // Core
        ctx.fillStyle = light.color;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.size / 2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(light.x, light.y, (light.size / 4) * pulse, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw particles (hearts, sparkles)
     */
    drawParticles(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            
            if (p.type === 'heart') {
                ctx.translate(p.x, p.y);
                this.drawHeart(ctx, 0, 0, p.size, '#ffb3ba');
            }
            
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
     * Draw dialogue text
     */
    drawDialogue(ctx) {
        if (this.currentDialogueIndex < 0 || this.currentDialogueIndex >= this.dialogueLines.length) return;
        
        const text = this.dialogueLines[this.currentDialogueIndex];
        const isLastLine = this.currentDialogueIndex === this.dialogueLines.length - 1;
        
        ctx.save();
        ctx.globalAlpha = this.dialogueOpacity;
        
        // Text styling
        ctx.font = isLastLine ? 'bold 32px Quicksand' : '24px Quicksand';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        
        // Wrap text if needed
        const maxWidth = CONFIG.canvas.width - 100;
        const words = text.split(' ');
        let line = '';
        const lines = [];
        
        words.forEach(word => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > maxWidth && line !== '') {
                lines.push(line.trim());
                line = word + ' ';
            } else {
                line = testLine;
            }
        });
        lines.push(line.trim());
        
        // Draw centered text
        const lineHeight = isLastLine ? 40 : 32;
        const startY = CONFIG.canvas.height / 2 + 150 - (lines.length * lineHeight) / 2;
        
        lines.forEach((line, i) => {
            ctx.fillText(line, CONFIG.canvas.width / 2, startY + i * lineHeight);
        });
        
        ctx.restore();
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
