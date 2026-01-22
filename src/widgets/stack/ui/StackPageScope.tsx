"use client";

import type { ElementType, ReactNode } from "react";

import { cn } from "@/shared/lib";
import { AppHeader } from "@/widgets/app-header";

import {
  STACK_PAGE_BASE_CLASS,
  STACK_PAGE_BASE_EXIT_CLASS,
  STACK_PAGE_OVERLAY_CLASS,
  STACK_PAGE_OVERLAY_EXIT_CLASS,
} from "../model/constants";
import { useStackPage } from "../model/stackPageContext";

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
  <div className="flex min-h-screen w-full flex-col">
    <div className="flex w-full flex-1 flex-col gap-5">{content}</div>
  </div>
);

const renderOverlayPage = (content: ReactNode, header: ReactNode) => (
  <div className="flex min-h-screen w-full flex-col">
    {header}
    <div className="flex w-full flex-1 flex-col gap-5">{content}</div>
  </div>
);

export function StackPageScope({
  children,
  as: Component = "div",
  className,
  pageClassName,
  overlayClassName,
  headerTitle = "App Header",
  headerActionLabel = "뒤로",
  onHeaderActionClick,
  showHeader = true,
}: StackPageScopeProps) {
  const { stack, pop, poppingKey, headerContent } = useStackPage();

  const hasOverlay = stack.length > 0;
  const isPopping = Boolean(poppingKey);
  const handleHeaderAction = onHeaderActionClick ?? pop;

  const header = showHeader ? (
    <AppHeader
      actionLabel={headerActionLabel}
      onActionClick={handleHeaderAction}
      title={headerTitle}
      headerContent={headerContent}
    />
  ) : null;

  return (
    <Component className={cn("relative overflow-hidden", className)}>
      <div
        className={cn(
          "relative z-0 w-full bg-white py-10 transition-transform duration-300 ease-out",
          hasOverlay && !isPopping && STACK_PAGE_BASE_CLASS,
          hasOverlay && isPopping && STACK_PAGE_BASE_EXIT_CLASS,
          pageClassName,
        )}
      >
        {renderBasePage(children)}
      </div>
      {stack.map((entry, index) => (
        <div
          key={entry.key}
          className={cn(
            "absolute inset-0 bg-white",
            STACK_PAGE_OVERLAY_CLASS,
            entry.key === poppingKey && STACK_PAGE_OVERLAY_EXIT_CLASS,
            pageClassName,
            overlayClassName,
          )}
          style={{ zIndex: index + 1 }}
        >
          {renderOverlayPage(entry.element, header)}
        </div>
      ))}
    </Component>
  );
}
