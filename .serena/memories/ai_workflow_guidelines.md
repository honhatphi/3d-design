# AI Workflow Guidelines

## Problem-Solving Approach

### Before Writing Any Code:

1. **Research Phase (MANDATORY)**

   - Use MCP Context7 to look up best practices for the technology/library involved
   - Search for official documentation patterns
   - Review existing codebase for similar implementations
   - Read ALL related components before making changes

2. **Analysis Phase**

   - Identify all affected components and their relationships
   - Consider performance implications
   - Check for existing utilities or patterns that can be reused
   - List potential edge cases

3. **Planning Phase**
   - Present a clear strategy/solution approach
   - Explain WHY this solution is optimal
   - Outline implementation steps
   - Get confirmation before proceeding

### Implementation Rules:

- **NEVER** jump directly to coding without research
- **ALWAYS** use Context7 MCP for best practices lookup when:

  - Working with React Three Fiber / Three.js
  - Implementing state management patterns
  - Handling performance-critical code
  - Using new libraries or APIs

- **MUST** read related files completely before editing:
  - Check imports and exports
  - Understand data flow
  - Identify dependencies

### Code Quality Standards:

- Follow existing patterns in the codebase
- Prioritize performance (especially for 3D rendering)
- Write self-documenting code with clear variable names
- Add comments for complex logic only
- Ensure changes are backward compatible when possible

### Context7 Usage Examples:

```
When working with Three.js optimization:
→ Query Context7: "three.js performance best practices instanced mesh"

When implementing React state:
→ Query Context7: "react 19 state management patterns"

When handling 3D animations:
→ Query Context7: "react-three-fiber animation optimization useFrame"
```

## Response Format:

1. **Acknowledge the problem**
2. **Research** (show Context7 queries if used)
3. **Present strategy** with reasoning
4. **Wait for approval**
5. **Implement** with clear explanations

This ensures optimal solutions backed by current best practices rather than quick fixes.
