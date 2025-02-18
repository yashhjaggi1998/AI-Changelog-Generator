import { useEffect, useState } from 'react';
import { filterMergedPRsFromClosedPRs, generateResponse, getLatestRelease, prepareDataForLLM } from '@/lib/github';
import { ExportButton } from './';
import ReactMarkdown from 'react-markdown';
import { AiOutlineLoading3Quarters, AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
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

      {/* Export Button Only If No Errors */}
      {!error && changelog && <ExportButton changelog={changelog} />}
    </div>
  );
}
