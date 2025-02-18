// src/app/api/save-changelog/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  const { username, repo, changelog } = await req.json();

  try {
    // Define the path to save the changelog in the public/changelogs folder
    const changelogDir = path.join(process.cwd(), 'public', 'changelogs');
    
    // Ensure the changelog directory exists
    if (!fs.existsSync(changelogDir)) {
      fs.mkdirSync(changelogDir, { recursive: true });
    }

    // Define the file path
    const filePath = path.join(changelogDir, `${username}_${repo}_changelog.md`);

    // Save the changelog to the file
    fs.writeFileSync(filePath, changelog);

    return NextResponse.json({ message: 'Changelog saved successfully!', filePath });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error saving changelog.' }, { status: 500 });
  }
}
