import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const username = searchParams.get('username');
  const repo = searchParams.get('repo');


  if (!username || !repo) {
    return NextResponse.json(
      { error: 'Missing username or repository name.' },
      { status: 400 }
    );
  }

  try {
    const changelogPath = path.resolve('public', 'changelogs', `${username}_${repo}_changelog.md`);
    const changelog = fs.readFileSync(changelogPath, 'utf-8');
    return NextResponse.json({ changelog });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to retrieve changelog or file not found.' },
      { status: 500 }
    );
  }
}
