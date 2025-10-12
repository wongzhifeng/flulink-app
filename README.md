# FluLink

**Distributed Flu-like Social Network**

Spread like flu, link every corner you care.

## Project Overview

FluLink is a distributed asynchronous social application based on Bun + SolidStart, using "flu spread" as a metaphor to build content/emotion/interest asynchronous diffusion social.

## Core Features

### Geographic Hierarchical Propagation
- **Level 1 - Local Community**: 0 delay, unlock immediately after posting
- **Level 2 - Nearby Communities**: 5-15 minutes delay, requires ≥20 infected users in local community
- **Level 3 - Street Level**: 30-60 minutes delay, requires ≥2 nearby communities with ≥15 infected users
- **Level 4 - District/City**: 2-4 hours delay, requires ≥3 communities completed propagation in street
- **Cross-border Propagation**: 24-48 hours delay

### Strain System
- **Life Strains**: Daily content, narrow spread but high interaction
- **Opinion Strains**: Topic content, wide spread and easy to trigger secondary creation
- **Interest Strains**: Vertical content, precise spread and strong user stickiness
- **Super Strains**: Cross-border content, supports international propagation with dormancy awakening

### User Tiers
- **Free Users**: Regional privileges, zero delay + priority display
- **Premium Users**: Unlock more levels, customize propagation direction

## Tech Stack

- **Frontend**: Solid.js + SolidStart
- **Backend**: Bun Runtime
- **Database**: Turso (Edge SQLite)
- **Deployment**: Zeabur

## Quick Start

### Requirements
- Bun 1.0.0+
- Node.js 18+

### Installation
```bash
# Clone repository
git clone <repository-url>
cd flulink

# Install dependencies
bun install

# Start development server
bun run dev
```

### Access Application
```
http://localhost:3000
```

## Project Structure

```
flulink/
├── src/
│   ├── client/          # Solid.js frontend components
│   ├── server/          # SolidStart API routes
│   ├── shared/          # Common type definitions
│   └── lib/             # Utility functions
├── memory/              # AI memory bank
└── scripts/             # Automation scripts
```

## Development Guide

### Code Quality Checks
```bash
# Performance benchmark check
bun run check:performance

# Edge computing adaptation check
bun run check:edge

# Code style check
bun run check:lint
```

### Build & Deploy
```bash
# Build application
bun run build

# Start production server
bun run start
```

## Design System

### Color Scheme
- **Primary**: #4CAF50 (Green) - Represents virus propagation and growth
- **Background**: #F5F5F5 (Light Gray) - Clean modern background
- **Text**: #212121 (Dark Gray) - Ensures good readability
- **Accent**: #FFC107 (Amber) - Used for highlights and emphasis

### Component Design
- Card-based layout
- Responsive design
- Fine-grained reactivity

## Platform Features

- PWA Support
- Responsive Layout
- Modern Browser Compatibility
- Turso Edge Database
- Global Distributed Deployment
- Low Latency Data Access

## Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Contact

- Project Issues: [GitHub Issues](https://github.com/your-repo/issues)
- Email: your-email@example.com

## Acknowledgments

Thanks to the following open source projects:
- Solid.js Team
- SolidStart Team
- Bun Team
- Turso Team
- All contributors and community members

---

**Note**: This is an innovative distributed social application project for demonstrating modern web application development best practices.