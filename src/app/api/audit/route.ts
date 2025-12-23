import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public/audit.json');
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json(JSON.parse(content));
    } catch (e) {
      return NextResponse.json([]);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 });
  }
}
