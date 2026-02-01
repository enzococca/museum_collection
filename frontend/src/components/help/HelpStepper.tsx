interface Step {
  title: string;
  description: string;
  tip?: string;
}

interface HelpStepperProps {
  steps: Step[];
}

export function HelpStepper({ steps }: HelpStepperProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 h-full bg-primary-100 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <h4 className="font-medium text-bronze-900">{step.title}</h4>
            <p className="text-bronze-600 text-sm mt-1">{step.description}</p>
            {step.tip && (
              <p className="text-primary-600 text-sm mt-2 italic">
                Tip: {step.tip}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
