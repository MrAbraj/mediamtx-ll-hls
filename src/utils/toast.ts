import { toaster } from "@/components/ui/toaster";

export const showError = (title: string, description: string) =>
  toaster.create({
    title,
    description,
    type: "error",
    closable: true,
  });

export const showSuccess = (title: string, description: string) =>
  toaster.create({
    title,
    description,
    type: "success",
  });
