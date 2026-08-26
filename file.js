let audioContext;
        let isPlaying = false;
        let stopRequested = false;
        let loadedFiles = {};

        const playBtn = document.getElementById('playBtn');
        const stopBtn = document.getElementById('stopBtn');
        const clearBtn = document.getElementById('clearBtn');
        const codeInput = document.getElementById('codeInput');
        const speedControl = document.getElementById('speedControl');
        const speedValue = document.getElementById('speedValue');
        const visualizer = document.getElementById('visualizer');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const statusBar = document.getElementById('statusBar');
        const statusText = document.getElementById('statusText');

        // Create visualizer bars
        for (let i = 0; i < 24; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = '8px';
            visualizer.appendChild(bar);
        }
        const bars = document.querySelectorAll('.bar');

        speedControl.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value + 'ms';
        });

        fileInput.addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    loadedFiles[file.name] = event.target.result;
                    updateFileList();
                };
                reader.readAsText(file);
            });
        });

        function updateFileList() {
            if (Object.keys(loadedFiles).length === 0) {
                fileList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📂</div>
                        <div class="empty-state-text">No files loaded yet</div>
                    </div>
                `;
                return;
            }

            fileList.innerHTML = '';
            Object.keys(loadedFiles).forEach(filename => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.textContent = filename;
                fileItem.addEventListener('click', () => {
                    codeInput.value = loadedFiles[filename];
                    document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
                    fileItem.classList.add('active');
                });
                fileList.appendChild(fileItem);
            });
        }

        clearBtn.addEventListener('click', () => {
            codeInput.value = '';
        });

        function initAudio() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playNote(frequency, duration = 0.15, type = 'sine', volume = 0.3) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            // Add subtle filtering for better quality
            filter.type = 'lowpass';
            filter.frequency.value = Math.min(frequency * 2, 8000);
            filter.Q.value = 1;

            // Improved envelope with attack and decay
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);

            updateVisualizer(frequency);
        }

        function updateVisualizer(frequency) {
            const normalizedFreq = Math.min(frequency / 1000, 1);
            bars.forEach((bar, index) => {
                const height = Math.random() * normalizedFreq * 100 + 15;
                bar.style.height = height + 'px';
                setTimeout(() => {
                    bar.style.height = '8px';
                }, 100);
            });
        }

        function analyzeCode(code) {
            const tokens = [];
            const lines = code.split('\n').filter(line => line.trim().length > 0);

            lines.forEach((line, index) => {
                const trimmed = line.trim();

                if (/\b(for|while|forEach|map|filter|reduce|loop)\b/.test(trimmed)) {
                    tokens.push({ type: 'loop', line: index, text: trimmed });
                }

                if (/\b(function|def|fn|func|lambda|=>|async)\b/.test(trimmed)) {
                    tokens.push({ type: 'function', line: index, text: trimmed });
                }

                if (/\b(if|else|elif|switch|case|match|else\s+if)\b/.test(trimmed)) {
                    tokens.push({ type: 'conditional', line: index, text: trimmed });
                }

                if (/\breturn\b/.test(trimmed)) {
                    tokens.push({ type: 'return', line: index, text: trimmed });
                }

                if (/[{[]/.test(trimmed)) {
                    tokens.push({ type: 'open', line: index, text: trimmed });
                }

                if (/[}\]]/.test(trimmed)) {
                    tokens.push({ type: 'close', line: index, text: trimmed });
                }

                if (/\b(let|const|var|int|string|float|double|bool|class|interface)\b/.test(trimmed)) {
                    tokens.push({ type: 'variable', line: index, text: trimmed });
                }

                if (tokens.filter(t => t.line === index).length === 0) {
                    tokens.push({ type: 'line', line: index, text: trimmed });
                }
            });

            return tokens;
        }

        function tokenToSound(token, baseFreq = 440) {
            switch(token.type) {
                case 'loop':
                    playNote(110, 0.12, 'square', 0.4);
                    setTimeout(() => playNote(110, 0.12, 'square', 0.3), 120);
                    break;

                case 'function':
                    playNote(baseFreq, 0.15, 'sine', 0.35);
                    setTimeout(() => playNote(baseFreq * 1.25, 0.15, 'sine', 0.3), 120);
                    setTimeout(() => playNote(baseFreq * 1.5, 0.15, 'sine', 0.25), 240);
                    break;

                case 'conditional':
                    playNote(330, 0.2, 'triangle', 0.25);
                    playNote(415, 0.2, 'triangle', 0.22);
                    playNote(523, 0.2, 'triangle', 0.2);
                    break;

                case 'return':
                    playNote(880, 0.18, 'sine', 0.3);
                    break;

                case 'open':
                    playNote(65, 0.12, 'triangle', 0.45);
                    break;

                case 'close':
                    playNote(82, 0.12, 'triangle', 0.4);
                    break;

                case 'variable':
                    playNote(523, 0.15, 'sine', 0.25);
                    break;

                case 'line':
                    playNote(262 + Math.random() * 200, 0.1, 'sine', 0.18);
                    break;
            }
        }

        async function playCodeMusic() {
            const code = codeInput.value;

            if (!code.trim()) {
                alert('Please paste some code or select a file first!');
                return;
            }

            initAudio();

            const tokens = analyzeCode(code);
            const speed = parseInt(speedControl.value);

            isPlaying = true;
            stopRequested = false;
            playBtn.disabled = true;
            stopBtn.disabled = false;
            statusBar.classList.add('active');
            statusText.textContent = `Playing ${tokens.length} code elements...`;

            // Prepare code display
            const codeHighlight = document.getElementById('codeHighlight');
            const codeLines = code.split('\n');
            codeHighlight.innerHTML = codeLines.map((line, idx) => 
                `<div class="code-line" data-line="${idx}">${line || ' '}</div>`
            ).join('');
            codeHighlight.style.display = 'block';

            for (let i = 0; i < tokens.length; i++) {
                if (stopRequested) break;

                const token = tokens[i];
                
                // Highlight the current line
                document.querySelectorAll('.code-line').forEach(el => el.classList.remove('playing'));
                const currentLine = document.querySelector(`.code-line[data-line="${token.line}"]`);
                if (currentLine) {
                    currentLine.classList.add('playing');
                    currentLine.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

                tokenToSound(token, 440 + (i % 12) * 55);

                await new Promise(resolve => setTimeout(resolve, speed));
            }

            isPlaying = false;
            playBtn.disabled = false;
            stopBtn.disabled = true;
            statusBar.classList.remove('active');

            // Clear highlighting
            document.querySelectorAll('.code-line').forEach(el => el.classList.remove('playing'));

            if (!stopRequested) {
                setTimeout(() => {
                    playNote(262, 0.4, 'sine', 0.25);
                    playNote(330, 0.4, 'sine', 0.25);
                    playNote(392, 0.4, 'sine', 0.25);
                }, 200);
            }
        }

        playBtn.addEventListener('click', playCodeMusic);

        stopBtn.addEventListener('click', () => {
            stopRequested = true;
            isPlaying = false;
            playBtn.disabled = false;
            stopBtn.disabled = true;
            statusBar.classList.remove('active');
        });