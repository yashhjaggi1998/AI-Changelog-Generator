import { FaCheckCircle } from 'react-icons/fa';
import { TfiNa } from "react-icons/tfi";

const steps = ['Enter Username', 'Select Repository', 'View Changelog'];

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex justify-center space-x-6 mb-6">
      {steps.map((step, index) => {
        let status = 'pending';
        if (index < currentStep) status = 'complete';
        if (index === currentStep) status = 'in-progress';

        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white 
                ${status === 'complete' ? 'bg-green-500' : status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              {status === 'complete' ? <FaCheckCircle /> : status === 'in-progress' ? <TfiNa /> : index + 1}
            </div>
            <p className={`mt-2 text-sm ${status === 'complete' ? 'text-green-500' : status === 'in-progress' ? 'text-blue-500' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}
