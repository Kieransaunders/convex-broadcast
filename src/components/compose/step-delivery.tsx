import { Bell, CalendarIcon, Clock, Send } from "lucide-react"
import { format } from "date-fns"
import type { ComposeFormValues } from "./use-compose-form"
import type { UseFormReturn } from "react-hook-form"
import { buttonVariants } from "~/components/ui/button"
import { Calendar } from "~/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Switch } from "~/components/ui/switch"
import { cn } from "~/lib/utils"

interface StepDeliveryProps {
  form: UseFormReturn<ComposeFormValues>
}

export function StepDelivery({ form }: StepDeliveryProps) {
  const deliveryMode = form.watch("deliveryMode")
  const scheduledDate = form.watch("scheduledDate")

  return (
    <Form {...form}>
      <div className="space-y-6">
        {/* Delivery mode cards */}
        <FormField
          control={form.control}
          name="deliveryMode"
          render={({ field }) => (
            <FormItem>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { mode: "now" as const, icon: Send, title: "Send Immediately", description: "Message will be delivered right away" },
                  { mode: "schedule" as const, icon: Clock, title: "Schedule for Later", description: "Pick a date and time to send" },
                ].map(({ mode, icon: Icon, title, description }) => {
                  const isSelected = field.value === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => field.onChange(mode)}
                      className={cn(
                        "flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left",
                        isSelected ? "border-[#6366F1] bg-[#6366F1]/5" : "border-gray-200 hover:border-[#6366F1]/30 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn("p-2.5 rounded-lg mt-0.5", isSelected ? "bg-[#6366F1]" : "bg-gray-100")}>
                        <Icon className={cn("h-5 w-5", isSelected ? "text-white" : "text-gray-500")} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-semibold", isSelected ? "text-[#6366F1]" : "text-[#1E1B4B]")}>{title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                      </div>
                      <div className={cn("mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center", isSelected ? "border-[#6366F1]" : "border-gray-300")}>
                        {isSelected && <div className="h-2 w-2 rounded-full bg-[#6366F1]" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date/time picker */}
        {deliveryMode === "schedule" && (
          <div className="space-y-4 p-4 border border-[#6366F1]/20 rounded-xl bg-[#6366F1]/5">
            <p className="text-sm font-medium text-[#1E1B4B]">Schedule Details</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1E1B4B] font-medium">Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "w-full justify-start text-left font-normal border-[#6366F1]/20",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-[#6366F1]" />
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(Date.now() - 24 * 60 * 60 * 1000)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1E1B4B] font-medium">Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6366F1]" />
                        <input
                          type="time"
                          className="flex h-9 w-full rounded-md border border-[#6366F1]/20 bg-transparent pl-10 pr-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-[#6366F1]"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {scheduledDate && (
              <p className="text-xs text-[#1E1B4B]/60">
                Scheduled for {format(scheduledDate, "EEEE, MMMM d, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Push notifications toggle */}
        <FormField
          control={form.control}
          name="pushEnabled"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start justify-between gap-4 p-4 border border-[#6366F1]/10 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#6366F1]/10 mt-0.5">
                    <Bell className="h-4 w-4 text-[#6366F1]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1E1B4B]">Push Notifications</p>
                    <p className="text-sm text-[#1E1B4B]/60 mt-0.5">Send push notifications to members' devices in addition to the in-app feed.</p>
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 data-[state=checked]:bg-[#6366F1]"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
