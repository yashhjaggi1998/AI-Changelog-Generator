"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams from 'next/navigation'
import ReactMarkdown from 'react-markdown';
import { AiOutlineLoading3Quarters, AiOutlineCloseCircle } from 'react-icons/ai';

export default function ViewChangelog() {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const repo = searchParams.get('repo');
  
  const [changelog, setChangelog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      if (!username || !repo) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/get-changelog?username=${username}&repo=${repo}`);
        const data = await response.json();

        if (response.ok) {
          setChangelog(data.changelog);
        } else {
          setError(data.error);
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError('An error occurred while fetching the changelog.');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [username, repo]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Changelog for the latest release of repository {`"${repo}`}</h1>

      {loading && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Show Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md flex items-center space-x-2">
          <AiOutlineCloseCircle className="text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Show Changelog Only If No Errors */}
      {changelog && !error && (
        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
          <ReactMarkdown className="prose">{changelog}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
