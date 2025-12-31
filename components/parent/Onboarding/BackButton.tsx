// components/parent/Onboarding/BackButton.tsx
interface BackButtonProps {
  onBack: () => void;
  disabled?: boolean;
}

export default function BackButton({ onBack, disabled }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      disabled={disabled}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
    >
      ← Back
    </button>
  );
}
