import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
        return (
            <div className={cn("relative flex items-center w-full group", containerClassName)}>
                {leftIcon && (
                    <div className="absolute left-4 text-gray-500 dark:text-gray-400 group-focus-within:text-foreground transition-colors duration-200">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-14 w-full rounded-xl border-none bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm font-bold shadow-sm ring-offset-background transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 placeholder:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-gray-700 disabled:cursor-not-allowed disabled:opacity-50",
                        leftIcon && "pl-12",
                        rightIcon && "pr-12",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute right-4 text-gray-500 dark:text-gray-400 group-focus-within:text-foreground transition-colors duration-200">
                        {rightIcon}
                    </div>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 mb-1.5 ml-1 block",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

export { Input, Label }
