import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const repo = searchParams.get('repo');

  console.log(username);
  console.log(repo);
  
  /*
  if (!username || !repo) return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });

  const response = await fetch(`https://api.github.com/repos/${username}/${repo}/pulls?state=closed`);
  const data = await response.json();
  
  let changelog = `# Changelog for ${repo}\n\n`;
  data.forEach((pr: any) => {
    changelog += `- [#${pr.number}] ${pr.title}\n`;
  });

  return NextResponse.json(changelog);
  */
}
