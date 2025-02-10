#!/usr/bin/env Rscript
# This R script scans your project directory and creates a file (output.txt) with your codebase
# that contains:
#   1. A tree-like ASCII representation of your project's directory structure.
#   2. The content of each code file (filtered by file type).
#
# This is particularly useful for providing context about your codebase to an AI or a human collaborator.
#
# Usage:
#   - Place this script in your project's root directory.
#   - Run it in the terminal with: ./create_prompt.R
#
# Configuration:
#   - EXCLUDED_DIRS: Directories to ignore (e.g., .git, node_modules).
#   - EXCLUDED_FILES: Specific files to ignore.
#   - EXCLUDED_EXTENSIONS: File extensions to ignore (e.g., images, JSON, etc.).
#   - BASE_DIRECTORY: The directory to scan (default is the current directory).



#  Do you like it? Add me on LinkedIn (Piet Jonker) 
#  Do you know about opportunities for AI/LLM development? --> email to piet@backlight.ai



# --- Configuration Section ---
EXCLUDED_DIRS <- c(".git", ".next", "node_modules")
EXCLUDED_FILES <- c("package.json", "package-lock.json", "create_prompt.R", ".DS_Store", "README.md")
EXCLUDED_EXTENSIONS <- tolower(c(".png", ".jpg", ".jpeg", ".gif", ".ico",
                                 ".pdf", ".zip", ".tar", ".gz", ".mp3", ".mp4", ".csv",
                                 ".xlsx", ".json", ".enc"))
BASE_DIRECTORY <- "."

# --- Helper Function: generate_tree ---
generate_tree <- function(directory, prefix = "") {
  # Recursively builds an ASCII tree of the directory structure.
  lines <- character(0)
  # Get a sorted list of entries in the directory (excluding hidden files).
  entries <- sort(list.files(directory, all.files = FALSE, no.. = TRUE))
  filtered_entries <- character(0)
  
  # Filter out directories and files that are excluded.
  for (entry in entries) {
    full_path <- file.path(directory, entry)
    if (dir.exists(full_path)) {
      if (!(entry %in% EXCLUDED_DIRS)) {
        filtered_entries <- c(filtered_entries, entry)
      }
    } else {
      if (!(entry %in% EXCLUDED_FILES)) {
        ext <- paste0(".", tolower(tools::file_ext(entry)))
        if (!(ext %in% EXCLUDED_EXTENSIONS)) {
          filtered_entries <- c(filtered_entries, entry)
        }
      }
    }
  }
  
  n <- length(filtered_entries)
  # Build tree lines with connectors.
  for (i in seq_along(filtered_entries)) {
    entry <- filtered_entries[i]
    connector <- if (i == n) "└── " else "├── "
    line <- paste0(prefix, connector, entry)
    lines <- c(lines, line)
    full_path <- file.path(directory, entry)
    # If the entry is a directory, recursively generate its subtree.
    if (dir.exists(full_path)) {
      extension <- if (i == n) "    " else "│   "
      subtree <- generate_tree(full_path, paste0(prefix, extension))
      lines <- c(lines, subtree)
    }
  }
  return(lines)
}

# --- Build the Directory Tree ---
# Inform the user about the script's purpose.
cat("Welcome! This script scans your project and generates a Markdown overview.\n")
base_name <- basename(normalizePath(BASE_DIRECTORY))
# Start the Markdown content with a header and the base directory.
markdown_lines <- c("# Project file structure", paste("📁", base_name))
tree_lines <- generate_tree(BASE_DIRECTORY)
markdown_lines <- c(markdown_lines, tree_lines)

# --- Collect Code File Contents ---
code_content <- list()

collect_code_files <- function(directory) {
  # Recursively collects the content of code files that pass the filtering criteria.
  files <- list.files(directory, all.files = FALSE, no.. = TRUE)
  for (file in files) {
    full_path <- file.path(directory, file)
    if (dir.exists(full_path)) {
      if (!(file %in% EXCLUDED_DIRS)) {
        collect_code_files(full_path)
      }
    } else {
      if (!(file %in% EXCLUDED_FILES)) {
        ext <- paste0(".", tolower(tools::file_ext(file)))
        if (!(ext %in% EXCLUDED_EXTENSIONS)) {
          content <- tryCatch(
            readLines(full_path, warn = FALSE),
            error = function(e) NA
          )
          if (!is.na(content[1])) {
            relative_path <- substring(normalizePath(full_path),
                                       nchar(normalizePath(BASE_DIRECTORY)) + 2)
            code_content[[relative_path]] <<- paste(content, collapse = "\n")
          }
        }
      }
    }
  }
}

# Start collecting code files from the base directory.
collect_code_files(BASE_DIRECTORY)

# --- Write the Output to a Markdown File ---
output <- paste(markdown_lines, collapse = "\n")
output <- paste(output, "\n\n# Code files\n", sep = "")

# Append each file's content to the output.
for (relative_path in names(code_content)) {
  output <- paste(output, sprintf("\n## %s\n", relative_path), sep = "")
  output <- paste(output, "```\n", sep = "")
  output <- paste(output, code_content[[relative_path]], "\n", sep = "")
  output <- paste(output, "```\n", sep = "")
}

# Write the final output to "output.txt".
writeLines(output, "output.txt")
cat("Output successfully written to 'output.txt'.\n")
