import * as React from "react"
import { cn } from "~/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        role="radiogroup"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === RadioGroupItem) {
            return React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
              checked: value === (child.props as RadioGroupItemProps).value,
              onSelect: () => onValueChange?.((child.props as RadioGroupItemProps).value),
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  checked?: boolean
  onSelect?: () => void
  id?: string
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, checked, onSelect, id, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={checked}
        id={id}
        onClick={onSelect}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-[#6366F1] text-[#6366F1] ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "border-[#6366F1] bg-[#6366F1]" : "border-gray-300 bg-white",
          className
        )}
        {...props}
      >
        {checked && (
          <span className="flex h-full w-full items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        )}
      </button>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
