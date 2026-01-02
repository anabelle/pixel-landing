import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auditPath = path.resolve(process.cwd(), 'public/audit.json');
    const memoriesPath = path.resolve(process.cwd(), 'public/agent_memories.json');

    const readAndParse = async (filePath: string) => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const logs: any[] = [];
        const lines = content.split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            if (line.startsWith('[')) {
              const arrayPart = JSON.parse(line);
              if (Array.isArray(arrayPart)) logs.push(...arrayPart);
            } else if (line.startsWith('{')) {
              logs.push(JSON.parse(line));
            }
          } catch (e) {
            // console.error('Failed to parse line:', line.substring(0, 50), e);
          }
        }
        return logs;
      } catch {
        return [];
      }
    };

    const [auditLogs, agentMemories] = await Promise.all([
      readAndParse(auditPath),
      readAndParse(memoriesPath)
    ]);

    // Sort combined logs by timestamp descending
    const combined = [...auditLogs, ...agentMemories].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(combined);
  } catch {
    return NextResponse.json({ error: 'Failed to load audit log' }, { status: 500 });
  }
}
