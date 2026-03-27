import { useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useConvex } from "convex/react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../../../convex/_generated/api.js";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Stepper } from "~/components/compose/stepper";
import { StepContent } from "~/components/compose/step-content";
import { StepAudience } from "~/components/compose/step-audience";
import { StepDelivery } from "~/components/compose/step-delivery";
import { StepPreview } from "~/components/compose/step-preview";
import { useComposeForm } from "~/components/compose/use-compose-form";

export const Route = createFileRoute("/_authed/_admin/messages/new")({
  component: NewMessagePage,
});

function NewMessagePage() {
  const router = useRouter();
  const convex = useConvex();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const { form, validateStep, toCreatePayload, toScheduledTimestamp } =
    useComposeForm();

  const createMutation = useMutation({
    mutationFn: async (
      payload: Parameters<
        typeof convex.mutation<typeof api.messages.create>
      >[1],
    ) => {
      return await convex.mutation(api.messages.create, payload);
    },
  });

  const sendNowMutation = useMutation({
    mutationFn: async (id: string) => {
      await convex.mutation(api.messages.sendNow, { id: id as any });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async ({
      id,
      scheduledFor,
    }: {
      id: string;
      scheduledFor: number;
    }) => {
      await convex.mutation(api.messages.schedule, {
        id: id as any,
        scheduledFor,
      });
    },
  });

  const isSubmitting =
    createMutation.isPending ||
    sendNowMutation.isPending ||
    scheduleMutation.isPending;

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleStepClick = (step: number) => {
    if (completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    const payload = toCreatePayload(values);
    await createMutation.mutateAsync(payload as any);
    router.navigate({ to: "/messages" });
  };

  const handleSendNow = async () => {
    const values = form.getValues();
    const payload = toCreatePayload(values);
    const messageId = await createMutation.mutateAsync(payload as any);
    await sendNowMutation.mutateAsync(messageId as string);
    router.navigate({ to: "/messages" });
  };

  const handleSchedule = async () => {
    const values = form.getValues();
    const payload = toCreatePayload(values);
    const scheduledFor = toScheduledTimestamp(values);
    const messageId = await createMutation.mutateAsync(payload as any);
    await scheduleMutation.mutateAsync({
      id: messageId as string,
      scheduledFor,
    });
    router.navigate({ to: "/messages" });
  };

  const stepComponents = [
    <StepContent key="content" form={form} />,
    <StepAudience key="audience" form={form} />,
    <StepDelivery key="delivery" form={form} />,
    <StepPreview
      key="preview"
      form={form}
      onSaveDraft={handleSaveDraft}
      onSendNow={handleSendNow}
      onSchedule={handleSchedule}
      isSubmitting={isSubmitting}
    />,
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/messages">
          <Button variant="ghost" size="icon" className="text-[#1E1B4B]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B4B]">New Message</h1>
          <p className="text-[#1E1B4B]/60 mt-1">
            Compose and send a message to your organisation.
          </p>
        </div>
      </div>

      {/* Stepper + content card */}
      <Card className="border-[#6366F1]/10">
        <CardContent className="p-0">
          <div className="border-b border-[#6366F1]/10 px-6">
            <Stepper
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>
          <div className="p-6">{stepComponents[currentStep]}</div>
        </CardContent>
      </Card>

      {/* Navigation buttons (Next hidden on review step — actions are inside StepPreview) */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="border-[#6366F1]/20 text-[#1E1B4B] cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        {currentStep < 3 && (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white cursor-pointer"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
