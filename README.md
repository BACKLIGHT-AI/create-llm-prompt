# Project context extractor

Welcome to the **Project context extractor**!

---

## Why this tool

I'm tired of copy-pasting chunks of code into LLMs and getting responses that miss the full context of my projects. It can be incredibly frustrating when an LLM doesn't understand how the various pieces of your code fit together. I created this tool out of that frustration—to automate the process of capturing your entire project's structure and the contents of its code files in one neatly formatted text file.

Right now I'm using a lot of LLM to learn web-development. I try to do as much as possible myself to learn, but I often need or want AI assistance.

This way, you no longer have to manually copy and paste code snippets without context. Instead, you can generate a complete context file that provides a holistic view of your project. Just open the generated `output.txt`, copy its contents, and copy+paste to your LLM. Now it has everything it needs to understand your project! It was handy for me so maybe it's handy for you as well.

---

## How it works

- **Scans your project:** It recursively traverses your project directory.
- **Generates a tree structure:** It creates an ASCII tree representation of your project's directory layout.
- **Collects code files:** It gathers the contents of code files while filtering out unwanted files (like images, binaries, and certain configuration files).
- **Outputs as a markdown file:** All the gathered information is saved into a Markdown file (`output.txt`) that you can easily copy and paste.

---

## Setup and usage

1. **Download or copy+paste the create_prompt file from the repository**  

2. **Run the script:**  
   - For Python:  
     ```bash
     python create_prompt.py
     ```
   - For Node.js (if you choose the JavaScript version):  
     ```bash
     node create_prompt.js
     ```
   - For R:  
     ```bash
     ./create_prompt.R
     ```
     Or go into the script and ctrl+shift+enter / cmnd+shift+enter
   
3. **Copy and paste the output:**  
   Open `output.txt` and use its contents as the full context when interacting with your LLM.

---

## Final thoughts

Courtesy of Backlight.ai

Happy coding!
