# Suggested Commands for Development

## Frontend Development

### Start Development Server
```bash
cd frontend
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
npm run preview
```

### Testing
```bash
cd frontend
npm test
npm run test:ui  # Vitest UI
```

### Code Quality
```bash
cd frontend
npm run lint
npx prettier --write .
```

## Context7 Integration (AI Assistant)

### Query Best Practices Before Coding
```bash
# In AI chat, use Context7 MCP:
"Use Context7 to find React Three Fiber optimization patterns"
"Query Context7 for three.js InstancedMesh best practices"
"Look up React 19 performance recommendations via Context7"
```

### Common Context7 Queries
- React Three Fiber: `/vercel/react-three-fiber`
- Three.js: `/mrdoob/three.js`
- React: `/facebook/react`
- Vite: `/vitejs/vite`

## Project Management

### Check Project Size
```bash
Get-ChildItem -Recurse -Force | Measure-Object -Property Length -Sum | Select-Object @{Name="TotalSizeMB";Expression={[math]::Round($_.Sum / 1MB, 2)}}
```

### Clean Node Modules
```bash
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## AI Workflow Reminders

**Before implementing any feature:**
1. Read `.clauderules` and `.serena/memories/ai_workflow_guidelines.md`
2. Use Context7 MCP to research best practices
3. Read related components completely
4. Present strategy before coding
5. Implement after approval

This ensures optimal, production-ready solutions.
