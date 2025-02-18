import { MdDownload } from "react-icons/md";

export function ExportButton({ changelog }: { changelog: string }) {
  const handleExport = () => {
    const blob = new Blob([changelog], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'CHANGELOG.md';
    link.click();
  };

  return (
    <button
      onClick={handleExport}
      className="mt-4 px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 flex items-center space-x-2"
    >
      <MdDownload className="text-white" />
      <span>Export as Markdown</span>
    </button>
  );
}
  