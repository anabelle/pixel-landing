import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public/audit.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const logs = [];
      const lines = content.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          // Handle cases where a line might start with [ (array) or { (object)
          if (line.startsWith('[')) {
            const arrayPart = JSON.parse(line);
            if (Array.isArray(arrayPart)) logs.push(...arrayPart);
          } else if (line.startsWith('{')) {
            logs.push(JSON.parse(line));
          }
        } catch (e) {
          // If a single line fails, try to find JSON objects within it or skip
          console.error('Failed to parse line:', line.substring(0, 100), e);
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
