"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "tpeer tinline-flex th-6 tw-11 tshrink-0 tcursor-pointer titems-center trounded-full tborder-2 tborder-transparent ttransition-colors focus-visible:toutline-none focus-visible:tring-2 focus-visible:tring-ring focus-visible:tring-offset-2 focus-visible:tring-offset-background disabled:tcursor-not-allowed disabled:topacity-50 data-[state=checked]:tbg-primary data-[state=unchecked]:tbg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "tpointer-events-none tblock th-5 tw-5 trounded-full tbg-background tshadow-lg tring-0 ttransition-transform data-[state=checked]:ttranslate-x-5 data-[state=unchecked]:ttranslate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
