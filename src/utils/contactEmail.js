import { SUPPORT_EMAIL } from "../config";

const isPhone = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const openSupportEmail = async (toast) => {
  const subject = "Question for Slay With Tife";

  // Copy the address first, so customers can always paste it into any mail app
  try {
    await navigator.clipboard.writeText(SUPPORT_EMAIL);
    toast?.info(`Email address copied: ${SUPPORT_EMAIL}`);
  } catch {
    toast?.info(`Our email: ${SUPPORT_EMAIL}`);
  }

  if (isPhone()) {
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
  } else {
    window.open(
      `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${encodeURIComponent(subject)}`,
      "_blank",
      "noopener"
    );
  }
};