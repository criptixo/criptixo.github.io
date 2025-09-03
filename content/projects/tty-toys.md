---
title: "tty-toys"
date: "2025-08-28"
status: "active"
tags: ["cli", "tools", "bash", "productivity"]
repo: "https://github.com/criptixo/tty-toys"
description: "Tiny CLI utilities for daily workflow optimization"
---

# tty-toys

Tiny CLI bits for daily flow.

A collection of small, focused command-line utilities designed to streamline everyday tasks. Each tool follows the Unix philosophy: do one thing and do it well.

## Philosophy

- **Small**: Each tool is lightweight and focused
- **Fast**: Optimized for quick execution
- **Composable**: Works well with other Unix tools
- **Useful**: Solves real daily workflow problems

## Tools

### Current Collection

- **quicknote**: Rapid note-taking from the command line
- **gitquick**: Fast git operations with sensible defaults
- **termcolor**: Color palette management for terminal themes
- **devtime**: Simple time tracking for development sessions

### Installation

```bash
git clone https://github.com/criptixo/tty-toys
cd tty-toys
./install.sh
```

### Usage Examples

```bash
# Quick note
quicknote "Remember to update dependencies"

# Fast git commit
gitquick "Fix navigation bug"

# Show current terminal colors
termcolor --show

# Start time tracking
devtime start "Working on routing"
```

These tools are designed to be the perfect companions for terminal-based development workflows.