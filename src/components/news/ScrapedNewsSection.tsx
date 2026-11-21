import { useState } from 'react';
import { Button, Select, Skeleton, Tag, message } from 'antd';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import type { NewsArticle, NewsOutcome, NewsQuery } from '../../types';
import { useNews, useNewsCountries, useSetNewsHidden } from '../../hooks/news.hook';
import { getCountryName } from '../../utils/countries.utils';
import { formatPublished } from '../../utils/formatPublished';
import { hostOf, safeHref } from '../../utils/safeUrl';
import Flag from '../Flag';

const OUTCOMES: Record<NewsOutcome, { label: string; tag: string }> = {
  WIN:     { label: 'Win',     tag: 'green' },
  LOSS:    { label: 'Loss',    tag: 'red' },
  NEUTRAL: { label: 'Neutral', tag: 'default' },
};

function OutcomeTag({ outcome }: { outcome: NewsOutcome | null }) {
  if (!outcome) return null;
  const { label, tag } = OUTCOMES[outcome];
  return <Tag color={tag} bordered={false} className="m-0">{label}</Tag>;
}

function NewsFilters({ query, onChange }: { query: NewsQuery; onChange: (q: NewsQuery) => void }) {
  const { data: countries = [] } = useNewsCountries();

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Select<NewsOutcome | undefined>
        allowClear
        placeholder="Any outcome"
        className="w-36"
        value={query.outcome}
        onChange={outcome => onChange({ ...query, outcome })}
        options={Object.entries(OUTCOMES).map(([value, o]) => ({ value: value as NewsOutcome, label: o.label }))}
      />
      <Select<string | undefined>
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Any country"
        className="w-48"
        value={query.countryCode}
        onChange={countryCode => onChange({ ...query, countryCode })}
        options={countries.map(code => ({ value: code, label: getCountryName(code) ?? code }))}
      />
    </div>
  );
}

function NewsCard({ article, isAdmin }: { article: NewsArticle; isAdmin: boolean }) {
  const setHidden = useSetNewsHidden();
  const href = safeHref(article.url);
  const place = [article.cityName, article.countryCode && getCountryName(article.countryCode)].filter(Boolean).join(', ');
  const meta = [article.source, formatPublished(article.publishedOn), hostOf(article.url)].filter(Boolean).join(' · ');

  const toggleHidden = async () => {
    try {
      await setHidden.mutateAsync({ id: article.id, hidden: !article.hidden });
      message.success(article.hidden ? 'Article shown again' : 'Article hidden from visitors');
    } catch (err) {
      message.error((err as Error).message || 'Failed to update article');
    }
  };

  return (
    <li className={`flex gap-3 rounded-lg border border-gray-200 bg-white p-4 ${article.hidden ? 'opacity-50' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <OutcomeTag outcome={article.outcome} />
          {place && (
            <span className="flex items-center gap-1.5 text-xs text-gray-600">
              <Flag code={article.countryCode} />
              {place}
            </span>
          )}
          {article.hidden && <Tag className="m-0">Hidden</Tag>}
        </div>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 underline-offset-2 hover:text-yimby-700 hover:underline"
          >
            {article.title}
          </a>
        ) : (
          <span className="font-medium text-gray-900">{article.title}</span>
        )}
        {meta && <p className="mt-0.5 text-xs text-gray-500">{meta}</p>}
        {article.summary && <p className="mt-1.5 text-sm text-gray-600">{article.summary}</p>}
        {article.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {article.tags.map(t => <Tag key={t} bordered={false} className="m-0 text-xs">{t}</Tag>)}
          </div>
        )}
      </div>

      {isAdmin && (
        <Button
          size="small"
          type="text"
          loading={setHidden.isPending}
          icon={article.hidden ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          onClick={toggleHidden}
          aria-label={article.hidden ? `Show ${article.title}` : `Hide ${article.title}`}
          title={article.hidden ? 'Show to visitors again' : 'Hide from visitors'}
        />
      )}
    </li>
  );
}

/**
 * Housing news found by the nightly crawler and summarised by AI. Kept apart
 * from "Articles & resources", which are picked by hand.
 */
export default function ScrapedNewsSection({ isAdmin }: { isAdmin: boolean }) {
  const [query, setQuery] = useState<NewsQuery>({});
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useNews(query, isAdmin);
  const articles = data?.pages.flatMap(p => p.data) ?? [];

  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Scraped news articles</h3>
        <p className="mt-1 text-sm text-gray-500 max-w-2xl">
          Housing news collected automatically each night from YIMBY groups and local outlets. Summaries and
          win/loss labels are written by AI and can be wrong; each title links to the original article.
        </p>
      </div>

      <NewsFilters query={query} onChange={setQuery} />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : isError ? (
        <p className="text-sm text-red-500">Couldn't load articles. Try again later.</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-gray-400">No articles match.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {articles.map(a => <NewsCard key={a.id} article={a} isAdmin={isAdmin} />)}
          </ul>
          {hasNextPage && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load more</Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
