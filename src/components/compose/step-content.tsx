import { FileText } from "lucide-react"
import type { ComposeFormValues } from "./use-compose-form"
import type { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"

interface StepContentProps {
  form: UseFormReturn<ComposeFormValues>
}

export function StepContent({ form }: StepContentProps) {
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1E1B4B] font-medium">Title</FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E1B4B]/40" />
                  <Input
                    placeholder="Enter message title"
                    className="pl-10 border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1]"
                    {...field}
                  />
                </div>
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-xs text-[#1E1B4B]/40 ml-auto">{field.value.length}/200</span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1E1B4B] font-medium">Message Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your message here..."
                  className="min-h-[150px] border-[#6366F1]/20 focus:border-[#6366F1] focus:ring-[#6366F1] resize-none"
                  {...field}
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="text-xs text-[#1E1B4B]/40 ml-auto">{field.value.length}/5000</span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#1E1B4B] font-medium">Category</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-[#6366F1]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="event_update">Event Update</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  )
}
