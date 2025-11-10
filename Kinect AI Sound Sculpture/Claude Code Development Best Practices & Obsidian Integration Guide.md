# Claude Code Development Best Practices & Obsidian Integration Guide

## Overview

This guide establishes best practices for developing with Claude Code while maintaining comprehensive documentation in Obsidian. It covers project structure, documentation workflows, logging strategies, and integration patterns for maximum development efficiency.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Obsidian Vault Structure](#obsidian-vault-structure)
3. [Claude Code Best Practices](#claude-code-best-practices)
4. [Documentation Standards](#documentation-standards)
5. [Logging Framework](#logging-framework)
6. [Development Workflow](#development-workflow)
7. [Troubleshooting Documentation](#troubleshooting-documentation)

## Project Setup

### Initial Configuration

bash

```bash
# Create project structure
mkdir project-name
cd project-name
mkdir src docs tests logs data

# Initialize git
git init
echo "logs/" >> .gitignore
echo "*.log" >> .gitignore

# Create Obsidian vault
mkdir obsidian-vault
```

### Environment Setup

markdown

```markdown
# .env.example
NODE_ENV=development
LOG_LEVEL=debug
KINECT_PORT=8080
WEB_PORT=3000
```

## Obsidian Vault Structure

### Recommended Folder Structure

```
obsidian-vault/
├── 00-Project-Overview/
│   ├── README.md
│   ├── Architecture.md
│   └── Requirements.md
├── 01-Daily-Logs/
│   ├── 2025-01-24.md
│   ├── 2025-01-25.md
│   └── Template-Daily-Log.md
├── 02-Development/
│   ├── Claude-Sessions/
│   ├── Code-Snippets/
│   ├── API-Documentation/
│   └── Testing-Results/
├── 03-Problems-Solutions/
│   ├── Bugs/
│   ├── Workarounds/
│   └── Optimizations/
├── 04-Research/
│   ├── Technical-References/
│   ├── Inspiration/
│   └── User-Feedback/
├── 05-Meetings-Reviews/
│   ├── Stakeholder-Meetings/
│   └── Progress-Reviews/
└── Templates/
    ├── Bug-Report.md
    ├── Feature-Request.md
    └── Code-Review.md
```

### Essential Templates

#### Daily Log Template

markdown

```markdown
# Daily Log - {{date}}

## Morning Intention
- [ ] Primary goal:
- [ ] Secondary goals:

## Claude Code Sessions

### Session 1: {{time}}
**Prompt Given:**
```

[Paste exact prompt here]

```

**Result:**
- Files created/modified:
- Key functionality added:
- Issues encountered:

**Code Reference:** [[Code-Snippet-{{date}}-01]]

## Discoveries
- 

## Blockers
- 

## Tomorrow's Focus
- 

## Time Tracking
- Start: 
- End: 
- Productive Hours: 

#daily-log #development
```

#### Claude Session Template

markdown

```markdown
# Claude Session - {{date}} - {{session-name}}

## Context
[What are you trying to achieve?]

## Previous Attempts
- [[Link to previous session if applicable]]

## Prompt
```

[Exact prompt provided to Claude Code]

````

## Response Summary
[Key points from Claude's response]

## Code Output
```javascript
// Critical code segments only
// Full code in: /src/{{filename}}
````

## Testing Results

- [ ]  Code runs without errors
- [ ]  Meets requirements
- [ ]  Edge cases handled
- [ ]  Performance acceptable

## Follow-up Questions

## Related Sessions

- [[Previous Session]]
- [[Next Session]]

#claude-session #{{component-name}}

````

#### Bug Report Template
```markdown
# Bug Report - {{bug-id}} - {{brief-description}}

## Date Discovered
{{date}}

## Severity
[Critical | High | Medium | Low]

## Description
[Detailed description of the bug]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Error Messages
````

[Paste any error messages]

```

## Environment
- OS: 
- Node Version: 
- Browser: 
- Hardware: 

## Attempted Solutions
- [ ] Solution 1: [Description] - Result: 
- [ ] Solution 2: [Description] - Result: 

## Resolution
[How it was fixed]

## Related Issues
- [[Link to related bugs]]

#bug #{{component}}
```

## Claude Code Best Practices

### Prompt Engineering for Claude Code

#### Structure Your Prompts

markdown

```markdown
## Effective Prompt Structure

1. **Context First**
   "Building on the existing Node.js server in /src/server.js..."

2. **Clear Requirements**
   "Create a function that:
   - Accepts Azure Kinect skeleton data
   - Calculates movement velocity
   - Returns normalized values 0-1"

3. **Technical Specifications**
   "Use the following:
   - Language: TypeScript
   - Framework: Express.js
   - Testing: Jest"

4. **File Structure**
   "Place files as follows:
   - Main logic: /src/movement/analyzer.ts
   - Tests: /tests/movement/analyzer.test.ts
   - Types: /src/types/movement.ts"

5. **Success Criteria**
   "The code should:
   - Handle null/undefined gracefully
   - Process 30fps without lag
   - Include JSDoc comments"
```

#### Iterative Development Prompts

markdown

```markdown
## First Prompt - Foundation
"Create a basic web server that receives WebSocket connections and logs incoming data. Use Node.js with Socket.io."

## Second Prompt - Enhancement
"Extend the previous server to parse Azure Kinect skeleton data and calculate basic movement metrics. Add the parsing logic to /src/parsers/kinect.js"

## Third Prompt - Refinement
"Add error handling to the Kinect parser for malformed data, disconnections, and frame drops. Include logging for debugging."
```

### Code Organization Patterns

#### Module Structure

markdown

```markdown
/src/
├── index.js           # Entry point
├── config/           
│   └── default.js     # Configuration
├── services/         
│   ├── kinect.js     # Kinect service
│   └── audio.js      # Audio service
├── processors/       
│   └── movement.js   # Movement processing
├── utils/           
│   └── logger.js     # Logging utility
└── types/           
    └── index.d.ts    # TypeScript definitions
```

### Version Control Integration

markdown

```markdown
## Git Commit Message Format

[TYPE] Component: Brief description

Types:
- FEAT: New feature
- FIX: Bug fix
- REFACTOR: Code refactoring
- DOC: Documentation
- TEST: Testing
- STYLE: Formatting

Example:
"FEAT AudioEngine: Add dynamic reverb based on movement amplitude"

Link to Obsidian note: [[2025-01-24-Session-AudioEngine]]
```

## Documentation Standards

### Code Documentation

javascript

```javascript
/**
 * Analyzes movement quality from Kinect skeleton data
 * @param {Object} skeleton - Azure Kinect skeleton object
 * @param {Object} previousSkeleton - Previous frame for velocity calculation
 * @returns {MovementMetrics} Analyzed movement qualities
 * @see [[Movement-Analysis-Research]] in Obsidian
 * @example
 * const metrics = analyzeMovement(currentSkeleton, lastSkeleton);
 * // metrics.velocity: 0.0 - 1.0
 * // metrics.expansion: 0.0 - 1.0
 */
```

### API Documentation

markdown

````markdown
# API Endpoint: /api/movement

## POST /api/movement/analyze

### Description
Analyzes movement data and returns quality metrics

### Request Body
```json
{
  "skeleton": {...},
  "timestamp": 1234567890
}
````

### Response

json

```json
{
  "metrics": {
    "velocity": 0.75,
    "expansion": 0.5,
    "fluidity": 0.9
  }
}
```

### Related Code

- Handler: `/src/routes/movement.js`
- Processor: `/src/processors/movement.js`
- Tests: `/tests/api/movement.test.js`

````

## Logging Framework

### Structured Logging Setup
```javascript
// /src/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('logs', `${new Date().toISOString().split('T')[0]}.log`),
      level: 'info'
    }),
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      format: winston.format.simple()
    })
  ]
});

