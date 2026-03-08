"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/shared/lib";

import {
  STACK_PAGE_BASE_CLASS,
  STACK_PAGE_BASE_EXIT_CLASS,
  STACK_PAGE_OVERLAY_CLASS,
  STACK_PAGE_OVERLAY_EXIT_CLASS,
} from "../model/constants";
import { StackPageEntryContext, useStackPage } from "../model/stackPageContext";
import { StackHeader } from "./StackHeader";
import "./StackPageAnimations.css";

interface StackPageScopeProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  pageClassName?: string;
  overlayClassName?: string;
  headerTitle?: string;
  headerActionLabel?: string | null;
  onHeaderActionClick?: () => void;
  showHeader?: boolean;
}

const renderBasePage = (content: ReactNode) => (
  <div className="flex h-full min-h-0 w-full flex-col">
    <div className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto">
      {content}
    </div>
  </div>
);

const renderOverlayPage = (content: ReactNode, header: ReactNode) => (
  <div className="flex h-full min-h-0 w-full flex-col">
    <div className="shrink-0">{header}</div>
    <div className="scrollbar-hide flex min-h-0 w-full flex-1 flex-col gap-5 overflow-y-auto">
      {content}
    </div>
  </div>
);

export function StackPageScope({
  children,
  as: Component = "div",
  className,
  pageClassName,
  overlayClassName,
  headerTitle = "",
  headerActionLabel = "뒤로",
  onHeaderActionClick,
  showHeader = true,
}: StackPageScopeProps) {
  const { stack, pop, poppingKey, headerContent, headerRightContent } = useStackPage();

  const hasOverlay = stack.length > 0;
  const isPopping = Boolean(poppingKey);
  const handleHeaderAction = onHeaderActionClick ?? pop;

  const header = showHeader ? (
    <StackHeader
      actionLabel={headerActionLabel}
      onActionClick={handleHeaderAction}
      title={headerTitle}
      headerContent={headerContent}
      headerRightContent={headerRightContent}
    />
  ) : null;

  return (
    <Component className={cn("text-ink-900 relative w-full overflow-hidden", className)}>
      <div
        className={cn(
          "relative z-0 h-full min-h-0 w-full bg-[#F8F8F8] py-10 transition-transform duration-300 ease-out",
          hasOverlay && !isPopping && STACK_PAGE_BASE_CLASS,
          hasOverlay && isPopping && STACK_PAGE_BASE_EXIT_CLASS,
          pageClassName,
        )}
      >
        <StackPageEntryContext.Provider value={{ entryKey: null }}>
          {renderBasePage(children)}
        </StackPageEntryContext.Provider>
      </div>
      {stack.map((entry, index) => (
        <div
          key={entry.key}
          className={cn(
            "absolute inset-0 min-h-0 bg-[#F8F8F8]",
            STACK_PAGE_OVERLAY_CLASS,
            entry.key === poppingKey && STACK_PAGE_OVERLAY_EXIT_CLASS,
            pageClassName,
            overlayClassName,
          )}
          style={{ zIndex: index + 1 }}
        >
          <StackPageEntryContext.Provider value={{ entryKey: entry.key }}>
            {renderOverlayPage(entry.element, header)}
          </StackPageEntryContext.Provider>
        </div>
      ))}
    </Component>
  );
}
