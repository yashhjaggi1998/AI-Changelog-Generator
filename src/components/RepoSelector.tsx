'use client';

import { useState, useEffect } from 'react';
import { getRepos } from '@/lib/github';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { AiOutlineExclamationCircle } from 'react-icons/ai'; // Error icon

export function RepoSelector({ username, onSelectRepo }: { username: string; onSelectRepo: (repo: string) => void }) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // New error state

  useEffect(() => {
    async function fetchRepos() {
      setLoading(true);
      setError(null); // Reset error on each fetch

      try {
        console.log(username);
        const repos = await getRepos(username);

        if (repos.length === 0) {
          throw new Error('No repositories found'); // Throw error if no repos
        }

        setRepos(repos);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, [username]);

  return (
    <div className="w-full max-w-md">
      {loading && !error ? (
        <div className="flex items-center space-x-2 text-lg">
          <AiOutlineLoading3Quarters className="animate-spin" />
          <span>Loading repositories...</span>
        </div>
      ) : error ? (
        <div className="flex items-center space-x-2 text-lg bg-red-100 text-red-700 p-3 rounded-md">
          <AiOutlineExclamationCircle />
          <span>{error}</span>
        </div>
      ) : (
        <>
          <select
            defaultValue=""
            onChange={(e) => {
              onSelectRepo(e.target.value);
            }}
            className="p-2 border rounded w-full"
          >
            <option value="" disabled>Select a repository</option>
            {repos.map((repo) => (
              <option key={repo} value={repo}>
                {repo}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
