import { ChangelogData, PRData } from './data-contracts';

export const formatPR = (pr: PRData): string => {
    return `
        - **PR Title**: ${pr.title}
            - **PR Description**: ${pr.pr_description}
            - **Commits**:
        ${pr.commits.join('; ')}
    `;
}

export const preparePrompt = (data: ChangelogData): string => {
    const prDetails = data.PRs.map(formatPR).join('\n');

    const prompt = `
        You are given below the list of PRs, each with their description and corresponding list of commit history. Each commit is separated by a semicolon.
        Summarize the below PRs into a changelog format for a new release with output structure as a heading followed by bullet points explaining the changes.
        PRs:
        ${prDetails}
    `;
    return prompt;
}
  
export const getClosedPRs = async (username:string, selectedRepoName: string) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_GH_URL}/repos/${username}/${selectedRepoName}/pulls?state=closed&per_page=100&page=1`;
    const _HEADERS: HeadersInit = {};
    if (process.env.NEXT_PUBLIC_GH_PAT) {
        _HEADERS['Authorization'] = `token ${process.env.NEXT_PUBLIC_GH_PAT}`;
    }

    const response = await fetch(url, { headers: _HEADERS });
    if (response.ok) {
      const allClosedPRs = await response.json();
      return allClosedPRs;
    } 
    return [];
}

export const getPRCommits = async (username: string, selectedRepoName: string, prNumber: number) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_GH_URL}/${username}/${selectedRepoName}/pulls/${prNumber}/commits`;
    const _HEADERS: HeadersInit = {};
    if (process.env.NEXT_PUBLIC_GH_PAT) {
        _HEADERS['Authorization'] = `token ${process.env.NEXT_PUBLIC_GH_PAT}`;
    }

    let prCommits = [];
    const response = await fetch(url, { headers: _HEADERS });
    if (response.ok) {
        prCommits = await response.json();
    }
    return prCommits;
}