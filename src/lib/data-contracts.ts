export type PRData = {
    title: string;
    pr_number: number;
    pr_description: string;
    pr_merge_date: string | null;
    code_diff_url: string;
    commits: string[];
};

export type ChangelogData = { 
    PRs: PRData[] 
};

export type PullRequest = { merged_at: string | null; number: number; title: string; body: string; diff_url: string };
