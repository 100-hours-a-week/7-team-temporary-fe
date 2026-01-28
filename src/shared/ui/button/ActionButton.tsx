interface ActionButtonProps {
  buttonText: string;
  onClick: () => void;
}

export function ActionButton({ buttonText, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="my-[5px] inline-flex items-end justify-center rounded-[90px] border border-[color:var(--color-primary-700)] px-[19px] py-0 text-base font-semibold text-[color:var(--color-primary-700)]"
      onClick={onClick}
    >
      {buttonText}
    </button>
  );
}
