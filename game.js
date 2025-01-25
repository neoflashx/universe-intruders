const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    // Define all classes first
    class Player {
      constructor() {
        this.width = 60;
        this.height = 50;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 80;
        this.speed = 7.2;
        this.laserCooldown = 0;
        this.keys = {
          left: false,
          right: false,
          space: false
        };
      }

      draw() {
        // Save context state
        ctx.save();
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.5, this.y);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.7);
        ctx.lineTo(this.x + this.width * 0.5, this.y + this.height);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.7);
        ctx.closePath();
        
        // Main body gradient
        const gradient = ctx.createLinearGradient(
          this.x, this.y,
          this.x + this.width, this.y + this.height
        );
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(0.5, '#888');
        gradient.addColorStop(1, '#555');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Body outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cockpit
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.4, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.6, this.y + this.height * 0.3);
        ctx.lineTo(this.x + this.width * 0.5, this.y + this.height * 0.1);
        ctx.closePath();
        
        // Cockpit gradient
        const cockpitGradient = ctx.createRadialGradient(
          this.x + this.width * 0.5, this.y + this.height * 0.2,
          0,
          this.x + this.width * 0.5, this.y + this.height * 0.2,
          this.width * 0.2
        );
        cockpitGradient.addColorStop(0, '#aaf');
        cockpitGradient.addColorStop(1, '#335');
        ctx.fillStyle = cockpitGradient;
        ctx.fill();
        
        // Cockpit outline
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Engines
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.35, this.y + this.height * 0.8, 5, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.8, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#f50';
        ctx.fill();
        
        // Engine glow
        ctx.beginPath();
        ctx.arc(this.x + this.width * 0.35, this.y + this.height * 0.8, 8, 0, Math.PI * 2);
        ctx.arc(this.x + this.width * 0.65, this.y + this.height * 0.8, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
        ctx.fill();
        
        // Wing details
        ctx.beginPath();
        ctx.moveTo(this.x + this.width * 0.2, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.1, this.y + this.height * 0.6);
        ctx.lineTo(this.x + this.width * 0.2, this.y + this.height * 0.7);
        ctx.moveTo(this.x + this.width * 0.8, this.y + this.height * 0.5);
        ctx.lineTo(this.x + this.width * 0.9, this.y + this.height * 0.6);
        ctx.lineTo(this.x + this.width * 0.8, this.y + this.height * 0.7);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Restore context state
        ctx.restore();
      }

      move() {
        if (this.keys.left && this.x > 0) {
          this.x -= this.speed;
        }
        if (this.keys.right && this.x + this.width < canvas.width) {
          this.x += this.speed;
        }
        if (this.keys.space) {
          this.shoot();
        }
      }

      shoot() {
        if (this.laserCooldown <= 0) {
          lasers.push(new Laser(this.x + this.width / 2 - 2.5, this.y));
          this.laserCooldown = 20;
          playPewSound();
        }
      }

      update() {
        if (this.laserCooldown > 0) this.laserCooldown--;
        this.move();
      }
    }

    class Enemy {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30;
        this.speed = 1;
        this.direction = 1;
      }

      draw() {
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }

      update() {
        this.x += this.speed * this.direction;
      }
    }

    class Laser {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
        this.speed = 7;
      }

      draw() {
        ctx.fillStyle = '#0ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }

      update() {
        this.y -= this.speed;
      }
    }

    // Initialize game variables after class definitions
    const player = new Player();
    let enemies = [];
    let lasers = [];
    let gameOver = false;
    let score = 0;
    let lastMoveSoundTime = 0;

    // Audio context and sound generators
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playPewSound() {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    }

    function playEnemyMoveSound() {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(440, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Music control variables
    let musicEnabled = true;
    let musicGainNode = null;

    // Create music toggle button
    const musicToggle = document.createElement('div');
    musicToggle.style.position = 'absolute';
    musicToggle.style.top = '10px';
    musicToggle.style.right = '10px';
    musicToggle.style.cursor = 'pointer';
    musicToggle.style.fontSize = '24px';
    musicToggle.style.color = '#fff';
    musicToggle.textContent = '🎵';
    document.body.appendChild(musicToggle);

    // Toggle music on click
    musicToggle.addEventListener('click', () => {
      musicEnabled = !musicEnabled;
      if (musicGainNode) {
        musicGainNode.gain.setValueAtTime(musicEnabled ? 0.1 : 0, audioContext.currentTime);
      }
      musicToggle.textContent = musicEnabled ? '🎵' : '🔇';
    });

    // Background music with multiple layers
    function createBackgroundMusic() {
      // Create main oscillators
      const leadOsc = audioContext.createOscillator();
      const bassOsc = audioContext.createOscillator();
      const harmonyOsc = audioContext.createOscillator();
      const drumOsc = audioContext.createOscillator();
      
      // Create gain nodes for volume control
      const leadGain = audioContext.createGain();
      const bassGain = audioContext.createGain();
      const harmonyGain = audioContext.createGain();
      const drumGain = audioContext.createGain();
      musicGainNode = audioContext.createGain();
      
      // Set oscillator types
      leadOsc.type = 'square';
      bassOsc.type = 'sawtooth';
      harmonyOsc.type = 'triangle';
      drumOsc.type = 'square';
      
      // Set initial volumes
      leadGain.gain.value = 0.1;
      bassGain.gain.value = 0.08;
      harmonyGain.gain.value = 0.06;
      drumGain.gain.value = 0.05;
      musicGainNode.gain.value = 0.1;
      
      // Connect nodes
      leadOsc.connect(leadGain).connect(musicGainNode).connect(audioContext.destination);
      bassOsc.connect(bassGain).connect(musicGainNode).connect(audioContext.destination);
      harmonyOsc.connect(harmonyGain).connect(musicGainNode).connect(audioContext.destination);
      drumOsc.connect(drumGain).connect(musicGainNode).connect(audioContext.destination);
      
      // Start oscillators
      leadOsc.start();
      bassOsc.start();
      harmonyOsc.start();
      drumOsc.start();
      
      // Music pattern data
      const leadPattern = [
        { note: 440, duration: 0.5 },  // A4
        { note: 523.25, duration: 0.25 },  // C5
        { note: 587.33, duration: 0.25 },  // D5
        { note: 659.25, duration: 0.5 },  // E5
        { note: 783.99, duration: 0.25 },  // G5
        { note: 659.25, duration: 0.25 },  // E5
        { note: 587.33, duration: 0.5 },  // D5
        { note: 523.25, duration: 0.5 }   // C5
      ];
      
      const bassPattern = [
        { note: 110, duration: 1 },  // A2
        { note: 130.81, duration: 1 },  // C3
        { note: 146.83, duration: 1 },  // D3
        { note: 164.81, duration: 1 }   // E3
      ];
      
      const harmonyPattern = [
        { note: 329.63, duration: 0.5 },  // E4
        { note: 392.00, duration: 0.5 },  // G4
        { note: 440.00, duration: 0.5 },  // A4
        { note: 493.88, duration: 0.5 }   // B4
      ];
      
      const drumPattern = [
        { note: 100, duration: 0.25 },
        { note: 0, duration: 0.25 },
        { note: 80, duration: 0.25 },
        { note: 0, duration: 0.25 }
      ];
      
      // Schedule notes
      function scheduleNotes(oscillator, gainNode, pattern, startTime) {
        let currentNote = 0;
        const patternLength = pattern.length;
        
        function playNextNote(time) {
          const note = pattern[currentNote % patternLength];
          
          if (note.note > 0) {
            oscillator.frequency.setValueAtTime(note.note, time);
            gainNode.gain.setValueAtTime(0.1, time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + note.duration * 0.9);
          }
          
          currentNote++;
          setTimeout(() => playNextNote(audioContext.currentTime), note.duration * 1000);
        }
        
        playNextNote(startTime);
      }
      
      // Start patterns with slight offsets for richer sound
      const startTime = audioContext.currentTime + 0.1;
      scheduleNotes(leadOsc, leadGain, leadPattern, startTime);
      scheduleNotes(bassOsc, bassGain, bassPattern, startTime + 0.05);
      scheduleNotes(harmonyOsc, harmonyGain, harmonyPattern, startTime + 0.1);
      scheduleNotes(drumOsc, drumGain, drumPattern, startTime);
    }

    // Start background music
    createBackgroundMusic();

    // Rest of the game code remains the same...
    function createEnemies() {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 8; col++) {
          enemies.push(new Enemy(100 + col * 70, 50 + row * 50));
        }
      }
    }

    function handleCollisions() {
      lasers.forEach((laser, lIndex) => {
        enemies.forEach((enemy, eIndex) => {
          if (laser.x < enemy.x + enemy.width &&
              laser.x + laser.width > enemy.x &&
              laser.y < enemy.y + enemy.height &&
              laser.y + laser.height > enemy.y) {
            lasers.splice(lIndex, 1);
            enemies.splice(eIndex, 1);
            score += 10;
          }
        });
      });
    }

    function update() {
      if (gameOver) return;

      player.update();
      enemies.forEach(enemy => enemy.update());
      lasers.forEach(laser => laser.update());

      // Check if enemies hit the sides
      if (enemies.some(enemy => enemy.x <= 0 || enemy.x + enemy.width >= canvas.width)) {
        enemies.forEach(enemy => {
          enemy.direction *= -1;
          enemy.y += 20;
        });
        
        // Play enemy move sound with cooldown
        const now = Date.now();
        if (now - lastMoveSoundTime > 200) {
          playEnemyMoveSound();
          lastMoveSoundTime = now;
        }
      }

      // Check if enemies reach the player
      if (enemies.some(enemy => enemy.y + enemy.height >= player.y)) {
        gameOver = true;
      }

      handleCollisions();

      if (enemies.length === 0) {
        createEnemies();
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      player.draw();
      enemies.forEach(enemy => enemy.draw());
      lasers.forEach(laser => laser.draw());

      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${score}`, 10, 30);

      if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px Arial';
        ctx.fillText('GAME OVER', canvas.width / 2 - 100, canvas.height / 2);
      }
    }

    function gameLoop() {
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }

    createEnemies();
    gameLoop();

    // Controls
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') player.keys.left = true;
      if (e.key === 'ArrowRight') player.keys.right = true;
      if (e.key === ' ') player.keys.space = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') player.keys.left = false;
      if (e.key === 'ArrowRight') player.keys.right = false;
      if (e.key === ' ') player.keys.space = false;
    });
