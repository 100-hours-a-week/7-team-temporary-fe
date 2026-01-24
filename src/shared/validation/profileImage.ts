export const normalizeProfileImageKey = (value?: string | null) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export const isProfileImageKeyValid = (value?: string | null) => {
  if (value === undefined || value === null) return true;
  return value.trim().length > 0;
};
