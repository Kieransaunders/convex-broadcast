import { components } from "./_generated/api";
import { Resend } from "@convex-dev/resend";

export const resend = new Resend(components.resend, { testMode: false });
