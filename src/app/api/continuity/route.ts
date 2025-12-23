import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Correct absolute path to CONTINUITY.md in syntropy-core
    const filePath = '/home/pixel/pixel/syntropy-core/CONTINUITY.md';
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return NextResponse.json({ content });
    } catch (e) {
      return NextResponse.json({ error: 'Continuity Ledger not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load continuity ledger' }, { status: 500 });
  }
}
