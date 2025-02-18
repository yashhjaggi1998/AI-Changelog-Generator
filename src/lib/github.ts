import { getClosedPRs, getPRCommits, preparePrompt } from './utils';
import { OpenAI } from 'openai';
import { PullRequest, PRData } from './data-contracts';

export const generateResponse = async(prompt: string) =>  {
    const APIKEY = process.env.NEXT_PUBLIC_OPENAI_KEY;

    const client = new OpenAI({
        apiKey: APIKEY,
        dangerouslyAllowBrowser: true,
    });
  
    try {
        const openaiResponse = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
            role: 'user',
            content: prompt
            }
        ]
        });

        console.log(openaiResponse);

        return openaiResponse.choices[0].message.content as string;
    } catch (error) {
        console.error('Error generating response:', error);
        return 'Failed to fetch response from OpenAI';
    }
}

export const prepareDataForLLM = async(mergedPRs: PullRequest[], username: string, selectedRepoName: string) => {
    const data: { PRs: PRData[] } = { PRs: [] };
    for (const mergedPr of mergedPRs) {
        const prNumber = mergedPr.number;
        const prCommits = await getPRCommits(username, selectedRepoName, prNumber);
        const commitMessages = prCommits.map((commit: { commit: { message: string; }; }) => commit.commit.message);
      
      data.PRs.push({
        title: mergedPr.title,
        pr_number: prNumber,
        pr_description: mergedPr.body,
        pr_merge_date: mergedPr.merged_at,
        code_diff_url: mergedPr.diff_url,
        commits: commitMessages
      });
    }
    return preparePrompt(data);
  }

export const filterMergedPRsFromClosedPRs = async(username:string, selectedRepoName: string, latestReleaseDate: string) => {
    const closedPRs = await getClosedPRs(username, selectedRepoName);
    if(closedPRs.length == 0) {
        return [];
    }
    
    const mergedPRs = closedPRs.filter((pr: PullRequest) => pr.merged_at && new Date(pr.merged_at) > new Date(latestReleaseDate!));
    return mergedPRs;
}

export const getLatestRelease = async (username: string, selectedRepoName: string) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_GH_URL}/repos/${username}/${selectedRepoName}/releases`;
    const _HEADERS: HeadersInit = {};
    if (process.env.NEXT_PUBLIC_GH_PAT) {
        _HEADERS['Authorization'] = `token ${process.env.NEXT_PUBLIC_GH_PAT}`;
    }

    const response = await fetch(url, { headers: _HEADERS });
    if (response.ok) {
        const releases = await response.json();
        if (releases.length > 0 && releases[0].published_at) {
            const latestRelease = releases[0];
            const latestReleaseDate = latestRelease.published_at;
            return {
                releaseName: latestRelease.name,
                latestReleaseDate,
            }
        }
    }
    return {
        releaseName: null,
        latestReleaseDate: null,
    }
}

export const getRepos = async (username: string) => {
    await new Promise(resolve => setTimeout(resolve, 4000));

    const url = `${process.env.NEXT_PUBLIC_BASE_GH_URL}/users/${username}/repos`;
    const _HEADERS: HeadersInit = {};
    if (process.env.NEXT_PUBLIC_GH_PAT) {
        _HEADERS['Authorization'] = `token ${process.env.NEXT_PUBLIC_GH_PAT}`;
    }

    const response = await fetch(url, { headers: _HEADERS });
    if (response.ok) {
        const repos = await response.json();
        return repos.map((repo: { name: string; }) => repo.name);
    } else {
        throw new Error("Error occured fetching repositories.");
    }
}