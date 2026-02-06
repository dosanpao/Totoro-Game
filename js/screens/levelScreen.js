/**
 * LEVEL SCREEN
 * Main gameplay screen where player collects items
 */

// Grass blades data (generated once)
const grassBlades = Array.from({ length: 40 }, (_, i) => ({
    x: Math.random() * CONFIG.canvas.width,
    y: CONFIG.canvas.height - Math.random() * 70,
    height: 8 + Math.random() * 12,
    phase: Math.random() * Math.PI * 2
}));
// Awakening Grove flowers data (generated once)
const awakeningFlowers = Array.from({ length: 8 }, (_, i) => ({
    x: 80 + i * 90,
    y: CONFIG.canvas.height - 60 - Math.random() * 20,
    colorIndex: i % 3
}));


class LevelScreen {
    constructor(game) {
        this.game = game;
        this.currentLevelIndex = 0;
        this.player = null;
        this.guide = null;
        this.collectibles = [];
        this.obstacles = [];
        this.levelComplete = false;
        this.showingDialogue = true;
        this.dialogueTimer = 0;
        this.playerHasMoved = false;
        this.fadeStartTime = 0;
        this.dialogueFadeOpacity = 1;
        this.dialogueClickBound = false;
        this.canvasClickBound = false;
        this.levelCompleteClickBound = false;
        
        // NEW: Black Light enemy properties
        this.blackLight = null;
        this.isDying = false; // Player caught by black light
        this.deathFadeProgress = 0;
        this.deathFadeDuration = 90; // 1.5 seconds at 60fps
        this.respawnDelay = 120; // 2 seconds total (fade + pause)
        this.deathTimer = 0;
    }

    /**
     * Called when entering this screen
     * @param {number} levelIndex - Which level to load (0, 1, 2, 3, 4, or 5)
     */
    enter(levelIndex = 0) {
        this.currentLevelIndex = levelIndex;
        this.levelComplete = false;
        this.showingDialogue = true;
        this.dialogueTimer = 120; // 2 seconds after movement (60fps * 2)
        this.playerHasMoved = false;
        this.fadeStartTime = 0;
        this.dialogueFadeOpacity = 1;
        this.dialogueClickBound = false;
        this.canvasClickBound = false;
        
        // Clean up any existing Enter key handler from level complete
        if (this.enterKeyHandler) {
            document.removeEventListener('keydown', this.enterKeyHandler);
            this.enterKeyHandler = null;
        }
        
        // Reset death state
        this.isDying = false;
        this.deathFadeProgress = 0;
        this.deathTimer = 0;
        
        Utils.hideAllScreens();
        Utils.showUI('levelUI');
        
        this.loadLevel(levelIndex);
        this.updateUI();
        
        // Setup canvas click handler for dialogue dismissal
        this.setupCanvasClick();
    }
    
    /**
     * Setup canvas click to dismiss dialogue (anywhere on screen)
     */
    setupCanvasClick() {
        if (this.canvasClickBound) return;
        
        const canvas = this.game.canvas;
        const clickHandler = (e) => {
            // Only dismiss dialogue if it's showing and not during level complete
            if (this.showingDialogue && !this.levelComplete) {
                this.dismissDialogue();
            }
            // If level is complete, proceed to next
            else if (this.levelComplete) {
                this.proceedToNext();
            }
        };
        
        canvas.addEventListener('click', clickHandler);
        this.canvasClickBound = true;
        this.canvasClickHandler = clickHandler;
    }

    /**
     * Load level data and create entities
     */
    loadLevel(levelIndex) {
        const levelData = CONFIG.levels[levelIndex];
        
        // Create player with selected light color
        const lightColor = this.game.state.lightColor || CONFIG.lightColors[0];
        this.player = new Player(levelData.playerStart.x, levelData.playerStart.y, lightColor);
        
        // Create guide
        this.guide = new Guide(levelData.guidePosition.x, levelData.guidePosition.y);
        
        // Create collectibles
        this.collectibles = levelData.collectibles.map(pos => 
            new Collectible(pos.x, pos.y)
        );
        
        // Create obstacles
        this.obstacles = levelData.obstacles.map(obs => 
            new Obstacle(obs.x, obs.y, obs.width, obs.height)
        );
        
        // NEW: Create Black Light if level has one (levels 4-6)
        this.blackLight = null;
        if (levelData.blackLightStart) {
            this.blackLight = new BlackLight(
                levelData.blackLightStart.x, 
                levelData.blackLightStart.y
            );
            
            // Set speed based on level config
            if (levelData.blackLightSpeed) {
                this.blackLight.setSpeed(levelData.blackLightSpeed);
            }
        }
        
        // NEW: Handle special levels (Level 7 & 8)
        this.secondLight = null;
        this.meetingPoint = null;
        this.shadowEntities = [];
        this.shieldRadius = 0;
        this.currentWave = 0;
        this.waveCooldown = 0;
        this.lightsHaveMet = false;
        this.meetingGlowIntensity = 0;
        
        if (levelData.isSpecialLevel === 'crossingLights') {
            // Level 7: Create second light and meeting point
            this.secondLight = new SecondLight(
                levelData.secondLightStart.x,
                levelData.secondLightStart.y,
                CONFIG.lightColors[2] // Sky Blue
            );
            this.secondLight.setTarget(levelData.meetingPoint.x, levelData.meetingPoint.y);
            this.meetingPoint = levelData.meetingPoint;
        } else if (levelData.isSpecialLevel === 'heldAgainstDark') {
            // Level 8: Create second light that follows player
            this.secondLight = new SecondLight(
                levelData.secondLightStart.x,
                levelData.secondLightStart.y,
                CONFIG.lightColors[3] // Lavender
            );
            this.shieldRadius = 80; // Base shield radius
            this.shadowWaveCount = levelData.shadowWaveCount || 3;
            this.shadowsPerWave = levelData.shadowsPerWave || 8;
            this.currentWave = 0;
            this.waveCooldown = 0;
            this.darknessIntensity = 0; // For final climax
            this.darknessTimer = undefined; // Will be initialized when needed
        }
        
        // Reset death state
        this.isDying = false;
        this.deathFadeProgress = 0;
        this.deathTimer = 0;
    }

