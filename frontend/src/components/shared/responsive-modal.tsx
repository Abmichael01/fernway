"use client";

import { createContext, type ComponentProps, type ReactNode, useContext } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/**
 * One overlay that behaves like the platform: a bottom sheet you can swipe down on phones,
 * and a side sheet or centred dialog on larger screens.
 */
type DesktopKind = "sheet" | "dialog";
type Mode = "drawer" | DesktopKind;

const ModeContext = createContext<Mode>("dialog");

interface ResponsiveModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What to show from the `md` breakpoint up. */
  desktop?: DesktopKind;
  /** Blocks swipe/escape/outside-click dismissal, e.g. while a payment is sending. */
  dismissible?: boolean;
  children: ReactNode;
}

export function ResponsiveModal({ open, onOpenChange, desktop = "dialog", dismissible = true, children }: ResponsiveModalProps) {
  const isMobile = useIsMobile();
  const mode: Mode = isMobile ? "drawer" : desktop;
  const handleOpenChange = (next: boolean) => {
    if (!next && !dismissible) return;
    onOpenChange?.(next);
  };

  const Root = mode === "drawer" ? Drawer : mode === "sheet" ? Sheet : Dialog;
  return (
    <ModeContext.Provider value={mode}>
      <Root open={open} onOpenChange={handleOpenChange} {...(mode === "drawer" ? { repositionInputs: false } : {})}>
        {children}
      </Root>
    </ModeContext.Provider>
  );
}

export function ResponsiveModalTrigger(props: ComponentProps<typeof DialogTrigger>) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerTrigger {...props} />;
  if (mode === "sheet") return <SheetTrigger {...props} />;
  return <DialogTrigger {...props} />;
}

export function ResponsiveModalClose(props: ComponentProps<typeof DialogClose>) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerClose {...props} />;
  if (mode === "sheet") return <SheetClose {...props} />;
  return <DialogClose {...props} />;
}

interface ContentProps {
  className?: string;
  children: ReactNode;
}

export function ResponsiveModalContent({ className, children }: ContentProps) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") {
    return (
      <DrawerContent className={cn("gap-0", className)}>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </DrawerContent>
    );
  }
  if (mode === "sheet") {
    return <SheetContent className={cn("w-full gap-0 sm:max-w-md", className)}>{children}</SheetContent>;
  }
  return <DialogContent className={cn("sm:max-w-md", className)}>{children}</DialogContent>;
}

export function ResponsiveModalHeader({ className, ...props }: ComponentProps<"div">) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerHeader className={cn("text-left", className)} {...props} />;
  if (mode === "sheet") return <SheetHeader className={className} {...props} />;
  return <DialogHeader className={className} {...props} />;
}

export function ResponsiveModalFooter({ className, ...props }: ComponentProps<"div">) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerFooter className={className} {...props} />;
  if (mode === "sheet") return <SheetFooter className={className} {...props} />;
  return <DialogFooter className={className} {...props} />;
}

export function ResponsiveModalTitle(props: ComponentProps<typeof DialogTitle>) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerTitle {...props} />;
  if (mode === "sheet") return <SheetTitle {...props} />;
  return <DialogTitle {...props} />;
}

export function ResponsiveModalDescription(props: ComponentProps<typeof DialogDescription>) {
  const mode = useContext(ModeContext);
  if (mode === "drawer") return <DrawerDescription {...props} />;
  if (mode === "sheet") return <SheetDescription {...props} />;
  return <DialogDescription {...props} />;
}

/** True inside a bottom sheet, for small layout tweaks (e.g. padding). */
export function useInBottomSheet() {
  return useContext(ModeContext) === "drawer";
}
