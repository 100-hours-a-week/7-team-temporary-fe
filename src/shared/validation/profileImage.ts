export const normalizeProfileImageKey = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const isProfileImageKeyValid = (value?: string) => {
  if (!value) return true;
  return value.trim().length > 0;
};
