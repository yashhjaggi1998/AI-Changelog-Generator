'use client';

import { useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { RepoSelector, DisplayChangelog, Stepper } from '@/components';

export default function Home() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<string>("");

  const handleNext = () => {
    if (step === 2 && !selectedRepo) return;
    setStep((prev) => prev + 1);
  };
  const handleBack = () => setStep((prev) => prev - 1);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6"> {/* justify-center */}
      <h1 className="text-2xl font-bold mb-6">Changelog Generator</h1>

      {/* Stepper Navigation */}
      <Stepper currentStep={step - 1} />

      {/* Main Container */}
      <div className="w-full max-w-4xl flex rounded-lg shadow-lg bg-white gap-6 p-6">

        {/* Left Section (User Input) */}
        <div className={`${step >= 3 ? 'w-full' : 'w-2/3'}`}>
          {step === 1 && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username.."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded p-3"
              />
            </div>
          )}

          {step === 2 && (
            <RepoSelector 
              username = {username} 
              onSelectRepo = {(repo)=> {
                setSelectedRepo(repo);
              }} 
            />
          )}

          {step >= 3 && <DisplayChangelog username={username} repo={selectedRepo} setStep={setStep}/>}
        </div>

        {/* Right Section (Navigation Buttons) */}
        { step < 3 && (<div className="flex flex-col justify-between items-center space-y-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className={`w-40 h-12 flex items-center justify-center space-x-2 rounded-md transition ${step === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-600 hover:bg-gray-700 text-white'}`}
              disabled={step === 1}
            >
              <IoIosArrowBack />
              <span>Previous</span>
            </button>
          )}

          {step === 1 && (
            <button
              onClick={handleNext}
              className={`w-40 h-12 flex items-center justify-center space-x-2 rounded-md transition ${(!username && step === 1) ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-500 text-white'}`}
              disabled={step === 1 && !username}
            >
              <span>Next</span>
              <IoIosArrowForward/>
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleNext}
              className={`w-40 h-12 flex items-center justify-center space-x-2 rounded-md transition ${(!selectedRepo && step === 2) ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-500 text-white'}`}
              disabled={step === 2 && !selectedRepo}
            >
              <span>Next</span>
              <IoIosArrowForward/>
            </button>
          )}
        </div>)}
      </div>
    </div>
  );
}
