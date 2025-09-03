---
title: termviz
date: 2025-08-30
status: early-development
tags: [rust, visualization, terminal]
repo: https://github.com/criptixo/termviz
description: Terminal-based data visualization tools with a focus on minimalism.
---

# termviz

Terminal-based data visualization with a focus on minimalism and efficiency.

## About

termviz turns your terminal into a data visualization canvas. Create charts, graphs, and visualizations using ASCII characters and ANSI colors.

## Features

Current features:
- Bar charts
- Line graphs
- Scatter plots
- Heatmaps
- Basic animations

Example output:
```
Revenue Growth
┌──────────────────────────────┐
│    ▇                        │
│    ▇ ▇                     │
│  ▇ ▇ ▇     ▇               │
│▇ ▇ ▇ ▇ ▇ ▇ ▇ ▇            │
└──────────────────────────────┘
Q1 Q2 Q3 Q4 Q1 Q2 Q3 Q4
```

## Usage

```bash
termviz bar data.csv
termviz line --animate data.json
termviz heat matrix.txt
```

## Installation

Coming soon to crates.io!

## Development Status

Currently implementing:
- More chart types
- Data import formats
- Color schemes
- Interactive features

## Contributing

Project is in early development. Design suggestions and contributions welcome!
