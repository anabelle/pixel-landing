import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public/syntropy.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: 'Failed to load syntropy data' }, { status: 500 });
  }
}
