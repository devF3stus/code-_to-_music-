# Code to Music
Code to Music is a translation engine that transforms raw source code into musical compositions. It maps programming syntax, control structures, and keywords to musical properties such as pitch, rhythm, and instrumentation, allowing developers to hear the structural flow of their software.

## Features

* **Syntax-to-Sound Mapping:** Parses code elements (variables, functions, loops, conditionals) and converts them into distinct musical events.
* **Multi-Language Support:** Interprets syntax from multiple languages (e.g., JavaScript, Python, C++).
* **Customizable Audio Profiles:** Allows mapping adjustments via `mapping.json` to assign different instruments, scales, and tempos to specific code tokens.
* **Audio Export:** Generates and exports the resulting composition as a MIDI or WAV file for use in external DAWs.

## How It Works

The engine uses an Abstract Syntax Tree (AST) to break down the input code. It then maps the AST nodes to a customized musical rule set. By default:

* **Variables & Declarations:** Trigger foundational bass notes or chord progressions.
* **Functions & Methods:** Introduce new melodic lead lines or instrument changes.
* **Loops (for, while):** Generate rhythmic ostinatos. Nested loops increase tempo or rhythmic density.
* **Conditionals (if/else):** Create harmonic shifts or key changes.
* **Errors & Exceptions:** Produce dissonant accents.

## Installation

Clone the repository and install the required dependencies.

```bash
git clone [https://github.com/yourusername/code-to-music.git](https://github.com/yourusername/code-to-music.git)
cd code-to-music
npm install
Usage
Run the engine from the command line by passing a source code file as an argument.

Bash
# Generate music and play immediately
npm start -- input_code.js --play

# Export to MIDI
npm start -- input_code.py --export output.mid
onfiguration
To customize the translation rules, edit the config/mapping.json file. You can adjust the root key, assign specific MIDI instruments (1-128), and set the base BPM.

JSON
{
  "baseTempo": 120,
  "keySignature": "C_Minor",
  "instruments": {
    "functions": "Acoustic Grand Piano",
    "loops": "Synth Drum",
    "variables": "Electric Bass"
  }
}
Contributing
Fork the Project

Create your Feature Branch (git checkout -b feature/NewFeature)

Commit your Changes (git commit -m 'Add NewFeature')

Push to the Branch (git push origin feature/NewFeature)

Open a Pull Request
