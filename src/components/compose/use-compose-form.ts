import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const composeSchema = z
  .object({
    // Step 1: Content
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must be 200 characters or less"),
    body: z
      .string()
      .min(1, "Message body is required")
      .max(5000, "Message must be 5000 characters or less"),
    category: z.enum(["notice", "reminder", "event_update", "urgent"]),
    // Step 2: Audience
    audienceType: z.enum(["all", "groups", "event"]),
    selectedGroupIds: z.array(z.string()),
    selectedEventId: z.string(),
    // Step 3: Delivery
    deliveryMode: z.enum(["now", "schedule"]),
    scheduledDate: z.date().optional(),
    scheduledTime: z.string().optional(),
    pushEnabled: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.audienceType === "groups" && data.selectedGroupIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select at least one group",
        path: ["selectedGroupIds"],
      });
    }
    if (data.audienceType === "event" && !data.selectedEventId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an event",
        path: ["selectedEventId"],
      });
    }
    if (data.deliveryMode === "schedule") {
      if (!data.scheduledDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a date",
          path: ["scheduledDate"],
        });
      }
      if (!data.scheduledTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a time",
          path: ["scheduledTime"],
        });
      }
      if (data.scheduledDate && data.scheduledTime) {
        const [hours, minutes] = data.scheduledTime.split(":").map(Number);
        const scheduled = new Date(data.scheduledDate);
        scheduled.setHours(hours, minutes, 0, 0);
        const minTime = Date.now() + 5 * 60 * 1000;
        if (scheduled.getTime() < minTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Scheduled time must be at least 5 minutes in the future",
            path: ["scheduledTime"],
          });
        }
      }
    }
  });

export type ComposeFormValues = z.infer<typeof composeSchema>;

const STEP_FIELDS: Partial<Record<number, Array<keyof ComposeFormValues>>> = {
  0: ["title", "body", "category"],
  1: ["audienceType", "selectedGroupIds", "selectedEventId"],
  2: ["deliveryMode", "scheduledDate", "scheduledTime", "pushEnabled"],
};

export function useComposeForm() {
  const form = useForm<ComposeFormValues>({
    resolver: zodResolver(composeSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      body: "",
      category: "notice",
      audienceType: "all",
      selectedGroupIds: [],
      selectedEventId: "",
      deliveryMode: "now",
      scheduledDate: undefined,
      scheduledTime: "",
      pushEnabled: false,
    },
  });

  const validateStep = async (stepIndex: number): Promise<boolean> => {
    const fields = STEP_FIELDS[stepIndex];
    if (!fields) return true;
    const result = await form.trigger(fields);
    return result;
  };

  const toScheduledTimestamp = (values: ComposeFormValues): number => {
    if (!values.scheduledDate || !values.scheduledTime)
      throw new Error("Missing schedule info");
    const [hours, minutes] = values.scheduledTime.split(":").map(Number);
    const date = new Date(values.scheduledDate);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const toCreatePayload = (values: ComposeFormValues) => {
    let targetIds: string[] | undefined;
    if (values.audienceType === "groups") {
      targetIds = values.selectedGroupIds;
    } else if (values.audienceType === "event" && values.selectedEventId) {
      targetIds = [values.selectedEventId];
    }
    return {
      title: values.title,
      body: values.body,
      category: values.category,
      audienceType: values.audienceType,
      pushEnabled: values.pushEnabled,
      targetIds,
    };
  };

  return { form, validateStep, toCreatePayload, toScheduledTimestamp };
}
