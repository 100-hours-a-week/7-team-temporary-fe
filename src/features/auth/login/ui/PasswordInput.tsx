interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

export function PasswordInput({ value, onChange, isDisabled }: PasswordInputProps) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm">
      비밀번호
      <input
        className="w-full rounded-md border px-3 py-2"
        disabled={isDisabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="password"
        type="password"
        value={value}
      />
    </label>
  );
}
