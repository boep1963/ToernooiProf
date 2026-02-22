'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string; // If no href, item is the current page (last item)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Reusable breadcrumb navigation component.
 * Shows full path navigation like "Instellingen > Account"
 * with clickable links for all items except the last (current page).
 *
 * Uses SVG chevron separator (>) consistent with CompetitionSubNav
 * and admin breadcrumbs. Supports dark mode.
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      className={`flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4 ${className}`}
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-green-700 dark:hover:text-green-400 hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
