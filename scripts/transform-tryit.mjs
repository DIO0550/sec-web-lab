#!/usr/bin/env node
// 既存ラボドキュメントから tryit ページを分離するスクリプト
// Usage: node scripts/transform-tryit.mjs <step-dir> <lab1,lab2,...> [--no-lab-heading=lab1,lab2]

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename } from 'path';

const DOCS_DIR = '/workspace/docs-site/docs';

const args = process.argv.slice(2);
const stepDir = args[0]; // e.g. "step01-recon"
const labNames = args[1].split(','); // e.g. "header-leakage,sensitive-file-exposure"
const noLabHeadingArg = args.find(a => a.startsWith('--no-lab-heading='));
const noLabHeadingLabs = noLabHeadingArg ? noLabHeadingArg.split('=')[1].split(',') : [];

const stepPath = join(DOCS_DIR, stepDir);

for (let i = 0; i < labNames.length; i++) {
  const labName = labNames[i];
  const hasLabHeading = !noLabHeadingLabs.includes(labName);
  const labFile = join(stepPath, `${labName}.mdx`);
  const quizFile = join(stepPath, `${labName}-quiz.mdx`);
  const tryitFile = join(stepPath, `${labName}-tryit.mdx`);

  if (!existsSync(labFile)) {
    console.error(`ERROR: ${labFile} not found`);
    process.exit(1);
  }

  let content = readFileSync(labFile, 'utf-8');

  // 1. Extract import line
  const importMatch = content.match(/^import\s*\{[^}]+\}\s*from\s*'@site\/src\/components\/labs\/[^']+';?\s*$/m);
  if (!importMatch) {
    console.error(`ERROR: No lab import found in ${labFile}`);
    process.exit(1);
  }
  const importLine = importMatch[0];

  // Extract component name from import
  const componentMatch = importLine.match(/import\s*\{\s*(\w+)\s*\}/);
  const componentName = componentMatch[1];

  // Extract the import path
  const importPathMatch = importLine.match(/from\s*'([^']+)'/);
  const importPath = importPathMatch[1];

  // 2. Extract frontmatter title
  const titleMatch = content.match(/^title:\s*(.+)$/m);
  let titleValue = titleMatch[1].trim();
  // Remove surrounding quotes if present
  const isQuoted = (titleValue.startsWith('"') && titleValue.endsWith('"')) ||
                   (titleValue.startsWith("'") && titleValue.endsWith("'"));
  const quoteChar = isQuoted ? titleValue[0] : null;
  const bareTitle = isQuoted ? titleValue.slice(1, -1) : titleValue;

  // 3. Extract H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  const h1Value = h1Match ? h1Match[1].trim() : bareTitle;

  // 4. Extract ## ハンズオン手順 section
  const handsOnRegex = /^## ハンズオン手順\n([\s\S]*?)(?=\n## |\n---\s*$)/m;
  const handsOnMatch = content.match(handsOnRegex);

  // Try more flexible extraction if simple regex fails
  let handsOnContent = '';
  if (handsOnMatch) {
    handsOnContent = handsOnMatch[0];
  } else {
    // Find ## ハンズオン手順 and extract until next ## or end
    const lines = content.split('\n');
    let startIdx = -1;
    let endIdx = lines.length;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].startsWith('## ハンズオン手順')) {
        startIdx = j;
      } else if (startIdx >= 0 && j > startIdx && lines[j].match(/^## /)) {
        endIdx = j;
        break;
      }
    }
    if (startIdx >= 0) {
      // Include trailing --- if present
      handsOnContent = lines.slice(startIdx, endIdx).join('\n');
    }
  }

  // 5. Extract <XxxLab /> component
  // Handled differently for "有り" vs "無し"

  // 6. Remove sections from original document
  const lines = content.split('\n');
  const newLines = [];
  let skipSection = null; // 'handson' | 'labexp' | null
  let removedImport = false;
  let removedLabComponent = false;
  let addedTryitLink = false;

  for (let j = 0; j < lines.length; j++) {
    const line = lines[j];

    // Skip import line
    if (!removedImport && line.trim() === importLine.trim()) {
      removedImport = true;
      // Also skip the blank line after import if present
      if (j + 1 < lines.length && lines[j + 1].trim() === '') {
        j++;
      }
      continue;
    }

    // Skip ## ハンズオン手順 section
    if (line.startsWith('## ハンズオン手順')) {
      skipSection = 'handson';
      continue;
    }

    // Skip ## ラボ体験 section (有り case)
    if (hasLabHeading && line.startsWith('## ラボ体験')) {
      skipSection = 'labexp';
      continue;
    }

    // When skipping, check for next section
    if (skipSection) {
      if (line.match(/^## /) && !line.startsWith('## ハンズオン手順') && !line.startsWith('## ラボ体験')) {
        skipSection = null;
        // Fall through to process this line
      } else if (line === '---' && skipSection === 'handson') {
        // Check if next non-empty line is a section header
        let nextContentIdx = j + 1;
        while (nextContentIdx < lines.length && lines[nextContentIdx].trim() === '') nextContentIdx++;
        if (nextContentIdx < lines.length && lines[nextContentIdx].match(/^## /)) {
          skipSection = null;
          continue; // Skip the ---
        }
        // Also stop skipping at --- followed by nothing or end of file
        if (nextContentIdx >= lines.length) {
          skipSection = null;
          continue;
        }
        continue;
      } else if (line === '---' && skipSection === 'labexp') {
        skipSection = null;
        continue; // Skip the ---
      } else {
        continue;
      }
    }

    // Skip bare <XxxLab /> (無し case)
    if (!hasLabHeading && !removedLabComponent && line.trim() === `<${componentName} />`) {
      removedLabComponent = true;
      // Also remove surrounding blank lines / ---
      // Check if previous line in newLines is blank or ---
      while (newLines.length > 0 && (newLines[newLines.length - 1].trim() === '' || newLines[newLines.length - 1].trim() === '---')) {
        // Only remove blank lines, keep --- as section separators unless immediately before component
        if (newLines[newLines.length - 1].trim() === '') {
          newLines.pop();
        } else {
          break;
        }
      }
      // Skip following blank line if present
      if (j + 1 < lines.length && lines[j + 1].trim() === '') {
        j++;
      }
      continue;
    }

    // Add ## 実際に試す section before ## 理解度テスト
    if (!addedTryitLink && line.startsWith('## 理解度テスト')) {
      newLines.push(`## 実際に試す`);
      newLines.push('');
      newLines.push('このラボの攻撃と防御を実際に体験できます。');
      newLines.push('');
      newLines.push(`[→ 実際に試す](./${labName}-tryit)`);
      newLines.push('');
      newLines.push('---');
      newLines.push('');
      addedTryitLink = true;
    }

    newLines.push(line);
  }

  // Write modified lab file
  let newContent = newLines.join('\n');
  // Clean up multiple consecutive blank lines (max 1)
  newContent = newContent.replace(/\n{3,}/g, '\n\n');
  // Remove trailing --- before EOF if orphaned
  newContent = newContent.replace(/\n---\s*\n*$/, '\n');
  writeFileSync(labFile, newContent);
  console.log(`Updated: ${labFile}`);

  // 7. Create tryit page
  const tryitTitle = isQuoted ? `${quoteChar}${bareTitle} - 実際に試す${quoteChar}` : `${bareTitle} - 実際に試す`;
  const tryitH1 = `${h1Value} - 実際に試す`;
  const labPosition = parseInt(content.match(/sidebar_position:\s*(\d+)/)[1]);
  // Position will be set by renumbering later; use placeholder
  const tryitPosition = '__TRYIT_POS__'; // placeholder

  let tryitContent = `---
title: ${tryitTitle}
sidebar_position: ${tryitPosition}
---

${importLine}

# ${tryitH1}

## ラボ体験

以下の埋め込みラボUIで、脆弱バージョンと安全バージョンを切り替えて試すことができます。

<${componentName} />

---

${handsOnContent}

---

[← ラボに戻る](./${labName})
`;

  // Clean up multiple consecutive blank lines
  tryitContent = tryitContent.replace(/\n{3,}/g, '\n\n');
  writeFileSync(tryitFile, tryitContent);
  console.log(`Created: ${tryitFile}`);

  // 8. Update sidebar positions (renumbering: lab=3k-2, tryit=3k-1, quiz=3k)
  const labPos = (i + 1) * 3 - 2;
  const tryitPos = (i + 1) * 3 - 1;
  const quizPos = (i + 1) * 3;

  // Update lab file position
  let labContent2 = readFileSync(labFile, 'utf-8');
  labContent2 = labContent2.replace(/sidebar_position:\s*\d+/, `sidebar_position: ${labPos}`);
  writeFileSync(labFile, labContent2);

  // Update tryit file position
  let tryitContent2 = readFileSync(tryitFile, 'utf-8');
  tryitContent2 = tryitContent2.replace(/sidebar_position:\s*__TRYIT_POS__/, `sidebar_position: ${tryitPos}`);
  writeFileSync(tryitFile, tryitContent2);

  // Update quiz file position
  if (existsSync(quizFile)) {
    let quizContent = readFileSync(quizFile, 'utf-8');
    quizContent = quizContent.replace(/sidebar_position:\s*\d+/, `sidebar_position: ${quizPos}`);
    writeFileSync(quizFile, quizContent);
    console.log(`Updated quiz: ${quizFile}`);
  }

  console.log(`  Positions: lab=${labPos}, tryit=${tryitPos}, quiz=${quizPos}`);
}

console.log('\nDone!');