// Usage
logger.info('Movement detected', {
  sessionId: uuid,
  metrics: movementData,
  obsidianRef: '[[2025-01-24-Movement-Test]]'
});
````

### Log Analysis Template

markdown

```markdown
# Log Analysis - {{date}}

## Summary Statistics
- Total Errors: 
- Warning Count: 
- Unique Sessions: 
- Average Response Time: 

## Critical Errors
```

[Paste critical errors]

```

## Performance Metrics
- Slowest Operation: 
- Memory Peak: 
- CPU Average: 

## Patterns Observed
- 

## Actions Required
- [ ] Fix: 
- [ ] Optimize: 
- [ ] Investigate:
```

## Development Workflow

### Daily Workflow

markdown

```markdown
## Morning Routine (15 min)
1. Create daily log from template
2. Review yesterday's blockers
3. Set today's goals
4. Check error logs

## Before Each Claude Code Session (5 min)
1. Create session note from template
2. Link to relevant previous sessions
3. Define clear success criteria
4. Prepare test data

## After Each Claude Code Session (10 min)
1. Document what worked/didn't work
2. Copy key code segments to Obsidian
3. Update dependency graph
4. Commit code with reference to Obsidian note

## End of Day (15 min)
1. Update daily log with progress
2. Document any new blockers
3. Create tomorrow's focus list
4. Run test suite and document results
```

