import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      duration={3000}
      toastOptions={{
        classNames: {
          toast: "group toast",
          success: "bg-green-500 text-white border-green-600",
          error: "bg-red-500 text-white border-red-600",
          description: "text-white/90",
          actionButton: "bg-white text-black",
          cancelButton: "bg-white/20 text-white",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }