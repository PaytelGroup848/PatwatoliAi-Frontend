"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Globe, ChevronDown, ExternalLink, FileText } from "lucide-react";
import type { WebSourceItem, DocumentSourceItem } from "../utils/source-parser";

interface SourcesDropdownProps {
  sources: WebSourceItem[];
  documentSources?: DocumentSourceItem[];
  initialOpen?: boolean;
  isOpen?: boolean;
  hideHeader?: boolean;
}

export interface SourcesDropdownHandle {
  highlightSource: (index: number) => void;
  open: () => void;
  close: () => void;
}

function SourceFavicon({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return (
      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
        <Globe size={11} />
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`}
      alt=""
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 rounded-xs object-contain"
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export const SourcesDropdown = forwardRef<SourcesDropdownHandle, SourcesDropdownProps>(
  function SourcesDropdown(
    {
      sources,
      documentSources = [],
      initialOpen = false,
      isOpen: controlledIsOpen,
      hideHeader = false,
    },
    ref
  ) {
    const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(initialOpen);
    const isOpen = typeof controlledIsOpen === "boolean" ? controlledIsOpen : uncontrolledIsOpen;
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);
    const sourceRefs = useRef<Record<number, HTMLAnchorElement | HTMLDivElement | null>>({});

    useImperativeHandle(ref, () => ({
      highlightSource(index: number) {
        if (typeof controlledIsOpen !== "boolean") {
          setUncontrolledIsOpen(true);
        }
        setActiveSourceIndex(index);
        setTimeout(() => {
          const el = sourceRefs.current[index];
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }, 100);

        setTimeout(() => {
          setActiveSourceIndex(null);
        }, 2500);
      },
      open() {
        if (typeof controlledIsOpen !== "boolean") {
          setUncontrolledIsOpen(true);
        }
      },
      close() {
        if (typeof controlledIsOpen !== "boolean") {
          setUncontrolledIsOpen(false);
        }
      },
    }));

    if ((!sources || sources.length === 0) && (!documentSources || documentSources.length === 0)) {
      return null;
    }

    if (hideHeader && !isOpen) {
      return null;
    }

    return (
      <div className="my-2.5 w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs transition-all">
        {/* HEADER / TOGGLE BAR */}
        {!hideHeader && (
          <button
            type="button"
            onClick={() => setUncontrolledIsOpen((prev) => !prev)}
            className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-expanded={isOpen}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                <Globe size={13} />
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                Sources
              </span>
              {sources.length > 0 && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  {sources.length}
                </span>
              )}
              {documentSources.length > 0 && (
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-300">
                  {documentSources.length} Doc{documentSources.length > 1 ? "s" : ""}
                </span>
              )}

              {/* DOMAIN PREVIEW PILLS (Collapsed state) */}
              {!isOpen && sources.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 ml-1 overflow-hidden">
                  {sources.slice(0, 3).map((s) => (
                    <span
                      key={s.index}
                      className="truncate max-w-[120px] rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                    >
                      {s.domain || `Source ${s.index}`}
                    </span>
                  ))}
                  {sources.length > 3 && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      +{sources.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-medium">{isOpen ? "Hide" : "Show"}</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>
        )}

        {/* EXPANDED DROPDOWN CONTENT */}
        {isOpen && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-2.5 transition-all">
            {/* WEB SOURCES GRID */}
            {sources.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((source) => {
                  const isActive = activeSourceIndex === source.index;
                  const hasUrl = Boolean(source.url);

                  const CardWrapper = hasUrl ? "a" : "div";
                  const cardProps = hasUrl
                    ? {
                        href: source.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      }
                    : {};

                  return (
                    <CardWrapper
                      key={source.index}
                      {...cardProps}
                      ref={(el: HTMLAnchorElement | HTMLDivElement | null) => {
                        sourceRefs.current[source.index] = el;
                      }}
                      className={`group relative flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition-all ${
                        isActive
                          ? "border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/80 ring-2 ring-emerald-400/40 text-slate-900 dark:text-slate-100 shadow-xs"
                          : "border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs text-slate-800 dark:text-slate-200"
                      } ${hasUrl ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {/* SOURCE INDEX BADGE */}
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 border border-slate-200/60 dark:border-slate-600 text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
                        {source.index}
                      </span>

                      {/* SOURCE DETAILS */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <SourceFavicon domain={source.domain} />
                          <span className="truncate text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {source.domain || "Web Resource"}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-slate-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {source.title}
                        </p>
                      </div>

                      {/* EXTERNAL LINK ICON */}
                      {hasUrl && (
                        <ExternalLink
                          size={13}
                          className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-0.5"
                        />
                      )}
                    </CardWrapper>
                  );
                })}
              </div>
            )}

            {/* DOCUMENT CITATIONS SECTION */}
            {documentSources.length > 0 && (
              <div className={`${sources.length > 0 ? "mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800" : ""}`}>
                <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <FileText size={13} className="text-blue-500 dark:text-blue-400" />
                  <span>Referenced Documents</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {documentSources.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <FileText size={12} className="text-blue-500 dark:text-blue-400 shrink-0" />
                      <span className="font-medium truncate max-w-[220px]">
                        {doc.filename}
                      </span>
                      {doc.page && (
                        <span className="rounded-sm bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1 py-0.2 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                          p. {doc.page}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
