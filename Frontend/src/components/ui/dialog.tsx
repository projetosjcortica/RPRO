import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Root>>((props, ref) => {
  return <DialogPrimitive.Root ref={ref} data-slot="dialog" {...props as any} />
})
Dialog.displayName = 'Dialog';

const DialogTrigger = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Trigger>>((props, ref) => {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props as any} />
})
DialogTrigger.displayName = 'DialogTrigger';

const DialogPortal = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Portal>>((props, ref) => {
  return <DialogPrimitive.Portal ref={ref} data-slot="dialog-portal" {...props as any} />
})
DialogPortal.displayName = 'DialogPortal';

const DialogClose = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Close>>((props, ref) => {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props as any} />
})
DialogClose.displayName = 'DialogClose';

const DialogOverlay = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Overlay>>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props as any}
    />
  )
})
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }>(
  ({ className, children, showCloseButton = true, ...props }, ref) => {
    return (
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
            className
          )}
          {...props as any}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  }
)
DialogContent.displayName = 'DialogContent';

const DialogHeader = React.forwardRef<any, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
})
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = React.forwardRef<any, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
})
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Title>>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props as any}
    />
  )
})
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<any, React.ComponentProps<typeof DialogPrimitive.Description>>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props as any}
    />
  )
})
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
