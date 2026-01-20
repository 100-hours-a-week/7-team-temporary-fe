interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

export function EmailInput({ value, onChange, isDisabled }: EmailInputProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm">
      이메일
      <input
        className="w-full rounded-md border px-3 py-2"
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="email@email.com"
        type="email"
        value={value}
      />
    </label>
  );
}