    /**
     * Update UI elements (HUD and dialogue)
     */
    updateUI() {
        const levelData = CONFIG.levels[this.currentLevelIndex];
        const collected = this.collectibles.filter(c => c.collected).length;
        const total = this.collectibles.length;
        
        document.getElementById('levelName').textContent = levelData.name;
        
        // Special levels have different objectives
        if (levelData.isSpecialLevel === 'crossingLights') {
            document.getElementById('objectiveText').textContent = 'Move to the center...';
        } else if (levelData.isSpecialLevel === 'heldAgainstDark') {
            document.getElementById('objectiveText').textContent = 'Stay together...';
        } else {
            document.getElementById('objectiveText').textContent = `Collect: ${collected}/${total}`;
        }
        
        // Show level start dialogue
        const dialogueBox = document.getElementById('levelDialogue');
        if (this.showingDialogue) {
            const dialogue = this.getLevelDialogue('start');
            document.getElementById('levelDialogueText').textContent = dialogue;
            dialogueBox.classList.remove('hidden');
            dialogueBox.style.opacity = this.dialogueFadeOpacity;
            dialogueBox.style.display = 'block';
            dialogueBox.style.pointerEvents = 'auto';
            
            // Position dialogue bubble near the guide
            this.positionDialogueNearGuide();
        } else {
            dialogueBox.classList.add('hidden');
            dialogueBox.style.opacity = 1; // Reset for next time
            dialogueBox.style.display = 'none';
        }
    }

    /**
     * Position the dialogue bubble near the guide character
     */
    positionDialogueNearGuide() {
        const dialogueBox = document.getElementById('levelDialogue');
        if (!dialogueBox || !this.guide) return;
        
        const guideX = this.guide.x;
        const guideY = this.guide.y;
        
        // Determine which side of the guide to place the bubble
        // If guide is on the right side, put bubble on left
        // If guide is on the left side, put bubble on right
        // If guide is in the middle, put it above or to the side
        
        let bubbleClass = '';
        let left, top;
        
        if (guideX > CONFIG.canvas.width * 0.6) {
            // Guide on right - bubble on left
            bubbleClass = 'guide-right';
            left = guideX - 380; // Bubble width + spacing
            top = guideY - 30;
        } else if (guideX < CONFIG.canvas.width * 0.4) {
            // Guide on left - bubble on right
            bubbleClass = 'guide-left';
            left = guideX + 80; // Guide size + spacing
            top = guideY - 30;
        } else {
            // Guide in middle - bubble above or to the right
            if (guideY < CONFIG.canvas.height * 0.5) {
                // Guide in upper half - put bubble to right
                bubbleClass = 'guide-left';
                left = guideX + 80;
                top = guideY - 30;
            } else {
                // Guide in lower half - put bubble above
                bubbleClass = 'guide-bottom';
                left = guideX - 175; // Half bubble width
                top = guideY - 150;
            }
        }
        
        // Remove old bubble class and add new one
        dialogueBox.className = 'chat-bubble';
        dialogueBox.classList.add(bubbleClass);
        
        // Set position
        dialogueBox.style.left = left + 'px';
        dialogueBox.style.top = top + 'px';
        dialogueBox.style.transform = 'none';
    }

