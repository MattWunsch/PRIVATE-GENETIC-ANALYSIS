#!/usr/bin/env ts-node

/**
 * @title FHEVM Documentation Generator
 * @notice Automated documentation generator from code annotations
 * @dev Extracts TSDoc comments from tests and generates GitBook-compatible markdown
 *
 * This tool parses TypeScript test files and extracts:
 * - Test descriptions and purposes
 * - Code examples
 * - Chapter and category tags
 * - Usage instructions
 *
 * Usage:
 * ```bash
 * ts-node automation/generate-docs.ts
 * ```
 */

import * as fs from "fs";
import * as path from "path";

interface DocSection {
  title: string;
  description: string;
  category?: string;
  chapter?: string;
  complexity?: string;
  examples: string[];
  concepts: string[];
}

/**
 * @notice Main documentation generation function
 */
async function generateDocumentation(): Promise<void> {
  console.log("\n📚 Generating FHEVM Documentation...\n");

  const projectRoot = path.join(__dirname, "..");
  const testDir = path.join(projectRoot, "test");
  const docsDir = path.join(projectRoot, "docs");

  // Create docs directory if it doesn't exist
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Read test files
  const testFiles = fs
    .readdirSync(testDir)
    .filter((file) => file.endsWith(".test.ts"));

  console.log(`Found ${testFiles.length} test file(s) to process\n`);

  for (const testFile of testFiles) {
    const filePath = path.join(testDir, testFile);
    await processTestFile(filePath, docsDir);
  }

  // Generate summary index
  await generateIndex(docsDir);

  console.log("\n✅ Documentation generation complete!");
  console.log(`📁 Documentation saved to: ${docsDir}\n`);
}

/**
 * @notice Process a single test file and extract documentation
 * @param filePath Path to the test file
 * @param outputDir Directory to write documentation
 */
async function processTestFile(
  filePath: string,
  outputDir: string
): Promise<void> {
  const content = fs.readFileSync(filePath, "utf-8");
  const fileName = path.basename(filePath, ".test.ts");

  console.log(`📄 Processing: ${fileName}`);

  // Extract metadata from top-level JSDoc
  const metadata = extractMetadata(content);

  // Extract test sections
  const sections = extractTestSections(content);

  // Generate markdown
  const markdown = generateMarkdown(fileName, metadata, sections, content);

  // Write to file
  const outputPath = path.join(outputDir, `${fileName}.md`);
  fs.writeFileSync(outputPath, markdown);

  console.log(`   ✓ Generated: ${fileName}.md`);
}

/**
 * @notice Extract metadata from file-level JSDoc comments
 * @param content File content
 * @returns Metadata object
 */
function extractMetadata(content: string): any {
  const metadata: any = {
    title: "",
    description: "",
    chapter: "",
    category: "",
    complexity: "",
  };

  // Extract @title
  const titleMatch = content.match(/@title\s+(.+)/);
  if (titleMatch) metadata.title = titleMatch[1].trim();

  // Extract @notice
  const noticeMatch = content.match(/@notice\s+(.+)/);
  if (noticeMatch) metadata.description = noticeMatch[1].trim();

  // Extract @chapter
  const chapterMatch = content.match(/@chapter\s+(.+)/);
  if (chapterMatch) metadata.chapter = chapterMatch[1].trim();

  // Extract @category
  const categoryMatch = content.match(/@category\s+(.+)/);
  if (categoryMatch) metadata.category = categoryMatch[1].trim();

  // Extract @complexity
  const complexityMatch = content.match(/@complexity\s+(.+)/);
  if (complexityMatch) metadata.complexity = complexityMatch[1].trim();

  return metadata;
}

/**
 * @notice Extract test sections from file
 * @param content File content
 * @returns Array of doc sections
 */
