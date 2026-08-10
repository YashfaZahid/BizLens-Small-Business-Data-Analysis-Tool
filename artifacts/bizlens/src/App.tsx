import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowUpRight, Check, ChevronRight, CircleHelp, CloudUpload,
  Database, FileBarChart, FileSpreadsheet, Files, LayoutDashboard, MessageSquare,
  Paperclip, Plus, RefreshCw, Send, Sparkles, Table2, UploadCloud, X,
} from 'lucide-react';
import {
  getGetDatasetQueryKey, getGetReportQueryKey, getListDatasetsQueryKey, useAskQuestion,
  useGetDataset, useGetReport, useHealthCheck, useListDatasets, useUploadDataset,
} from '@workspace/api-client-react';
import type { Dataset, QuestionResponse } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const demoMetrics = [
  { label: 'Revenue', value: '$48,260', change: '+12.4%', note: 'vs. previous period' },
  { label: 'Orders', value: '1,284', change: '+8.7%', note: 'steady volume' },
  { label: 'Average order', value: '$37.58', change: '+3.1%', note: 'healthy mix' },
  { label: 'Returning customers', value: '34.6%', change: '+5.2%', note: 'building loyalty' },
];

const demoQuestions = [
  'What changed in revenue this month?',
  'Which products are carrying the business?',
  'Where should I look for a quick win?',
];

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: datasets, isLoading: datasetsLoading } = useListDatasets();
  const { data: health } = useHealthCheck();
  const nav = [
    { href: '/', label: 'Overview', icon: LayoutDashboard },
    { href: '/upload', label: 'Upload data', icon: CloudUpload },
    { href: '/reports', label: 'Reports', icon: FileBarChart },
    { href: '/ask', label: 'Ask BizLens', icon: MessageSquare },
  ];
  const current = nav.find((item) => item.href === location)?.label ?? 'BizLens';
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" data-testid="link-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">BizLens</span>
        </Link>
        <div className="nav-label">Workspace</div>
        <nav className="nav" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${location === href ? 'active' : ''}`} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}>
              <Icon /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="health" data-testid="status-api-health"><span className="health-dot" /><span>{health?.status === 'ok' ? 'Data services online' : datasetsLoading ? 'Checking data services' : 'Demo mode active'}</span></div>
          <div className="health"><Database size={14} /><span>{datasets?.length ?? 0} dataset{datasets?.length === 1 ? '' : 's'}</span></div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb"><span>Workspace</span><ChevronRight size={13} /><strong>{current}</strong></div>
          <div className="top-actions"><span className="period">Demo workspace · May 2024</span><div className="avatar">MC</div></div>
        </header>
        {children}
      </main>
    </div>
  );
}

function PageHead({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="page-head fade-up"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subhead">{description}</p></div>{action}</div>;
}

function MetricCard({ label, value, change, note }: typeof demoMetrics[number]) {
  return <div className="card metric fade-up" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className={`change ${change.startsWith('-') ? 'down' : ''}`}>{change} <span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{note}</span></div></div>;
}

function RevenueChart() {
  return <div className="chart" data-testid="chart-revenue">
    <svg viewBox="0 0 720 220" role="img" aria-label="Demo revenue trend chart">
      {[22, 72, 122, 172].map((y) => <line key={y} x1="0" x2="720" y1={y} y2={y} className="chart-grid" />)}
      <path className="chart-area" d="M0 166 C50 158 57 139 110 146 S166 167 217 128 S272 123 322 131 S376 89 428 105 S484 122 530 82 S596 92 640 50 S680 73 720 22 L720 220 L0 220Z" />
      <path className="chart-line" d="M0 166 C50 158 57 139 110 146 S166 167 217 128 S272 123 322 131 S376 89 428 105 S484 122 530 82 S596 92 640 50 S680 73 720 22" />
      <circle cx="640" cy="50" r="5" fill="#ed8a68" stroke="#f9f7ef" strokeWidth="3" />
    </svg>
    <div className="chart-labels"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div>
  </div>;
}

function Dashboard() {
  const { data: datasets } = useListDatasets();
  const latest = datasets?.[0];
  const { data: selectedDataset } = useGetDataset(latest?.id ?? '', { query: { enabled: Boolean(latest?.id), queryKey: getGetDatasetQueryKey(latest?.id ?? '') } });
  const activeDataset = selectedDataset ?? latest;
  return <div className="page">
    <PageHead eyebrow="Tuesday, May 28 · Owner view" title="A clearer read on your business." description="The important signals, without the spreadsheet archaeology. Here's the shape of your business right now." action={<Link href="/upload" className="btn btn-primary" data-testid="button-upload-top"><Plus size={15} /> Add data</Link>} />
    <div className="metric-grid">{demoMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}</div>
    <div className="grid-main">
      <section className="card panel fade-up" style={{ animationDelay: '.08s' }}>
        <div className="panel-head"><div><h2>Revenue is finding its rhythm</h2><div className="panel-kicker">Monthly revenue · demo view</div></div><button className="btn btn-ghost" data-testid="button-view-revenue">View details <ArrowUpRight size={14} /></button></div>
        <RevenueChart />
      </section>
      <section className="card panel insights fade-up" style={{ animationDelay: '.14s' }}>
        <div className="panel-head"><div><div className="eyebrow">Analyst notes</div><h2>Worth your attention</h2></div><Sparkles size={18} color="#4a836e" /></div>
        <div className="insight-list">
          <div className="insight"><div className="insight-title">Repeat customers are up</div><p>Returning customers grew 5.2% this period. Your best signal is coming from retention, not acquisition.</p></div>
          <div className="insight"><div className="insight-title">Average order has room</div><p>Order count is outpacing basket size. A thoughtful bundle could lift revenue without more traffic.</p></div>
          <div className="insight"><div className="insight-title">One caveat</div><p>These are illustrative numbers until you connect a dataset. Bring your own data for a grounded read.</p></div>
        </div>
      </section>
    </div>
    <div className="bottom-grid">
      <section className="card panel fade-up" style={{ animationDelay: '.2s' }}>
        <div className="panel-head"><div><h2>Recent activity</h2><div className="panel-kicker">Your workspace, at a glance</div></div><Link href="/upload" className="btn btn-ghost" data-testid="link-see-data">See all data <ArrowUpRight size={14} /></Link></div>
        {datasets?.length ? datasets.slice(0, 3).map((dataset) => <DatasetRow key={dataset.id} dataset={dataset} />) : <div className="empty"><Files size={25} /><div>No data uploaded yet</div><small>Start with a CSV or XLSX to make this view yours.</small></div>}
      </section>
      <section className="card data-status fade-up" style={{ animationDelay: '.25s' }}>
        <div className="eyebrow">Data status</div><h2>{activeDataset ? 'Your data is connected' : 'A useful preview, for now'}</h2>
        <p>{activeDataset ? `${activeDataset.filename} is available to ground your next question.` : 'BizLens is showing a carefully labeled demo so you can see the shape of the experience before connecting anything.'}</p>
        <div className="status-line"><span />{activeDataset ? `${activeDataset.row_count.toLocaleString()} rows ready` : 'Demo data · not your business'}</div>
        <Link href={activeDataset ? '/ask' : '/upload'} className="btn btn-soft" style={{ marginTop: 18 }} data-testid="button-data-next">{activeDataset ? 'Ask a question' : 'Connect your data'} <ChevronRight size={14} /></Link>
      </section>
    </div>
  </div>;
}

function DatasetRow({ dataset }: { dataset: Dataset }) {
  return <div className="activity-row" data-testid={`row-dataset-${dataset.id}`}><div className="file-icon"><FileSpreadsheet size={15} /></div><div className="activity-main"><div className="activity-name">{dataset.filename}</div><div className="activity-meta">{dataset.row_count.toLocaleString()} rows · {dataset.columns.length} columns</div></div><span className={`status ${dataset.status === 'needs_review' ? 'review' : ''}`}>{dataset.status === 'needs_review' ? 'Review' : 'Ready'}</span></div>;
}

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const upload = useUploadDataset();
  const client = useQueryClient();
  const { data: datasets, isLoading, isError, refetch } = useListDatasets();
  const selectFile = (candidate?: File) => {
    setError('');
    if (!candidate) return;
    const type = candidate.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'xlsx'].includes(type ?? '')) { setError('Choose a CSV or XLSX file to continue.'); return; }
    if (candidate.size > 20 * 1024 * 1024) { setError('That file is larger than 20 MB. Try a smaller export.'); return; }
    setFile(candidate);
  };
  const submit = () => {
    if (!file) { setError('Choose a file first.'); return; }
    upload.mutate({ data: { filename: file.name, size_bytes: file.size, file_type: file.name.endsWith('.xlsx') ? 'xlsx' : 'csv' } }, {
      onSuccess: () => { setFile(null); client.invalidateQueries({ queryKey: getListDatasetsQueryKey() }); },
      onError: () => setError('We could not register that file. Please try again.'),
    });
  };
  return <div className="page">
    <PageHead eyebrow="Bring your own signal" title="Start with the data you already have." description="Export a clean table from the tool you use today. BizLens registers the file first; analysis comes later, with no silent assumptions." />
    <div className="upload-layout">
      <div>
        <label className="dropzone card" htmlFor="input-file-upload" data-testid="dropzone-upload">
          <div className="upload-icon"><UploadCloud size={24} /></div>
          <h2>{file ? file.name : 'Drop a file here, or browse'}</h2>
          <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ready to register` : 'CSV or XLSX · up to 20 MB'}</p>
          <span className="btn btn-primary"><Paperclip size={14} /> {file ? 'Choose another' : 'Choose file'}</span>
          <input id="input-file-upload" className="file-input" type="file" accept=".csv,.xlsx" onChange={(event) => selectFile(event.target.files?.[0])} data-testid="input-file-upload" />
        </label>
        {error && <div className="demo-note" style={{ background: '#f8dfdb', color: '#974c3e' }} data-testid="status-upload-error"><X size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />{error}</div>}
        {file && !error && <button onClick={submit} className="btn btn-primary" style={{ marginTop: 14, width: '100%' }} disabled={upload.isPending} data-testid="button-register-upload">{upload.isPending ? 'Registering file…' : 'Register this dataset'} <ArrowUpRight size={14} /></button>}
        <div className="demo-note" data-testid="status-demo-boundary"><strong>Demo boundary.</strong> File registration is real. Profiling and analysis are intentionally deferred, so no metric on this screen pretends to be derived from your file yet.</div>
      </div>
      <section className="card rules">
        <div className="eyebrow">A good first export</div>
        <h2>Keep it simple.</h2>
        <div className="rule"><Check size={15} /><span>One row per order, transaction, or customer event.</span></div>
        <div className="rule"><Check size={15} /><span>Include a date column and at least one amount or quantity.</span></div>
        <div className="rule"><Check size={15} /><span>Column names should be in the first row.</span></div>
        <div className="rule"><CircleHelp size={15} /><span>Unsure? Upload what you have. We will flag what needs review.</span></div>
      </section>
    </div>
    <section className="card panel dataset-list"><div className="panel-head"><div><h2>Registered datasets</h2><div className="panel-kicker">Files known to this workspace</div></div><button onClick={() => refetch()} className="btn btn-ghost" data-testid="button-refresh-datasets"><RefreshCw size={14} /> Refresh</button></div>
      {isLoading ? <div className="skeleton" style={{ height: 55 }} /> : isError ? <div className="empty"><div>Could not load datasets.</div><button className="btn btn-ghost" onClick={() => refetch()} data-testid="button-retry-datasets">Try again</button></div> : datasets?.length ? <table className="table"><thead><tr><th>Filename</th><th>Type</th><th>Rows</th><th>Status</th></tr></thead><tbody>{datasets.map((dataset) => <tr key={dataset.id}><td>{dataset.filename}</td><td>{dataset.file_type.toUpperCase()}</td><td>{dataset.row_count.toLocaleString()}</td><td><span className={`status ${dataset.status === 'needs_review' ? 'review' : ''}`}>{dataset.status}</span></td></tr>)}</tbody></table> : <div className="empty"><Table2 size={25} /><div>No registered datasets</div><small>Your first upload will appear here.</small></div>}
    </section>
  </div>;
}

