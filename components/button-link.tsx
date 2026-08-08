import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function ButtonLink({ children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(buttonVariants({ size: "sm" }), className)}
      {...props}
    >
      {children}
    </a>
  )
}

