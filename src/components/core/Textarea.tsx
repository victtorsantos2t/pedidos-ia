import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[120px] w-full rounded-xl border-none bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm font-bold shadow-sm ring-offset-background transition-all placeholder:text-gray-400 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/10 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
