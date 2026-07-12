export const getBoolean = (value: string | null, fallback: boolean) => {
  if (!value) return fallback;

  switch (value.toLowerCase()) {
    case "1":
    case "true":
    case "yes":
      return true;

    case "0":
    case "false":
    case "no":
      return false;

    default:
      return fallback;
  }
};