function ReportsPage() {
  const { data: datasets } = useListDatasets();
  const datasetId = datasets?.[0]?.id ?? '';
  const { data: report, isLoading } = useGetReport(datasetId, { query: { enabled: Boolean(datasetId), queryKey: getGetReportQueryKey(datasetId) } });
  const cards = report?.metrics?.length ? report.metrics.map((metric) => ({ title: metric.label, value: metric.value, detail: metric.change })) : [
    { title: 'Revenue pulse', value: '$48,260', detail: 'Illustrative trend' },
    { title: 'Customer mix', value: '34.6%', detail: 'Illustrative retention' },
    { title: 'Order shape', value: '$37.58', detail: 'Illustrative average' },
    { title: 'Growth signals', value: '+12.4%', detail: 'Illustrative change' },
  ];
  return <div className="page"><PageHead eyebrow="Reports · a starting point" title="A home for the deeper read." description="These report surfaces are ready for real analysis. For now, they show the kinds of questions BizLens will help you answer—clearly marked, never overconfident." action={<Link href="/ask" className="btn btn-primary" data-testid="button-open-ask"><MessageSquare size={14} /> Ask BizLens</Link>} />
    <div className="reports-grid">{cards.map((card, i) => <section key={card.title} className={`card report-card fade-up ${i === 0 ? 'featured' : ''}`} style={{ animationDelay: `${i * .06}s` }} data-testid={`card-report-${i}`}><div className="eyebrow">{i === 0 ? 'Headline' : 'Future report'}</div><h2>{card.title}</h2><div className="metric-value">{card.value}</div><div className="mini-chart">{[42, 57, 38, 70, 61, 82, 74, 91].map((height, index) => <div className="bar" key={index} style={{ height: `${height}%` }} />)}</div><div className="report-foot">{card.detail} · {isLoading ? 'Loading dataset' : datasetId ? 'Based on registered data' : 'Demo only'}</div></section>)}</div>
    <div className="demo-note" style={{ marginTop: 16 }} data-testid="status-reports-demo"><strong>What you are seeing:</strong> illustrative report scaffolding. {report?.message ?? 'Connect a dataset to make future reports accountable to your own numbers.'}</div>
  </div>;
}

