import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Username required' }, { status: 400 });

  const response = await fetch(`https://api.github.com/users/${username}/repos`);
  const data = await response.json();
  const repos = data.map((repo: any) => repo.name);
  return NextResponse.json(repos);
}
