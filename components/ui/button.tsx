import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ asChild, className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#A56ABD] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "border-[#6E3482] bg-[#6E3482] text-white hover:bg-[#49225B]",
        variant === "secondary" && "border-[#A56ABD] bg-[#E7DBEF] text-[#49225B] hover:bg-white",
        variant === "ghost" && "border-transparent bg-transparent text-[#49225B] hover:bg-[#E7DBEF]",
        variant === "danger" && "border-red-700 bg-red-700 text-white hover:bg-red-800",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10",
        className,
      )}
      {...props}
    />
  );
}
