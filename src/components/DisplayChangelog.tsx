import { useEffect, useState } from 'react';
import Link from 'next/link';
import { filterMergedPRsFromClosedPRs, generateResponse, getLatestRelease, prepareDataForLLM } from '@/lib/github';
import { ExportButton } from './';
import ReactMarkdown from 'react-markdown';
import { AiOutlineLoading3Quarters, AiOutlineCheckCircle, AiOutlineCloseCircle, AiOutlineSave } from 'react-icons/ai';
import { PullRequest } from '../lib/data-contracts';

export function DisplayChangelog({ username, repo, setStep }: { 
  username: string; 
  repo: string; 
  setStep: (step: number) => void; 
}) {
  const [changelog, setChangelog] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latestReleaseStatus, setLatestReleaseStatus] = useState<{ message: string; success: boolean | null } | null>(null);
  const [mergedPRStatus, setMergedPRStatus] = useState<{ message: string; success: boolean | null } | null>(null);
  const [changelogStatus, setChangelogStatus] = useState<{ message: string; success: boolean | null } | null>(null);
  const [changelogSaveStatus, setChangelogSaveStatus] = useState<{ message: string; success: boolean | null } | null>(null);

  const handleLatestRelease = async () => {
    setLatestReleaseStatus({ message: "Fetching latest release...", success: null });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    try {
      const latestRelease = await getLatestRelease(username, repo);
      if (!latestRelease.releaseName || !latestRelease.latestReleaseDate) {
        setLatestReleaseStatus({ message: 'No release found', success: true });
      } else {
        setLatestReleaseStatus({ message: `Found latest release: ${latestRelease.releaseName} (${new Date(latestRelease.latestReleaseDate).toDateString()})`, success: true });
      }
      return latestRelease;
    } catch(e) {
      console.log(e);
      setLatestReleaseStatus({ message: 'Internal Error occured while fetching releases.', success: false });
      throw new Error("Internal Error occured while fetching releases.");
    }
  };

  const handleMergedPR = async (latestRelease: { releaseName?: string; latestReleaseDate: string; }) => {
    try {
      if(!latestRelease.latestReleaseDate) {
        setMergedPRStatus({ message: "Fetching all merged PRs...", success: null });  
      } else {
        setMergedPRStatus({ message: `Fetching merged PRs after the latest release... ${new Date(latestRelease.latestReleaseDate).toDateString()}`, success: null });
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mergedPRs = await filterMergedPRsFromClosedPRs(username, repo, latestRelease.latestReleaseDate);
      if (mergedPRs.length === 0) {
        throw new Error("No merged PRs after the latest release. No changelog can be generated.");
      }
      setMergedPRStatus({ message: `Found ${mergedPRs.length} merged PRs.`, success: true });
      return mergedPRs;
    } catch(e) {
      console.log(e);
      setMergedPRStatus({ message: `Internal error occured while fetching PR's.`, success: false });
      throw new Error("Internal error occured while fetching PR's.");
    }
  };

  const handleChangelog = async (mergedPRs: PullRequest[]) => {
    setChangelogStatus( { message: "Generating changelog...", success: null });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    try {
      const prompt = await prepareDataForLLM(mergedPRs, username, repo);
      const changelog = await generateResponse(prompt);
      setChangelog(changelog);
      setChangelogStatus({ message: "Changelog generated successfully.", success: true });
    } catch(e) {
      console.log(e);
      setChangelogStatus({ message: 'Error generating changelog.', success: false});
      throw new Error('Error generating changelog.');
    }
  };

  const handleSaveChangelog = async () => {
    try {
      setChangelogSaveStatus({ message: 'Saving Changelog for public access!', success: null });
      const response = await fetch('/api/save-changelog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, repo, changelog }),
      });

      if (!response.ok) {
        throw new Error('Error saving changelog.');
      }

      const data = await response.json();
      setChangelogSaveStatus({ message: data.message, success: true });
    } catch (e) {
      console.log(e);
      setChangelogSaveStatus({ message: 'Error saving changelog.', success: false });
    }
  };

  useEffect(() => {
    async function generateChangeLog() {
      try {
        const latestRelease = await handleLatestRelease();
        const mergedPRs = await handleMergedPR(latestRelease);   
        await handleChangelog(mergedPRs); 
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
        setStep(4);
      }
    }

    generateChangeLog();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, username]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Changelog for {repo}</h1>

      {/* Latest Release Status Messages */}
      {latestReleaseStatus && latestReleaseStatus.success !== false && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            {latestReleaseStatus.success === null && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />}
            {latestReleaseStatus.success === true && <AiOutlineCheckCircle className="text-green-500" />}
            <span>{latestReleaseStatus.message}</span>
          </div>
        </div>
      )}

      {/* Merged PR's Status Messages */}
      {mergedPRStatus && mergedPRStatus.success !== false && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            {mergedPRStatus.success === null && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />}
            {mergedPRStatus.success === true && <AiOutlineCheckCircle className="text-green-500" />}
            <span>{mergedPRStatus.message}</span>
          </div>
        </div>
      )}

      {/* Changelog Status Messages */}
      {changelogStatus && changelogStatus.success !== false && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            {changelogStatus.success === null && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />}
            {changelogStatus.success === true && <AiOutlineCheckCircle className="text-green-500" />}
            <span>{changelogStatus.message}</span>
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
      {!error && !loading && changelog && (
        <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[500px]">
          <ReactMarkdown className="prose">{changelog}</ReactMarkdown>
        </div>
      )}

      {/* Changelog Save Status Messages */}
      {changelogSaveStatus && changelogSaveStatus.success !== false && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            {changelogSaveStatus.success === null && <AiOutlineLoading3Quarters className="animate-spin text-blue-500" />}
            {changelogSaveStatus.success === true && (
              <>
                <AiOutlineCheckCircle className="text-green-500" />
                <Link href={`/view-changelog?username=${username}&repo=${repo}`} legacyBehavior>
                  <a className="text-blue-500 hover:underline">View Changelog</a>
                </Link>
            </>)}
            <span>{changelogSaveStatus.message}</span>
          </div>
        </div>
      )}

      {/* Save Button Only If Changelog is Set */}
      {!error && changelog && (
        <div className="mt-4">
          <button 
            onClick={handleSaveChangelog}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          >
            <AiOutlineSave className="mr-2" />
            Save Changelog
          </button>
        </div>
      )}

      {/* Export Button Only If No Errors */}
      {!error && changelog && <ExportButton changelog={changelog} />}
    </div>
  );
}
