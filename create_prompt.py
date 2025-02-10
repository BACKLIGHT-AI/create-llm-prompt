#!/usr/bin/env python3
"""
This script scans your project directory and creates a Markdown file (output.txt)
that contains both:
  1. A tree representation of your project's directory structure.
  2. The contents of code files (filtered by file type).

This is especially useful for providing context (to an AI or a human reviewer)
about your project's layout and source code.

Usage:
  - Place this script in your project's root directory.
  - Run it with: python create_prompt.py
  - The generated file "output.txt" will include the directory tree and the code files.
  
Configuration:
  - EXCLUDED_DIRS: Directories to ignore (e.g., .git, node_modules).
  - EXCLUDED_FILES: Specific files to ignore.
  - EXCLUDED_EXTENSIONS: File types to ignore (e.g., images, binary files, JSON, etc.).
"""

import os

# --- Configuration Section ---
# These variables define what should be excluded from the output.
EXCLUDED_DIRS = {'.git', '.next', 'node_modules'}
EXCLUDED_FILES = {'package.json', 'package-lock.json', 'create_prompt.py', '.DS_Store', 'README.md'}
EXCLUDED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.ico',
                       '.pdf', '.zip', '.tar', '.gz', '.mp3', '.mp4', '.csv', '.xlsx', '.json']
# Set the base directory to scan; use '.' for the current directory.
BASE_DIRECTORY = '.'

def generate_tree(directory, prefix=""):
    """
    Recursively generates an ASCII tree of the directory structure.
    
    Parameters:
      directory (str): The directory to scan.
      prefix (str): The prefix for the current recursion level (for indentation).
    
    Returns:
      list of str: Each string represents a line in the tree, using connectors:
          - "├── " for non-final entries.
          - "└── " for the final entry in a directory.
          
    The function excludes any directory, file, or file type specified in the configuration.
    """
    lines = []
    try:
        # Retrieve a sorted list of directory entries.
        entries = sorted(os.listdir(directory))
    except Exception:
        return lines  # Return an empty list if the directory can't be read.

    # Filter entries to remove unwanted directories/files.
    filtered_entries = []
    for entry in entries:
        full_path = os.path.join(directory, entry)
        if os.path.isdir(full_path):
            if entry in EXCLUDED_DIRS:
                continue  # Skip directories that are excluded.
            filtered_entries.append(entry)
        else:
            if entry in EXCLUDED_FILES:
                continue  # Skip files that are explicitly excluded.
            ext = os.path.splitext(entry)[1].lower()
            if ext in EXCLUDED_EXTENSIONS:
                continue  # Skip files with excluded extensions.
            filtered_entries.append(entry)

    # Build the tree lines with connectors.
    for i, entry in enumerate(filtered_entries):
        # Choose the proper connector depending on the entry's position.
        connector = "└── " if i == len(filtered_entries) - 1 else "├── "
        line = prefix + connector + entry
        lines.append(line)
        full_path = os.path.join(directory, entry)
        # If the entry is a directory, recursively generate its tree.
        if os.path.isdir(full_path):
            # Choose the right indentation extension.
            extension = "    " if i == len(filtered_entries) - 1 else "│   "
            lines.extend(generate_tree(full_path, prefix + extension))
    return lines

if __name__ == '__main__':
    # Inform the user about the script's purpose.
    print("Welcome! This script scans your project and generates a Markdown file with its structure and code.")
    print("Scanning directories and generating tree structure...")

    # --- Build the Directory Tree Structure ---
    # Get the base directory name (for display purposes).
    base_name = os.path.basename(os.path.abspath(BASE_DIRECTORY))
    # Start the Markdown output with a header and the base directory.
    markdown_lines = ['# Project file structure', f'📁 {base_name}']
    # Generate the tree structure recursively.
    tree_lines = generate_tree(BASE_DIRECTORY, prefix="")
    markdown_lines.extend(tree_lines)

    # --- Collect Code File Contents ---
    code_content = {}
    # Walk through all directories and files starting from BASE_DIRECTORY.
    for root, dirs, files in os.walk(BASE_DIRECTORY):
        # Exclude directories specified in the configuration.
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for file_name in files:
            if file_name in EXCLUDED_FILES:
                continue  # Skip excluded files.
            file_path = os.path.join(root, file_name)
            file_extension = os.path.splitext(file_name)[1].lower()
            if file_extension in EXCLUDED_EXTENSIONS:
                continue  # Skip files with excluded extensions.
            try:
                # Read the file's content.
                with open(file_path, 'r', encoding='utf-8', errors='replace') as code_file:
                    # Get the path relative to the BASE_DIRECTORY.
                    relative_path = os.path.relpath(file_path, BASE_DIRECTORY)
                    code_content[relative_path] = code_file.read()
            except Exception as e:
                print(f"Warning: Could not read file {file_path}. Error: {e}")

    # --- Write the Output to a Markdown File ---
    print("Writing output to 'output.txt'...")
    try:
        with open('output.txt', 'w', encoding='utf-8') as output_file:
            # Write the tree structure.
            output_file.write('\n'.join(markdown_lines))
            # Write a header for the code files.
            output_file.write('\n\n# Code files\n')
            # Write each code file's content with its relative path as a sub-header.
            for relative_path, content in code_content.items():
                output_file.write(f'\n## {relative_path}\n')
                output_file.write('```\n')
                output_file.write(content)
                output_file.write('\n```\n')
        print("Output successfully written to 'output.txt'.")
    except Exception as e:
        print(f"Error: Failed to write output file. {e}")
