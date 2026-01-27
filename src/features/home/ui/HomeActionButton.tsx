interface HomeActionButtonProps {
  buttonText: string;
  onClick: () => void;
}

export function HomeActionButton({ buttonText, onClick }: HomeActionButtonProps) {
  return (
    <button
      type="button"
      className="my-2 inline-flex items-end justify-center rounded-[90px] border border-[color:var(--color-primary-700)] px-[19px] py-1.5 text-base font-semibold text-[color:var(--color-primary-700)]"
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
}