function AskPage() {
  const { data: datasets } = useListDatasets();
  const ask = useAskQuestion();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<QuestionResponse[]>([]);
  const submit = (value = question) => {
    const clean = value.trim();
    if (!clean || ask.isPending) return;
    setQuestion('');
    ask.mutate({ data: { question: clean, dataset_id: datasets?.[0]?.id } }, { onSuccess: (response) => setMessages((previous) => [...previous, response]), onError: () => setMessages((previous) => [...previous, { question: clean, answer: 'I could not reach the demo analyst just now. Try again in a moment.', demo: true }]) });
  };
  return <div className="page"><PageHead eyebrow="Ask BizLens" title="A second set of eyes for your numbers." description="Ask in plain language. Get a clear next step—not a wall of jargon. Answers are labeled when they are illustrative." />
    <div className="ask-layout">
      <aside className="card questions"><div className="eyebrow">Try asking</div><h3>Start somewhere useful.</h3><div className="question-list">{demoQuestions.map((item) => <button className="question-chip" key={item} onClick={() => submit(item)} data-testid={`button-question-${item.slice(0, 8).replaceAll(' ', '-')}`}>{item}<ChevronRight size={13} style={{ float: 'right', marginTop: 2 }} /></button>)}</div><div className="demo-note"><strong>Demo answers.</strong> Until a full analysis service is connected, responses are illustrative and clearly labeled.</div></aside>
      <section className="card chat"><div className="messages">
        <div className="message assistant"><span className="message-tag">BizLens · ready to help</span>{datasets?.length ? `I can ground the conversation in ${datasets[0].filename}. What would you like to understand first?` : 'I can show you how the conversation will work. Connect a dataset when you are ready for answers grounded in your business.'}</div>
        {messages.map((message, index) => <div key={`${message.question}-${index}`}><div className="message user">{message.question}</div><div className="message assistant" style={{ marginTop: 8 }}><span className="message-tag">{message.demo ? 'Illustrative answer' : 'BizLens answer'}</span>{message.answer}</div></div>)}
        {ask.isPending && <div className="message assistant"><span className="message-tag">Reading the question</span><div className="skeleton" style={{ width: 190 }} /></div>}
      </div><form className="ask-form" onSubmit={(event) => { event.preventDefault(); submit(); }}><input value={question} onChange={(event) => setQuestion(event.target.value)} className="ask-input" placeholder="Try: what changed this month?" aria-label="Ask BizLens a question" data-testid="input-ask-question" /><button type="submit" className="btn btn-primary" disabled={!question.trim() || ask.isPending} data-testid="button-submit-question"><Send size={14} /> Ask</button></form></section>
    </div>
  </div>;
}

function Router() {
  return <ErrorBoundary resetKey={useLocation()[0]}><Shell><Switch><Route path="/" component={Dashboard} /><Route path="/upload" component={UploadPage} /><Route path="/reports" component={ReportsPage} /><Route path="/ask" component={AskPage} /><Route component={NotFound} /></Switch></Shell></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;