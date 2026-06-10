/**
 * News & Updates — browse AI news. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import { useNews } from "../../api/hooks";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NewsPage() {
  const [page, setPage] = React.useState(1);
  const { data: newsData, isLoading } = useNews({ page, pageSize: 6 });
  const { data: featuredData } = useNews({ featured: true, page: 1, pageSize: 1 });

  const newsItems = newsData?.data ?? [];
  const total = newsData?.total ?? 0;
  const featured = featuredData?.data?.[0];

  return (
    <Section>
      <h1 className="text-3xl font-bold">News & Updates</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Stay current with the latest AI developments.</p>

      {featured && (
        <div className="border-2 border-primary-500 rounded-xl bg-white dark:bg-neutral-900">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">Featured</span>
              <span className="text-xs text-neutral-500">{featured.source} — {formatDate(featured.publishedAt)}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{featured.title}</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-3">{featured.summary}</p>
            {featured.url && <a href={featured.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 dark:text-primary-400 hover:underline">Read more →</a>}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsItems.map((item: any) => (
              <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="h-4 w-4 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                    <span className="text-xs text-neutral-500">{item.source} — {formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{item.summary}</p>
                  <div className="flex gap-2 flex-wrap">
                    {item.tags.slice(0, 3).map((t: string) => <span key={t} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{t}</span>)}
                  </div>
                </div>
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600">Read more →</a>}
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="flex justify-center mt-8">
              <nav className="flex gap-2">
                {[...Array(Math.ceil(total / (newsData?.page_size ?? 6)))].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-primary-500 text-white" : "bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>{i + 1}</button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