    /**
     * Get dialogue for current level (personalized)
     */
    getLevelDialogue(type) {
        const levelNum = this.currentLevelIndex + 1;
        const key = `level${levelNum}${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const dialogue = CONFIG.dialogue[key] || '';
        return this.game.getPersonalizedDialogue(dialogue);
    }

    /**
     * Dismiss dialogue immediately (on click)
     */
    dismissDialogue() {
        if (!this.showingDialogue) {
            return; // Already dismissed
        }
        
        this.showingDialogue = false;
        this.dialogueFadeOpacity = 0;
        
        // Immediately hide the dialogue box
        const dialogueBox = document.getElementById('levelDialogue');
        if (dialogueBox) {
            dialogueBox.classList.add('hidden');
            dialogueBox.style.opacity = 1; // Reset for next time
            dialogueBox.style.display = 'none'; // Force hide
        }
    }

    /**
     * Handle player being caught by Black Light
     */
    handlePlayerDeath() {
        if (this.isDying) return; // Already dying
        
        this.isDying = true;
        this.deathTimer = 0;
        this.deathFadeProgress = 0;
        
        // Disable player movement
        this.player.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    /**
     * Respawn player at start position
     */
    respawnPlayer() {
        const levelData = CONFIG.levels[this.currentLevelIndex];
        
        // Reset player position and velocity
        this.player.x = levelData.playerStart.x;
        this.player.y = levelData.playerStart.y;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        
        // Reset collectibles and their absorption state
        this.collectibles.forEach(c => {
            c.collected = false;
            c.isBeingAbsorbed = false;
            c.absorptionProgress = 0;
            c.justCollected = false;
            c.x = c.startX;
            c.y = c.startY;
        });
        
        // Reset black light
        if (this.blackLight) {
            this.blackLight.reset();
        }
        
        // Reset death state
        this.isDying = false;
        this.deathFadeProgress = 0;
        this.deathTimer = 0;
        this.playerHasMoved = false;
        
        // Update UI
        this.updateUI();
    }

    /**
     * Update level gameplay
     */
    update() {
        // Handle death sequence
        if (this.isDying) {
            this.deathTimer++;
            
            // Fade to black over first 1.5 seconds
            if (this.deathTimer <= this.deathFadeDuration) {
                this.deathFadeProgress = this.deathTimer / this.deathFadeDuration;
            } else {
                this.deathFadeProgress = 1;
            }
            
            // Respawn after full delay
            if (this.deathTimer >= this.respawnDelay) {
                this.respawnPlayer();
            }
            
            return; // Don't update anything else during death
        }
        
        if (this.levelComplete) return;
        
        // Check if player has moved
        if (!this.playerHasMoved && this.player) {
            const isMoving = this.player.keys.up || this.player.keys.down || 
                           this.player.keys.left || this.player.keys.right;
            
            if (isMoving) {
                this.playerHasMoved = true;
                this.fadeStartTime = 0; // Start counting from when movement begins
                
                // Activate Black Light when player first moves
                if (this.blackLight) {
                    this.blackLight.activate();
                }
            }
        }
        
        // Handle dialogue fade after player moves
        if (this.showingDialogue && this.playerHasMoved) {
            this.fadeStartTime++;
            
            // After 2 seconds of movement, start fading
            if (this.fadeStartTime >= this.dialogueTimer) {
                // Fade over 1 second (60 frames)
                const fadeFrames = 60;
                const fadeProgress = (this.fadeStartTime - this.dialogueTimer) / fadeFrames;
                this.dialogueFadeOpacity = Math.max(0, 1 - fadeProgress);
                
                // Apply fog-like fade to dialogue box
                const dialogueBox = document.getElementById('levelDialogue');
                if (dialogueBox) {
                    dialogueBox.style.opacity = this.dialogueFadeOpacity;
                }
                
                // Completely hide after fade completes
                if (this.dialogueFadeOpacity <= 0) {
                    this.showingDialogue = false;
                    this.updateUI();
                }
            }
        }
        
        // Update entities
        this.player.update(this.obstacles);
        this.guide.update();
        this.collectibles.forEach(c => c.update(this.player));
        
        // NEW: Update Black Light
        if (this.blackLight) {
            this.blackLight.update(this.player, this.obstacles);
            
            // Check collision with player
            if (this.blackLight.checkPlayerCollision(this.player)) {
                this.handlePlayerDeath();
            }
        }
        
        // Check collectible collection
        this.collectibles.forEach(collectible => {
            // Start absorption if player touches orb
            collectible.checkCollection(this.player);
            
            // Only update UI and check completion when orb is fully collected
            if (collectible.justCollected) {
                collectible.justCollected = false; // Reset flag
                this.updateUI();
                this.checkLevelComplete();
            }
        });
        
        // NEW: Update special levels
        const levelData = CONFIG.levels[this.currentLevelIndex];
        
        if (levelData.isSpecialLevel === 'crossingLights') {
            this.updateCrossingLights();
        } else if (levelData.isSpecialLevel === 'heldAgainstDark') {
            this.updateHeldAgainstDark();
        }
    }
    
    /**
     * Update logic for Level 7 - Crossing Lights
     */
    updateCrossingLights() {
        if (!this.secondLight || !this.meetingPoint) return;
        
        // Check if player is moving
        const playerIsMoving = this.player.keys.up || this.player.keys.down || 
                              this.player.keys.left || this.player.keys.right;
        
        // Update second light (mirrors player movement)
        this.secondLight.update(playerIsMoving);
        
        // Check if both lights have reached the center
        const playerDist = Math.sqrt(
            Math.pow(this.player.x - this.meetingPoint.x, 2) + 
            Math.pow(this.player.y - this.meetingPoint.y, 2)
        );
        const secondDist = Math.sqrt(
            Math.pow(this.secondLight.x - this.meetingPoint.x, 2) + 
            Math.pow(this.secondLight.y - this.meetingPoint.y, 2)
        );
        
        // Both within 15 pixels of center
        if (playerDist < 15 && secondDist < 15 && !this.lightsHaveMet) {
            this.lightsHaveMet = true;
            this.meetingGlowIntensity = 0;
            
            // Wait a moment, then complete
            setTimeout(() => {
                if (this.lightsHaveMet && !this.levelComplete) {
                    this.levelComplete = true;
                    this.showLevelComplete();
                }
            }, 2000);
        }
        
        // Increase glow when meeting
        if (this.lightsHaveMet && this.meetingGlowIntensity < 1) {
            this.meetingGlowIntensity += 0.02;
        }
    }
    
    /**
     * Update logic for Level 8 - Held Against the Dark
     */
    updateHeldAgainstDark() {
        if (!this.secondLight) return;
        
        // Second light follows player
        const dx = this.player.x - this.secondLight.x;
        const dy = this.player.y - this.secondLight.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const targetDistance = 50; // Stay 50 pixels from player
        
        if (distance > targetDistance + 5) {
            // Move toward player
            const dirX = dx / distance;
            const dirY = dy / distance;
            const moveSpeed = 2.5;
            
            this.secondLight.x += dirX * moveSpeed;
            this.secondLight.y += dirY * moveSpeed;
            this.secondLight.isMoving = true;
        } else if (distance < targetDistance - 5) {
            // Move away from player
            const dirX = dx / distance;
            const dirY = dy / distance;
            const moveSpeed = 1.5;
            
            this.secondLight.x -= dirX * moveSpeed;
            this.secondLight.y -= dirY * moveSpeed;
            this.secondLight.isMoving = true;
        } else {
            this.secondLight.isMoving = false;
        }
        
        // Update time for animations
        this.secondLight.time += 0.08;
        this.secondLight.idleTime += 0.016;
        
        // Calculate shield strength based on distance
        const maxDistance = 100;
        const shieldStrength = Math.max(0, 1 - (distance - targetDistance) / maxDistance);
        this.shieldRadius = 80 + shieldStrength * 40;
        
        // Spawn shadow waves
        this.waveCooldown++;
        if (this.currentWave < this.shadowWaveCount && this.waveCooldown > 180) {
            this.spawnShadowWave();
            this.currentWave++;
            this.waveCooldown = 0;
        }
        
        // Update shadow entities
        const shieldCenterX = (this.player.x + this.secondLight.x) / 2;
        const shieldCenterY = (this.player.y + this.secondLight.y) / 2;
        
        this.shadowEntities = this.shadowEntities.filter(shadow => {
            // Update target to shield center
            shadow.targetX = shieldCenterX;
            shadow.targetY = shieldCenterY;
            
            const dissolved = shadow.update();
            
            // Check collision with shield
            if (!shadow.dissolving) {
                const dx = shadow.x - shieldCenterX;
                const dy = shadow.y - shieldCenterY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.shieldRadius) {
                    shadow.dissolve();
                }
            }
            
            return !dissolved; // Keep if not fully dissolved
        });
        
        // Final climax: all waves spawned, wait for shadows to clear
        if (this.currentWave >= this.shadowWaveCount && this.shadowEntities.length === 0 && !this.levelComplete) {
            // Initialize darkness timer if not set
            if (this.darknessTimer === undefined) {
                this.darknessTimer = 0;
            }
            
            this.darknessTimer++;
            
            // Phase 1: Increase darkness (0-100 frames = ~1.6 seconds)
            if (this.darknessTimer < 100) {
                this.darknessIntensity = this.darknessTimer / 100;
            }
            // Phase 2: Hold at peak (100-160 frames = 1 second hold)
            else if (this.darknessTimer < 160) {
                this.darknessIntensity = 1;
            }
            // Phase 3: Fade out (160-260 frames = ~1.6 seconds)
            else if (this.darknessTimer < 260) {
                this.darknessIntensity = 1 - ((this.darknessTimer - 160) / 100);
            }
            // Phase 4: Complete
            else {
                this.darknessIntensity = 0;
                this.levelComplete = true;
                this.showLevelComplete();
            }
        }
    }
    
    /**
     * Spawn a wave of shadow entities
     */
    spawnShadowWave() {
        const shieldCenterX = (this.player.x + this.secondLight.x) / 2;
        const shieldCenterY = (this.player.y + this.secondLight.y) / 2;
        
        for (let i = 0; i < this.shadowsPerWave; i++) {
            const angle = (i / this.shadowsPerWave) * Math.PI * 2;
            const spawnDistance = 350; // Spawn outside screen
            const spawnX = shieldCenterX + Math.cos(angle) * spawnDistance;
            const spawnY = shieldCenterY + Math.sin(angle) * spawnDistance;
            
            this.shadowEntities.push(new ShadowEntity(
                spawnX,
                spawnY,
                shieldCenterX,
                shieldCenterY
            ));
        }
    }

    /**
     * Check if level is complete
     */
    checkLevelComplete() {
        const allCollected = this.collectibles.every(c => c.collected);
        
        if (allCollected && !this.levelComplete) {
            this.levelComplete = true;
            this.showLevelComplete();
        }
    }

    /**
     * Show level complete UI
     */
    showLevelComplete() {
        Utils.hideUI('levelUI');
        Utils.hideUI('levelDialogue');  // Explicitly hide dialogue
        Utils.showUI('levelCompleteUI');
        
        const message = this.getLevelDialogue('complete');
        document.getElementById('completionMessage').textContent = message;
        
        // Add click handler to level complete UI
        const levelCompleteUI = document.getElementById('levelCompleteUI');
        if (levelCompleteUI && !this.levelCompleteClickBound) {
            levelCompleteUI.addEventListener('click', () => {
                this.proceedToNext();
            });
            this.levelCompleteClickBound = true;
        }
        
        // Add Enter key handler only when level complete shows
        if (!this.enterKeyHandler) {
            this.enterKeyHandler = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.proceedToNext();
                }
            };
            document.addEventListener('keydown', this.enterKeyHandler);
        }
    }

    /**
     * Proceed to next level or transition
     */
    proceedToNext() {
        // Clean up Enter key handler
        if (this.enterKeyHandler) {
            document.removeEventListener('keydown', this.enterKeyHandler);
            this.enterKeyHandler = null;
        }
        
        if (this.currentLevelIndex < CONFIG.levels.length - 1) {
            // Go to next level
            this.game.changeScreen('level', this.currentLevelIndex + 1);
        } else {
            // All levels complete - go to cutscene (new cinematic sequence)
            this.game.changeScreen('cutscene');
        }
    }

    /**
     * Draw level
     */
    draw(ctx) {
        // Clear canvas
        ctx.fillStyle = CONFIG.colors.background;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Draw background based on level
        this.drawLevelBackground(ctx);
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => obstacle.draw(ctx));
        
        // Draw collectibles
        this.collectibles.forEach(collectible => collectible.draw(ctx));
        
        // NEW: Draw special level elements (before guide and player)
        const levelData = CONFIG.levels[this.currentLevelIndex];
        
        if (levelData.isSpecialLevel === 'crossingLights') {
            this.drawCrossingLights(ctx);
        } else if (levelData.isSpecialLevel === 'heldAgainstDark') {
            this.drawHeldAgainstDark(ctx);
        }
        
        // Draw guide
        this.guide.draw(ctx);
        
        // NEW: Draw Black Light (before player so player is on top)
        if (this.blackLight) {
            this.blackLight.draw(ctx);
        }
        
        // Draw second light (if exists)
        if (this.secondLight) {
            this.secondLight.draw(ctx);
        }
        
        // Draw player
        this.player.draw(ctx);
        
        // Draw particles/ambiance
        this.drawAmbiance(ctx);
        
        // NEW: Draw proximity vignette (darkens screen as black light approaches)
        this.drawProximityVignette(ctx);
        
        // NEW: Draw death overlay (black fade)
        if (this.isDying && this.deathFadeProgress > 0) {
            ctx.fillStyle = `rgba(0, 0, 0, ${this.deathFadeProgress})`;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        }
    }
    
    /**
     * Draw Level 7 - Crossing Lights
     */
    drawCrossingLights(ctx) {
        if (!this.meetingPoint) return;
        
        // Draw meeting point with growing glow
        const baseGlow = 40;
        const glowSize = baseGlow + this.meetingGlowIntensity * 80;
        
        for (let i = 3; i >= 0; i--) {
            const radius = glowSize + i * 20;
            const alpha = (0.15 - i * 0.03) * (1 + this.meetingGlowIntensity);
            
            const gradient = ctx.createRadialGradient(
                this.meetingPoint.x, this.meetingPoint.y, 0,
                this.meetingPoint.x, this.meetingPoint.y, radius
            );
            
            gradient.addColorStop(0, `rgba(255, 245, 200, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 215, 155, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.meetingPoint.x, this.meetingPoint.y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw center point
        const pulse = 1 + Math.sin(Date.now() / 300) * 0.2;
        ctx.fillStyle = `rgba(255, 235, 180, ${0.6 + this.meetingGlowIntensity * 0.4})`;
        ctx.beginPath();
        ctx.arc(this.meetingPoint.x, this.meetingPoint.y, 8 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Sparkles when meeting
        if (this.meetingGlowIntensity > 0) {
            const time = Date.now() / 1000;
            for (let i = 0; i < 12; i++) {
                const angle = (time + i / 12 * Math.PI * 2);
                const distance = 60 + Math.sin(time * 2 + i) * 20;
                const x = this.meetingPoint.x + Math.cos(angle) * distance;
                const y = this.meetingPoint.y + Math.sin(angle) * distance;
                const alpha = (Math.sin(time * 3 + i) * 0.5 + 0.5) * this.meetingGlowIntensity;
                
                ctx.fillStyle = `rgba(255, 215, 155, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Darken background as lights get closer
        if (this.lightsHaveMet) {
            const darkness = this.meetingGlowIntensity * 0.3;
            ctx.fillStyle = `rgba(45, 74, 62, ${darkness})`;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        }
    }
    
    /**
     * Draw Level 8 - Held Against the Dark
     */
    drawHeldAgainstDark(ctx) {
        if (!this.secondLight) return;
        
        // Draw darkness overlay based on intensity
        let darknessAlpha = 0;
        if (this.darknessIntensity > 0) {
            darknessAlpha = this.darknessIntensity * 0.7;
        }
        
        if (darknessAlpha > 0 || this.shadowEntities.length > 0) {
            ctx.fillStyle = `rgba(10, 5, 15, ${darknessAlpha})`;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        }
        
        // Draw shadow entities
        this.shadowEntities.forEach(shadow => shadow.draw(ctx));
        
        // Draw protective shield
        const shieldCenterX = (this.player.x + this.secondLight.x) / 2;
        const shieldCenterY = (this.player.y + this.secondLight.y) / 2;
        
        // Shield glow layers
        for (let i = 2; i >= 0; i--) {
            const radius = this.shieldRadius + i * 15;
            const alpha = 0.15 - i * 0.04;
            
            const gradient = ctx.createRadialGradient(
                shieldCenterX, shieldCenterY, 0,
                shieldCenterX, shieldCenterY, radius
            );
            
            gradient.addColorStop(0, `rgba(200, 220, 255, ${alpha})`);
            gradient.addColorStop(0.6, `rgba(150, 180, 255, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(shieldCenterX, shieldCenterY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Shield edge (subtle)
        ctx.strokeStyle = `rgba(180, 200, 255, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shieldCenterX, shieldCenterY, this.shieldRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Draw level-specific background
     */
    drawLevelBackground(ctx) {
        switch(this.currentLevelIndex) {
            case 0:
                this.drawAwakeningGroveBackground(ctx);
                break;
            case 1:
                this.drawWhisperingWoodsBackground(ctx);
                break;
            case 2:
                this.drawHeartwoodHavenBackground(ctx);
                break;
            case 3:
                this.drawFadingGroveBackground(ctx);
                break;
            case 4:
                this.drawEclipsePathBackground(ctx);
                break;
            case 5:
                this.drawLastLightClearingBackground(ctx);
                break;
            case 6:
                this.drawCrossingLightsBackground(ctx);
                break;
            case 7:
                this.drawHeldAgainstDarkBackground(ctx);
                break;
            default:
                this.drawAwakeningGroveBackground(ctx);
        }
    }

    /**
     * Level 1: Awakening Grove - Dawn breaking, warm and inviting
     */
    drawAwakeningGroveBackground(ctx) {
        // Sky gradient - warm sunrise colors
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#ffeaa7');  // Soft yellow
        gradient.addColorStop(0.3, '#ffd89b'); // Warm gold
        gradient.addColorStop(0.6, '#fef9f0'); // Cream
        gradient.addColorStop(1, '#f5f0e8');   // Warm base
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Sun/light source
        const sunGlow = ctx.createRadialGradient(650, 80, 0, 650, 80, 120);
        sunGlow.addColorStop(0, 'rgba(255, 235, 167, 0.6)');
        sunGlow.addColorStop(0.5, 'rgba(255, 216, 155, 0.3)');
        sunGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGlow;
        ctx.beginPath();
        ctx.arc(650, 80, 120, 0, Math.PI * 2);
        ctx.fill();

        // Distant hills
        ctx.fillStyle = 'rgba(168, 198, 159, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, 280);
        ctx.quadraticCurveTo(200, 240, 400, 260);
        ctx.quadraticCurveTo(600, 280, CONFIG.canvas.width, 250);
        ctx.lineTo(CONFIG.canvas.width, CONFIG.canvas.height);
        ctx.lineTo(0, CONFIG.canvas.height);
        ctx.fill();

        // Ground with grass texture
        ctx.fillStyle = '#b8d4a8';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);

        // Grass blades
        ctx.strokeStyle = 'rgba(127, 182, 158, 0.4)';
        ctx.lineWidth = 2;

        const time = performance.now() * 0.002;

        for (let i = 0; i < grassBlades.length; i++) {
            const blade = grassBlades[i];
            const sway = Math.sin(time + blade.phase) * 2;

            ctx.beginPath();
            ctx.moveTo(blade.x, blade.y);
            ctx.quadraticCurveTo(
                blade.x + sway,
                blade.y - blade.height / 2,
                blade.x + sway,
                blade.y - blade.height
            );
            ctx.stroke();
        }

        // Small awakening flowers (using pre-generated data) - drawn AFTER grass
        const flowerColors = ['#ffb3ba', '#ffd89b', '#ffe680'];
        for (let i = 0; i < awakeningFlowers.length; i++) {
            const flower = awakeningFlowers[i];
            const color = flowerColors[flower.colorIndex];
            
            // Petals
            ctx.fillStyle = color;
            for (let p = 0; p < 5; p++) {
                const angle = (p / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.arc(
                    flower.x + Math.cos(angle) * 5,
                    flower.y + Math.sin(angle) * 5,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            
            // Center
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(flower.x, flower.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

    }

    /**
     * Level 2: Whispering Woods - Mysterious forest with dappled light
     */
    drawWhisperingWoodsBackground(ctx) {
        // Sky gradient - cool forest tones
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#d4e8e0');  // Pale mint
        gradient.addColorStop(0.4, '#e8f5f0'); // Very light green
        gradient.addColorStop(1, '#e8f0e8');   // Soft green-white
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Distant trees (silhouettes)
        ctx.fillStyle = 'rgba(74, 124, 89, 0.15)';
        const treeSilhouettes = [
            { x: 100, y: 200, width: 40, height: 200 },
            { x: 250, y: 180, width: 50, height: 220 },
            { x: 450, y: 190, width: 45, height: 210 },
            { x: 650, y: 170, width: 55, height: 230 }
        ];
        
        treeSilhouettes.forEach(tree => {
            // Trunk
            ctx.fillRect(tree.x - tree.width / 6, tree.y, tree.width / 3, tree.height);
            
            // Foliage
            ctx.beginPath();
            ctx.ellipse(tree.x, tree.y + 30, tree.width / 2, tree.width / 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Light rays filtering through trees
        ctx.save();
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 5; i++) {
            const x = 150 + i * 140;
            const rayGradient = ctx.createLinearGradient(x, 0, x, CONFIG.canvas.height - 100);
            rayGradient.addColorStop(0, 'rgba(255, 255, 200, 0.3)');
            rayGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = rayGradient;
            ctx.beginPath();
            ctx.moveTo(x - 20, 0);
            ctx.lineTo(x + 20, 0);
            ctx.lineTo(x + 30, CONFIG.canvas.height - 100);
            ctx.lineTo(x - 30, CONFIG.canvas.height - 100);
            ctx.fill();
        }
        ctx.restore();

        // Mushrooms and forest undergrowth
        const mushrooms = [
            { x: 120, y: CONFIG.canvas.height - 50 },
            { x: 200, y: CONFIG.canvas.height - 45 },
            { x: 380, y: CONFIG.canvas.height - 55 },
            { x: 550, y: CONFIG.canvas.height - 48 },
            { x: 680, y: CONFIG.canvas.height - 52 }
        ];
        
        mushrooms.forEach(mush => {
            // Mushroom stem
            ctx.fillStyle = '#e8dcc8';
            ctx.fillRect(mush.x - 3, mush.y, 6, 15);
            
            // Mushroom cap
            ctx.fillStyle = '#d4696e';
            ctx.beginPath();
            ctx.ellipse(mush.x, mush.y, 12, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Cap spots
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.arc(mush.x - 4, mush.y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(mush.x + 3, mush.y + 1, 1.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Ferns
        ctx.strokeStyle = 'rgba(90, 140, 105, 0.4)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            const x = 150 + i * 110;
            const y = CONFIG.canvas.height - 40;
            
            // Fern stem
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(x - 5, y - 15, x - 8, y - 25);
            ctx.stroke();
            
            // Fern leaves
            for (let j = 0; j < 5; j++) {
                ctx.beginPath();
                ctx.moveTo(x - j * 1.5, y - j * 5);
                ctx.lineTo(x - j * 1.5 - 6, y - j * 5 - 3);
                ctx.stroke();
            }
        }

        // Ground
        ctx.fillStyle = '#9db88f';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);
    }

    /**
     * Level 3: Heartwood Haven - Romantic, warm, heart-centered
     */
    drawHeartwoodHavenBackground(ctx) {
        // Sky gradient - romantic pink/purple
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#ffeef8');  // Very pale pink
        gradient.addColorStop(0.5, '#fff0f5'); // Lavender blush
        gradient.addColorStop(1, '#ffe8f0');   // Soft pink
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Magical glow in the center/top
        const magicGlow = ctx.createRadialGradient(400, 200, 0, 400, 200, 200);
        magicGlow.addColorStop(0, 'rgba(255, 179, 186, 0.3)');
        magicGlow.addColorStop(0.5, 'rgba(255, 215, 220, 0.15)');
        magicGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = magicGlow;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Heart-shaped tree/archway in background
        ctx.save();
        ctx.fillStyle = 'rgba(168, 198, 159, 0.25)';
        ctx.translate(400, 150);
        
        // Draw heart shape
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.bezierCurveTo(0, 0, -30, -20, -50, -10);
        ctx.bezierCurveTo(-70, 0, -70, 30, -70, 30);
        ctx.bezierCurveTo(-70, 50, -40, 80, 0, 110);
        ctx.bezierCurveTo(40, 80, 70, 50, 70, 30);
        ctx.bezierCurveTo(70, 30, 70, 0, 50, -10);
        ctx.bezierCurveTo(30, -20, 0, 0, 0, 20);
        ctx.fill();
        ctx.restore();

        // Floating petals
        const time = Date.now() / 1000;
        for (let i = 0; i < 15; i++) {
            const x = (Math.sin(time * 0.3 + i) * 0.4 + 0.5) * CONFIG.canvas.width;
            const y = (Math.cos(time * 0.2 + i * 0.5) * 0.3 + 0.3) * CONFIG.canvas.height;
            const rotation = time + i;
            const size = 3 + Math.sin(time + i) * 1;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillStyle = 'rgba(255, 179, 186, 0.4)';
            ctx.beginPath();
            ctx.ellipse(0, 0, size, size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Rose bushes
        const roseBushes = [
            { x: 100, y: CONFIG.canvas.height - 90 },
            { x: 300, y: CONFIG.canvas.height - 85 },
            { x: 500, y: CONFIG.canvas.height - 95 },
            { x: 700, y: CONFIG.canvas.height - 88 }
        ];
        
        roseBushes.forEach(bush => {
            // Bush foliage
            ctx.fillStyle = 'rgba(127, 182, 158, 0.5)';
            ctx.beginPath();
            ctx.arc(bush.x, bush.y, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bush.x + 15, bush.y - 5, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(bush.x - 12, bush.y - 8, 18, 0, Math.PI * 2);
            ctx.fill();
            
            // Roses
            const roses = [
                { dx: -8, dy: -15 },
                { dx: 5, dy: -12 },
                { dx: -15, dy: -5 },
                { dx: 10, dy: -8 }
            ];
            
            roses.forEach(rose => {
                ctx.fillStyle = '#ffb3ba';
                ctx.beginPath();
                ctx.arc(bush.x + rose.dx, bush.y + rose.dy, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Rose highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.arc(bush.x + rose.dx - 1, bush.y + rose.dy - 1, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });
        });

        // Heart-shaped stepping stones
        ctx.fillStyle = 'rgba(200, 180, 170, 0.4)';
        const stones = [
            { x: 200, y: CONFIG.canvas.height - 50 },
            { x: 350, y: CONFIG.canvas.height - 55 },
            { x: 450, y: CONFIG.canvas.height - 52 },
            { x: 600, y: CONFIG.canvas.height - 58 }
        ];
        
        stones.forEach(stone => {
            ctx.save();
            ctx.translate(stone.x, stone.y);
            ctx.scale(0.4, 0.4);
            
            ctx.beginPath();
            ctx.moveTo(0, 10);
            ctx.bezierCurveTo(0, 5, -10, -5, -15, 0);
            ctx.bezierCurveTo(-20, 5, -20, 15, 0, 25);
            ctx.bezierCurveTo(20, 15, 20, 5, 15, 0);
            ctx.bezierCurveTo(10, -5, 0, 5, 0, 10);
            ctx.fill();
            ctx.restore();
        });

        // Ground
        ctx.fillStyle = '#d4c4b4';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);
        
        // Soft grass overlay
        ctx.fillStyle = 'rgba(168, 198, 159, 0.3)';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 40);
    }

    /**
     * Draw ambient effects
     */
    drawAmbiance(ctx) {
        const time = Date.now() / 1000;
        
        // Floating particles
        for (let i = 0; i < 8; i++) {
            const x = (Math.sin(time * 0.5 + i * 0.8) * 0.5 + 0.5) * CONFIG.canvas.width;
            const y = (Math.cos(time * 0.3 + i * 0.5) * 0.5 + 0.5) * CONFIG.canvas.height;
            const alpha = Math.sin(time * 2 + i) * 0.3 + 0.4;
            
            ctx.fillStyle = `rgba(255, 215, 155, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Draw proximity vignette effect based on black light distance
     * Creates a cozy, atmospheric darkening as danger approaches
     */
    drawProximityVignette(ctx) {
        if (!this.blackLight || !this.player || this.isDying) return;
        
        // Calculate distance between player and black light
        const dx = this.blackLight.x - this.player.x;
        const dy = this.blackLight.y - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Define distance thresholds for vignette effect
        const maxDistance = 400; // No vignette beyond this
        const minDistance = 80;  // Maximum vignette at this distance
        
        // Calculate vignette intensity (0 = none, 1 = maximum)
        let intensity = 0;
        if (distance < maxDistance) {
            // Smooth interpolation between min and max
            intensity = 1 - Utils.clamp((distance - minDistance) / (maxDistance - minDistance), 0, 1);
            // Apply easing for more dramatic effect as it gets closer
            intensity = Math.pow(intensity, 1.5);
        }
        
        if (intensity > 0) {
            // Create radial gradient vignette centered on player
            const centerX = this.player.x;
            const centerY = this.player.y;
            
            // Inner radius - area that stays relatively bright
            const innerRadius = 120 - (intensity * 50); // Shrinks as danger approaches
            
            // Outer radius - edge of the vignette
            const outerRadius = Math.max(
                CONFIG.canvas.width,
                CONFIG.canvas.height
            ) * 0.8;
            
            const gradient = ctx.createRadialGradient(
                centerX, centerY, innerRadius,
                centerX, centerY, outerRadius
            );
            
            // Cozy dark purple/blue vignette colors
            gradient.addColorStop(0, `rgba(15, 10, 25, 0)`); // Transparent center
            gradient.addColorStop(0.4, `rgba(15, 10, 25, ${intensity * 0.2})`);
            gradient.addColorStop(0.7, `rgba(20, 15, 35, ${intensity * 0.5})`);
            gradient.addColorStop(1, `rgba(10, 5, 20, ${intensity * 0.7})`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            
            // Add subtle pulsing effect when very close
            if (intensity > 0.6) {
                const pulseIntensity = (intensity - 0.6) * 2.5; // 0 to 1 in the danger zone
                const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;
                
                const pulseGradient = ctx.createRadialGradient(
                    centerX, centerY, innerRadius * 0.5,
                    centerX, centerY, innerRadius * 1.5
                );
                
                pulseGradient.addColorStop(0, `rgba(40, 20, 60, 0)`);
                pulseGradient.addColorStop(1, `rgba(40, 20, 60, ${pulseIntensity * pulse * 0.15})`);
                
                ctx.fillStyle = pulseGradient;
                ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
            }
        }
    }

    /**
     * Level 4: Fading Grove - Darker, ominous version of level 1
     */
    drawFadingGroveBackground(ctx) {
        // Darker, desaturated gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#d4d8dc');  // Darker sky
        gradient.addColorStop(0.6, '#e0dad0'); 
        gradient.addColorStop(1, '#ccc4b8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Faded distant trees (darker)
        ctx.fillStyle = 'rgba(100, 110, 100, 0.25)';
        for (let i = 0; i < 4; i++) {
            const x = 150 + i * 180;
            const y = 250 + Math.sin(i) * 40;
            
            ctx.beginPath();
            ctx.moveTo(x, y - 40);
            ctx.lineTo(x - 30, y + 20);
            ctx.lineTo(x + 30, y + 20);
            ctx.closePath();
            ctx.fill();
        }

        // Wilted flowers
        const flowers = [
            { x: 150, y: CONFIG.canvas.height - 40 },
            { x: 350, y: CONFIG.canvas.height - 50 },
            { x: 550, y: CONFIG.canvas.height - 45 }
        ];
        
        flowers.forEach(flower => {
            ctx.fillStyle = 'rgba(140, 130, 140, 0.4)';
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const petalX = flower.x + Math.cos(angle) * 5;
                const petalY = flower.y + Math.sin(angle) * 5;
                ctx.beginPath();
                ctx.arc(petalX, petalY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Ground
        ctx.fillStyle = '#a8a69f';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);
    }

    /**
     * Level 5: Eclipse Path - Dark purple/grey with ominous atmosphere
     */
    drawEclipsePathBackground(ctx) {
        // Very dark gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#3d3850');  // Dark purple
        gradient.addColorStop(0.6, '#4a4555'); 
        gradient.addColorStop(1, '#403d48');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Faint stars (ominous)
        const time = Date.now() / 2000;
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time * 0.2 + i * 0.5) * 0.3 + 0.5) * CONFIG.canvas.width;
            const y = (Math.cos(time * 0.15 + i * 0.7) * 0.25 + 0.25) * CONFIG.canvas.height;
            const alpha = Math.sin(time * 3 + i) * 0.3 + 0.4;
            
            ctx.fillStyle = `rgba(180, 170, 200, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dark silhouette trees
        ctx.fillStyle = 'rgba(30, 25, 40, 0.6)';
        for (let i = 0; i < 5; i++) {
            const x = 120 + i * 150;
            const y = 300 + Math.sin(i) * 50;
            
            ctx.beginPath();
            ctx.moveTo(x, y - 60);
            ctx.lineTo(x - 40, y + 30);
            ctx.lineTo(x + 40, y + 30);
            ctx.closePath();
            ctx.fill();
        }

        // Ground
        ctx.fillStyle = '#35323d';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);
    }

    /**
     * Level 6: Last Light Clearing - Emotionally tense but not hopeless
     */
    drawLastLightClearingBackground(ctx) {
        // Deep twilight gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#2a2540');  // Deep purple
        gradient.addColorStop(0.5, '#3d3555'); 
        gradient.addColorStop(1, '#4a4258');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Single clearing in center (symbolic)
        const clearingGlow = ctx.createRadialGradient(400, 300, 0, 400, 300, 150);
        clearingGlow.addColorStop(0, 'rgba(100, 80, 120, 0.3)');
        clearingGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = clearingGlow;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

        // Bare tree silhouettes (emotional weight)
        ctx.strokeStyle = 'rgba(40, 35, 50, 0.7)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            const x = 200 + i * 200;
            const y = CONFIG.canvas.height - 100;
            
            // Trunk
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 100);
            ctx.stroke();
            
            // Branches
            for (let j = 0; j < 4; j++) {
                const branchY = y - 30 - j * 20;
                ctx.beginPath();
                ctx.moveTo(x, branchY);
                ctx.lineTo(x - 20 - j * 5, branchY - 15);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(x, branchY);
                ctx.lineTo(x + 20 + j * 5, branchY - 15);
                ctx.stroke();
            }
        }

        // Ground
        ctx.fillStyle = '#2d2838';
        ctx.fillRect(0, CONFIG.canvas.height - 80, CONFIG.canvas.width, 80);
    }
    
    /**
     * Level 7: Crossing Lights - Calm, symbolic, warm atmosphere
     */
    drawCrossingLightsBackground(ctx) {
        // Gentle warm gradient
        const gradient = ctx.createRadialGradient(
            CONFIG.canvas.width / 2, 
            CONFIG.canvas.height / 2, 
            0,
            CONFIG.canvas.width / 2, 
            CONFIG.canvas.height / 2, 
            CONFIG.canvas.width / 1.5
        );
        gradient.addColorStop(0, '#fff8f0');
        gradient.addColorStop(0.5, '#fef5eb');
        gradient.addColorStop(1, '#f5ede0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Soft ambient circles (like gentle bokeh)
        const time = Date.now() / 3000;
        ctx.fillStyle = 'rgba(255, 235, 200, 0.15)';
        for (let i = 0; i < 8; i++) {
            const x = (Math.sin(time + i) * 0.3 + 0.5) * CONFIG.canvas.width;
            const y = (Math.cos(time * 0.7 + i) * 0.3 + 0.5) * CONFIG.canvas.height;
            const size = 40 + Math.sin(time * 2 + i) * 15;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Ground
        ctx.fillStyle = 'rgba(168, 198, 159, 0.2)';
        ctx.fillRect(0, CONFIG.canvas.height - 60, CONFIG.canvas.width, 60);
    }
    
    /**
     * Level 8: Held Against the Dark - Protective, intimate atmosphere
     */
    drawHeldAgainstDarkBackground(ctx) {
        // Base gradient - slightly darker
        const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.canvas.height);
        gradient.addColorStop(0, '#e0d8f0');
        gradient.addColorStop(0.5, '#f0e8f5');
        gradient.addColorStop(1, '#e8e0ed');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Subtle vignette
        const vignette = ctx.createRadialGradient(
            CONFIG.canvas.width / 2,
            CONFIG.canvas.height / 2,
            CONFIG.canvas.width / 4,
            CONFIG.canvas.width / 2,
            CONFIG.canvas.height / 2,
            CONFIG.canvas.width / 1.2
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(40, 30, 50, 0.15)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
        
        // Ground
        ctx.fillStyle = 'rgba(150, 140, 160, 0.2)';
        ctx.fillRect(0, CONFIG.canvas.height - 60, CONFIG.canvas.width, 60);
    }
}