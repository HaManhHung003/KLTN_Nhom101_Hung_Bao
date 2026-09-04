import { Check } from 'lucide-react'
import { WIZARD_STEPS } from '@/types/listingWizard'

interface PropertyWizardProgressProps {
  currentStep: number
}

export function PropertyWizardProgress({ currentStep }: PropertyWizardProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        {WIZARD_STEPS.map((step) => (
          <div
            key={step.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              currentStep >= step.id ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <div className="hidden justify-between sm:flex">
        {WIZARD_STEPS.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-1.5 text-xs font-medium ${
              currentStep === step.id
                ? 'text-emerald-700'
                : currentStep > step.id
                  ? 'text-emerald-600'
                  : 'text-slate-400'
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                currentStep > step.id
                  ? 'bg-emerald-600 text-white'
                  : currentStep === step.id
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-600'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
            </span>
            {step.label}
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-500 sm:hidden">
        Step {currentStep} of {WIZARD_STEPS.length}: {WIZARD_STEPS[currentStep - 1].label}
      </p>
    </div>
  )
}