function extractTestSections(content: string): DocSection[] {
  const sections: DocSection[] = [];

  // Match describe blocks with their JSDoc comments
  const describeRegex =
    /\/\*\*\s*\n\s*\*\s*@title\s+(.+?)\s*\n\s*\*\s*@notice\s+(.+?)\s*\n(?:[\s\S]*?)\*\/\s*\n\s*describe\(/g;

  let match;
  while ((match = describeRegex.exec(content)) !== null) {
    sections.push({
      title: match[1].trim(),
      description: match[2].trim(),
      examples: [],
      concepts: [],
    });
  }

  return sections;
}

/**
 * @notice Generate markdown documentation
 * @param fileName Name of the file
 * @param metadata File metadata
 * @param sections Test sections
 * @param content Full file content
 * @returns Markdown string
 */
function generateMarkdown(
  fileName: string,
  metadata: any,
  sections: DocSection[],
  content: string
): string {
  let markdown = `# ${metadata.title || fileName}\n\n`;

  // Add metadata badges
  if (metadata.category) {
    markdown += `**Category:** ${metadata.category}  \n`;
  }
  if (metadata.chapter) {
    markdown += `**Chapter:** ${metadata.chapter}  \n`;
  }
  if (metadata.complexity) {
    markdown += `**Complexity:** ${metadata.complexity}  \n`;
  }
  markdown += `\n`;

  // Add description
  if (metadata.description) {
    markdown += `## Overview\n\n${metadata.description}\n\n`;
  }

  // Add key concepts
  const concepts = extractKeyConcepts(content);
  if (concepts.length > 0) {
    markdown += `## Key Concepts\n\n`;
    concepts.forEach((concept) => {
      markdown += `- **${concept.name}**: ${concept.description}\n`;
    });
    markdown += `\n`;
  }

  // Add sections
  if (sections.length > 0) {
    markdown += `## Test Coverage\n\n`;
    markdown += `This example includes comprehensive tests for:\n\n`;
    sections.forEach((section) => {
      markdown += `### ${section.title}\n\n`;
      markdown += `${section.description}\n\n`;
    });
  }

  // Add code examples
  const examples = extractCodeExamples(content);
  if (examples.length > 0) {
    markdown += `## Code Examples\n\n`;
    examples.forEach((example, index) => {
      markdown += `### Example ${index + 1}: ${example.title}\n\n`;
      markdown += `${example.description}\n\n`;
      markdown += `\`\`\`typescript\n${example.code}\n\`\`\`\n\n`;
    });
  }

  // Add usage instructions
  markdown += `## Usage\n\n`;
  markdown += `### Running Tests\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `# Run all tests\n`;
  markdown += `npx hardhat test\n\n`;
  markdown += `# Run specific test file\n`;
  markdown += `npx hardhat test test/${fileName}.test.ts\n\n`;
  markdown += `# Run with gas reporting\n`;
  markdown += `REPORT_GAS=true npx hardhat test\n`;
  markdown += `\`\`\`\n\n`;

  // Add related links
  markdown += `## Related Resources\n\n`;
  markdown += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  markdown += `- [Zama GitHub](https://github.com/zama-ai/fhevm)\n`;
  markdown += `- [FHEVM Examples](https://github.com/zama-ai/fhevm/tree/main/examples)\n\n`;

  return markdown;
}

/**
 * @notice Extract key concepts from JSDoc comments
 * @param content File content
 * @returns Array of concepts
 */
function extractKeyConcepts(content: string): Array<{
  name: string;
  description: string;
}> {
  const concepts: Array<{ name: string; description: string }> = [];

  // Look for @dev comments that explain concepts
  const devRegex = /@dev\s+(.+?)(?=\n\s*\*(?:\s+@|\/))/gs;
  let match;

  while ((match = devRegex.exec(content)) !== null) {
    const devText = match[1].trim();

    // Check if it lists key concepts
    if (devText.includes("demonstrates") || devText.includes("shows")) {
      const lines = devText.split("\n");
      lines.forEach((line) => {
        const trimmed = line.replace(/^\s*\*\s*/, "").trim();
        if (trimmed.startsWith("-")) {
          const conceptMatch = trimmed.match(/^-\s*(.+?):\s*(.+)/);
          if (conceptMatch) {
            concepts.push({
              name: conceptMatch[1].trim(),
              description: conceptMatch[2].trim(),
            });
          }
        }
      });
    }
  }

  // Remove duplicates
  const unique = concepts.filter(
    (concept, index, self) =>
      index === self.findIndex((c) => c.name === concept.name)
  );

  return unique.slice(0, 5); // Limit to top 5 concepts
}

/**
 * @notice Extract code examples from test file
 * @param content File content
 * @returns Array of code examples
 */
function extractCodeExamples(content: string): Array<{
  title: string;
  description: string;
  code: string;
}> {
  const examples: Array<{ title: string; description: string; code: string }> =
    [];

  // Extract examples from "it" blocks with detailed comments
  const itRegex =
    /\/\*\*\s*\n\s*\*\s*@notice\s+(.+?)\s*\n\s*\*\s*@dev\s+([\s\S]+?)\s*\*\/\s*\n\s*it\([^{]+\{([\s\S]+?)\n\s*\}\);/g;

  let match;
  while ((match = itRegex.exec(content)) !== null) {
    if (examples.length < 3) {
      // Limit to 3 examples
      const title = match[1].trim();
      const description = match[2]
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s*/, "").trim())
        .filter((line) => line && !line.startsWith("@"))
        .join(" ");

      const code = match[3].trim();

      // Only include examples with step-by-step explanations
      if (description.includes("workflow") || description.includes("step")) {
        examples.push({ title, description, code });
      }
    }
  }

  return examples;
}

/**
 * @notice Generate index/summary file
 * @param docsDir Documentation directory
 */
async function generateIndex(docsDir: string): Promise<void> {
  const files = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".md") && file !== "README.md");

  let index = `# FHEVM Examples Documentation\n\n`;
  index += `Welcome to the FHEVM examples documentation. This collection demonstrates privacy-preserving smart contracts using Zama's Fully Homomorphic Encryption.\n\n`;
  index += `## Available Examples\n\n`;

  files.forEach((file) => {
    const name = path.basename(file, ".md");
    const content = fs.readFileSync(path.join(docsDir, file), "utf-8");

    // Extract title from markdown
    const titleMatch = content.match(/^#\s+(.+)/);
    const title = titleMatch ? titleMatch[1] : name;

    // Extract category
    const categoryMatch = content.match(/\*\*Category:\*\*\s+(.+)/);
    const category = categoryMatch ? categoryMatch[1].trim() : "General";

    index += `### [${title}](${file})\n\n`;
    index += `**Category:** ${category}\n\n`;
  });

  index += `\n## Getting Started\n\n`;
  index += `1. Choose an example from the list above\n`;
  index += `2. Read through the documentation\n`;
  index += `3. Run the tests to see it in action\n`;
  index += `4. Modify and experiment with the code\n\n`;

  index += `## Resources\n\n`;
  index += `- [FHEVM Documentation](https://docs.zama.ai/fhevm)\n`;
  index += `- [Zama GitHub](https://github.com/zama-ai/fhevm)\n\n`;

  fs.writeFileSync(path.join(docsDir, "README.md"), index);
  console.log(`   ✓ Generated: docs/README.md (index)`);
}

// Run documentation generator
generateDocumentation().catch((error) => {
  console.error("❌ Error generating documentation:", error);
  process.exit(1);
});