### Testing Documentation

markdown

````markdown
# Test Results - {{component}} - {{date}}

## Test Suite
```bash
npm test -- --coverage
````

## Results

- Passing: X/Y
- Coverage: XX%
- Time: XX.Xs

## Failed Tests

```
[Test output]
```

## Performance Benchmarks

|Operation|Time (ms)|Memory (MB)|
|---|---|---|
|Process Frame|XX|XX|
|Calculate Metrics|XX|XX|

## Next Steps

- [ ]  Fix failing test: {{test-name}}
- [ ]  Improve coverage in: {{file}}
- [ ]  Optimize: {{slow-operation}}

````

## Troubleshooting Documentation

### Problem-Solution Pairs
```markdown
# Problem: {{problem-brief}}

## Symptoms
- 

## Root Cause
[Discovered through...]

## Solution
```javascript
// Code that fixed it
````

## Prevention

- Add test case: [[Test-{{test-id}}]]
- Update documentation: [[API-Docs#endpoint]]
- Code review checklist item:

## Related Problems

- [[Similar-Issue-1]]
- [[Root-Cause-Analysis]]

#problem-solved #{{component}}

````

### Decision Log
```markdown
# Decision: {{decision-title}}

## Date: {{date}}

## Context
[Why this decision was needed]

## Options Considered
1. **Option A**
   - Pros: 
   - Cons: 
   
2. **Option B**
   - Pros: 
   - Cons: 

## Decision
[What was chosen and why]

## Consequences
- Positive: 
- Negative: 
- Technical Debt: 

## Review Date
[When to revisit this decision]

#architectural-decision #{{component}}
````

## Integration Scripts

### Obsidian to Code Sync

bash

```bash
#!/bin/bash
# sync-docs.sh

# Export code snippets from Obsidian to project
grep -r "```javascript" obsidian-vault/ | while read -r line; do
    # Extract and save code blocks
done

# Generate dependency graph
madge --image deps.svg src/

# Copy to Obsidian attachments
cp deps.svg obsidian-vault/Attachments/
```

### Automated Daily Note Creation

javascript

```javascript
// create-daily-note.js
const fs = require('fs');
const path = require('path');

const date = new Date().toISOString().split('T')[0];
const template = fs.readFileSync('obsidian-vault/Templates/Daily-Log.md', 'utf8');
const dailyNote = template.replace(/{{date}}/g, date);

fs.writeFileSync(
  path.join('obsidian-vault/01-Daily-Logs', `${date}.md`),
  dailyNote
);

console.log(`Created daily note: ${date}.md`);
```

## Quick Reference

### Essential Obsidian Plugins for Development

1. **Templater** - For dynamic templates
2. **Dataview** - Query and analyze notes
3. **Mermaid** - Flowcharts and diagrams
4. **Code Block Enhancer** - Better code display
5. **Git** - Version control for vault
6. **Tag Wrangler** - Manage tags efficiently
7. **Journey** - Track progress over time

### Useful Queries for Dataview

markdown

````markdown
## All Today's Claude Sessions
```dataview
LIST
FROM #claude-session
WHERE file.cday = date(today)
SORT file.ctime DESC
````

## Outstanding Bugs

dataview

```dataview
TABLE severity, date-discovered
FROM #bug
WHERE !contains(file.text, "Resolution")
SORT severity DESC
```

## This Week's Progress

dataview

```dataview
LIST
FROM #daily-log
WHERE file.cday >= date(today) - dur(7 days)
SORT file.cday DESC
```

```

### Keyboard Shortcuts for Efficiency
- `Ctrl+Shift+N`: New Claude session note
- `Ctrl+Shift+D`: Daily log
- `Ctrl+Shift+B`: Bug report
- `Ctrl+Shift+T`: Run test suite
- `Ctrl+Shift+C`: Copy code block

## Maintenance Schedule

### Daily
- Review logs
- Update progress notes
- Commit code with references

### Weekly
- Analyze error patterns
- Update architecture documentation
- Review and close resolved bugs
- Archive old logs

### Monthly
- Performance trend analysis
- Refactoring opportunities
- Documentation audit
- Dependency updates

---

*Remember: Good documentation is an investment in your future self. Every minute spent documenting saves hours of confusion later.*
```