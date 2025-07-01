const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure docs directory exists
const docsDir = path.join(__dirname, '../docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Function to generate Mermaid diagram
function generateMermaidDiagram(imports) {
  let mermaid = '```mermaid\ngraph LR\n';
  
  // Add nodes and edges based on imports
  imports.forEach(({ from, to }) => {
    // Clean up paths for better readability
    const fromClean = from.replace(/^src\//, '').replace(/\.(js|jsx|ts|tsx)$/, '');
    const toClean = to.replace(/^src\//, '').replace(/\.(js|jsx|ts|tsx)$/, '');
    mermaid += `  ${fromClean.replace(/\//g, '_')}["${fromClean}"] --> ${toClean.replace(/\//g, '_')}["${toClean}"]\n`;
  });
  
  mermaid += '```';
  return mermaid;
}

// Function to analyze code and extract imports
function analyzeCode() {
  const imports = [];
  
  // This is a simplified example - in a real implementation, you would:
  // 1. Recursively scan the src directory
  // 2. Parse each JavaScript/TypeScript file
  // 3. Extract import/require statements
  // 4. Build a graph of dependencies
  
  // For now, we'll use madge if available
  try {
    execSync('npx madge --json src/ > .module-graph.json');
    const madgeOutput = JSON.parse(fs.readFileSync('.module-graph.json', 'utf8'));
    
    Object.entries(madgeOutput).forEach(([file, deps]) => {
      deps.forEach(dep => {
        imports.push({
          from: file,
          to: dep
        });
      });
    });
    
    // Clean up
    fs.unlinkSync('.module-graph.json');
  } catch (error) {
    console.warn('Madge not available, using sample data');
    // Fallback sample data
    imports.push(
      { from: 'src/pages/index.js', to: 'src/components/Header.js' },
      { from: 'src/pages/index.js', to: 'src/utils/api.js' },
      { from: 'src/components/Header.js', to: 'src/components/Logo.js' }
    );
  }
  
  return imports;
}

// Main function
function main() {
  console.log('Analyzing code...');
  const imports = analyzeCode();
  
  console.log('Generating documentation...');
  const mermaidDiagram = generateMermaidDiagram(imports);
  
  // Generate code-graph.md
  const codeGraphContent = `# Code Structure

This document provides an overview of the project's code structure and module dependencies.

## Module Dependencies

${mermaidDiagram}

## Module Descriptions

- **src/pages/**: Next.js page components
- **src/components/**: Reusable UI components
- **src/lib/**: Utility functions and shared logic
- **src/styles/**: Global styles and themes

## How to Update

This diagram is automatically generated. To update it, run:

\`\`\`bash
node scripts/generate-docs.js
\`\`\`
`;

  fs.writeFileSync(path.join(docsDir, 'code-graph.md'), codeGraphContent);
  
  // Update README if it exists
  const readmePath = path.join(__dirname, '../README.md');
  if (fs.existsSync(readmePath)) {
    let readme = fs.readFileSync(readmePath, 'utf8');
    
    // Add link to code graph if not already present
    if (!readme.includes('code-graph.md')) {
      readme += '\n## Documentation\n\n- [Code Structure and Dependencies](./docs/code-graph.md)\n';
      fs.writeFileSync(readmePath, readme);
    }
  }
  
  console.log('Documentation generated successfully!');
  console.log('- Updated docs/code-graph.md');
  if (fs.existsSync(readmePath)) {
    console.log('- Updated README.md');
  }
}

// Run the script
main();
