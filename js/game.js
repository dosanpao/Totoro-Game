/**
 * GAME MANAGER
 * Central game controller that manages screens and game state
 */

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = CONFIG.canvas.width;
        this.canvas.height = CONFIG.canvas.height;
        
        // Initialize screens
        this.screens = {
            title: new TitleScreen(this),
            nameInput: new NameInputScreen(this),
            tutorial: new TutorialScreen(this),
            colorSelection: new ColorSelectionScreen(this),
            level: new LevelScreen(this),
            transition: new TransitionScreen(this),
            cutscene: new CutsceneScreen(this),
            valentine: new ValentineScreen(this)
        };
        
        // Current screen
        this.currentScreen = null;
        
        // Game state - stores player preferences and progress
        this.state = {
            playerName: '',        // Player's name (optional)
            lightColor: null,      // Selected light color
            completedLevels: []    // Completed level indices
        };
        
        // Input handling
        this.setupInput();
    }

    /**
     * Setup keyboard input
     */
    setupInput() {
        // Track key presses
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }

    /**
     * Handle key down
     */
    handleKeyDown(e) {
        // Only handle input during level screen
        if (this.currentScreen !== this.screens.level) return;
        
        const player = this.screens.level.player;
        if (!player) return;
        
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                player.keys.up = true;
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                player.keys.down = true;
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                player.keys.left = true;
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                player.keys.right = true;
                e.preventDefault();
                break;
        }
    }

    /**
     * Handle key up
     */
    handleKeyUp(e) {
        // Only handle input during level screen
        if (this.currentScreen !== this.screens.level) return;
        
        const player = this.screens.level.player;
        if (!player) return;
        
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                player.keys.up = false;
                break;
            case 'arrowdown':
            case 's':
                player.keys.down = false;
                break;
            case 'arrowleft':
            case 'a':
                player.keys.left = false;
                break;
            case 'arrowright':
            case 'd':
                player.keys.right = false;
                break;
        }
    }

    /**
     * Change to a different screen
     * @param {string} screenName - Name of screen to change to
     * @param {*} data - Optional data to pass to screen
     */
    changeScreen(screenName, data) {
        const screen = this.screens[screenName];
        
        if (!screen) {
            console.error(`Screen "${screenName}" not found`);
            return;
        }
        
        this.currentScreen = screen;
        screen.enter(data);
    }

    /**
     * Get personalized dialogue text
     * Replaces {name} placeholder with player's name if available
     */
    getPersonalizedDialogue(text) {
        if (!text) return '';
        
        const name = this.state.playerName;
        
        if (name) {
            // Replace {name} with ", [Name]"
            return text.replace(/\{name\}/g, `, ${name}`);
        } else {
            // Remove {name} placeholder entirely
            return text.replace(/\{name\}/g, '');
        }
    }

    /**
     * Update game
     */
    update() {
        if (this.currentScreen) {
            this.currentScreen.update();
        }
    }

    /**
     * Draw game
     */
    draw() {
        if (this.currentScreen) {
            this.currentScreen.draw(this.ctx);
        }
    }

    /**
     * Start the game
     */
    start() {
        this.changeScreen('title');
        this.gameLoop();
    }

    /**
     * Main game loop
     */
    gameLoop() {
        this.update();
        this.draw();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
}