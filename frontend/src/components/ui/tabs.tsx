"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...props}
    />
  )
}

/**
 * Fernway tabs. One indicator per list slides to whichever tab is active.
 * - `default`: a segmented control; the indicator is a brand-gradient pill behind the active tab.
 * - `line`: page-level section tabs; the indicator is a gradient bar under the active tab.
 */
const tabsListVariants = cva("group/tabs-list relative isolate inline-flex w-fit items-center text-muted-foreground", {
  variants: {
    variant: {
      default: "h-11 gap-1 rounded-md border bg-secondary/60 p-1",
      line: "h-auto gap-7 border-b border-border",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const indicatorClass = {
  default: "top-0 h-full rounded-sm bg-brand-gradient shadow-[0_6px_16px_-6px_rgb(6_95_70/0.6)]",
  line: "-bottom-px h-[3px] bg-[linear-gradient(90deg,#065f46,#10b981)]",
} as const

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  const listRef = React.useRef<HTMLDivElement>(null)
  const indicatorRef = React.useRef<HTMLSpanElement>(null)

  // Place the indicator on the active trigger. Writes go straight to the DOM,
  // so moving it never re-renders the tabs.
  React.useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (!list || !indicator) return

    const update = () => {
      const active = list.querySelector<HTMLElement>('[data-slot="tabs-trigger"][data-state="active"]')
      if (!active) {
        indicator.style.opacity = "0"
        return
      }
      indicator.style.opacity = "1"
      indicator.style.width = `${active.offsetWidth}px`
      indicator.style.transform = `translateX(${active.offsetLeft}px)`
      if (variant !== "line") {
        indicator.style.top = `${active.offsetTop}px`
        indicator.style.height = `${active.offsetHeight}px`
      }
    }

    update()
    // Turn the slide on only after the first placement, so it does not sweep in on load.
    const frame = requestAnimationFrame(() => list.setAttribute("data-ready", "true"))

    const mutations = new MutationObserver(update)
    mutations.observe(list, { attributes: true, subtree: true, attributeFilter: ["data-state"] })
    const resizes = new ResizeObserver(update)
    resizes.observe(list)
    for (const child of Array.from(list.children)) resizes.observe(child)

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resizes.disconnect()
    }
  }, [variant])

  return (
    <TabsPrimitive.List
      ref={listRef}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      <span
        ref={indicatorRef}
        aria-hidden="true"
        data-slot="tabs-indicator"
        className={cn(
          "pointer-events-none absolute left-0 -z-10 opacity-0",
          "group-data-[ready=true]/tabs-list:transition-[transform,width,opacity] group-data-[ready=true]/tabs-list:duration-300 group-data-[ready=true]/tabs-list:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          indicatorClass[variant ?? "default"]
        )}
      />
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex flex-1 items-center justify-center gap-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "focus-visible:ring-3 focus-visible:ring-ring/40",
        // Segmented control: the sliding pill sits behind the active tab.
        "group-data-[variant=default]/tabs-list:h-full group-data-[variant=default]/tabs-list:rounded-sm group-data-[variant=default]/tabs-list:px-4",
        "group-data-[variant=default]/tabs-list:hover:text-foreground",
        "group-data-[variant=default]/tabs-list:data-active:text-white group-data-[variant=default]/tabs-list:data-active:hover:text-white",
        // Line tabs: the sliding bar sits under the active tab.
        "group-data-[variant=line]/tabs-list:flex-none group-data-[variant=line]/tabs-list:px-1 group-data-[variant=line]/tabs-list:pt-1 group-data-[variant=line]/tabs-list:pb-3.5 group-data-[variant=line]/tabs-list:text-[15px]",
        "group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:data-active:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
