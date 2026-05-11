"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  badgeVariant?: "default" | "warning" | "danger" | "success";
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
  badge,
  badgeVariant = "default",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const badgeColors = {
    default: "bg-gradient-to-r from-blue-500 to-blue-600",
    warning: "bg-gradient-to-r from-orange-500 to-orange-600",
    danger: "bg-gradient-to-r from-red-500 to-red-600",
    success: "bg-gradient-to-r from-green-500 to-green-600",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <div className={cn(
        "rounded-2xl border bg-card shadow-md overflow-hidden transition-all duration-300",
        isOpen ? "shadow-lg" : "hover:shadow-lg"
      )}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between p-5 text-left transition-all duration-200",
              isOpen 
                ? "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-blue-100/50" 
                : "hover:bg-gray-50/80"
            )}
          >
            <div className="flex items-center gap-4">
              {icon && (
                <span className={cn(
                  "p-2.5 rounded-xl transition-colors",
                  isOpen 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/20" 
                    : "bg-gray-100 text-gray-600"
                )}>
                  {icon}
                </span>
              )}
              <span className="font-bold text-lg text-foreground">{title}</span>
              {badge && (
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold text-white shadow-sm",
                    badgeColors[badgeVariant]
                  )}
                >
                  {badge}
                </span>
              )}
            </div>
            <div className={cn(
              "p-2 rounded-lg transition-all duration-200",
              isOpen ? "bg-blue-100 rotate-180" : "bg-gray-100"
            )}>
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-colors",
                  isOpen ? "text-blue-600" : "text-gray-500"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-5 pt-4 bg-white">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleSection,
};
