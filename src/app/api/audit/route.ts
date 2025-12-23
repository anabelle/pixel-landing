import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public/audit.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const logs = [];
      const bracketIndex = content.indexOf(']{');
      if (bracketIndex !== -1) {
        const arrayPart = content.slice(0, bracketIndex + 1);
        const linesPart = content.slice(bracketIndex + 1);
        try {
          const arrayLogs = JSON.parse(arrayPart);
          if (Array.isArray(arrayLogs)) logs.push(...arrayLogs);
        } catch (e) {
          console.error('Failed to parse array part:', e);
        }
        const lines = linesPart.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('{')) {
            try {
              logs.push(JSON.parse(line));
            } catch (e) {
              console.error('Failed to parse line:', line, e);
            }
          }
        }
      } else {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) logs.push(...parsed);
        } catch (e) {
          console.error('Failed to parse whole file:', e);
        }
      }
      return NextResponse.json(logs);
    } catch {
      return NextResponse.json([]);
    }
  } catch {
    return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 });
  }
}
