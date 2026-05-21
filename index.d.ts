// ═══════════════════════════════════════════════════════════════
// trilogy-framework — TypeScript Declarations
// ═══════════════════════════════════════════════════════════════

declare module 'trilogy-framework' {

  import { DocMind, Deep, Flux, ClientOptions } from 'trilogy-sdk';

  // ─── Pipeline ──────────────────────────────────────────────

  interface StepEvent {
    pipeline: string;
    phase: string;
    step: string;
    index: number;
    total: number;
    elapsed_ms: number;
  }

  interface TimelineEntry {
    step: string;
    phase: string;
    duration_ms: number;
    status: 'ok' | 'error';
    error?: string;
  }

  interface PipelineMeta {
    name: string;
    steps: TimelineEntry[];
    total_ms: number;
    step_count: number;
  }

  interface PipelineContext {
    /** Parsed document data (from parse steps) */
    document?: any;
    /** Research results (from research steps) */
    research?: any;
    /** Generated content (from generate steps) */
    content?: any;
    /** Fact-check results */
    fact_check?: any;
    /** Comparison results */
    comparison?: any;
    /** Extracted data */
    extracted?: any;
    /** Repurposed content */
    repurposed?: any;
    /** Improved content */
    improved?: any;
    /** SEO analysis */
    seo?: any;
    /** Chat response */
    chat_response?: any;
    /** Pipeline execution metadata */
    _pipeline?: PipelineMeta;
    /** Any additional context */
    [key: string]: any;
  }

  type ContextResolver<T> = T | ((ctx: PipelineContext) => T);

  class Pipeline {
    constructor(trilogy: Trilogy);

    /** Name the pipeline for logging */
    name(n: string): this;

    /** Subscribe to step events */
    onStep(fn: (event: StepEvent) => void): this;

    /** Subscribe to errors (non-fatal) */
    onError(fn: (err: Error, step: any, ctx: PipelineContext) => void): this;

    /** Inject initial context */
    context(ctx: Partial<PipelineContext>): this;

    // ─── INPUT steps (DocMind) ──────────────────────────────

    /** Parse a document */
    parse(type: string, input: ContextResolver<string | Buffer>, options?: any): this;

    /** Parse receipt */
    parseReceipt(input: ContextResolver<string | Buffer>, options?: any): this;

    /** Parse invoice */
    parseInvoice(input: ContextResolver<string | Buffer>, options?: any): this;

    /** Parse bank statement */
    parseBankStatement(input: ContextResolver<string | Buffer>, options?: any): this;

    /** Parse contract */
    parseContract(input: ContextResolver<string | Buffer>, options?: any): this;

    /** Chat via DocMind LLM gateway */
    chat(messages: ContextResolver<string | any[]>, options?: any): this;

    // ─── INTELLIGENCE steps (Deep) ──────────────────────────

    /** Quick research */
    research(query: ContextResolver<string>, options?: any): this;

    /** Deep research with streaming */
    researchDeep(query: ContextResolver<string>, options?: any): this;

    /** Fact-check claims */
    factCheck(claims: ContextResolver<string | string[]>, options?: any): this;

    /** Compare entities */
    compare(entities: ContextResolver<string[]>, aspects: ContextResolver<string[]>, options?: any): this;

    /** Extract data from URL */
    extract(url: ContextResolver<string>, schema?: object, options?: any): this;

    // ─── OUTPUT steps (Flux) ────────────────────────────────

    /** Generate content of any type */
    generate(type: string, brief: ContextResolver<string | object>, options?: any): this;

    /** Generate blog post */
    blog(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate Twitter thread */
    thread(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate social media post */
    social(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate email */
    email(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate ad copy */
    ads(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate product description */
    product(brief: ContextResolver<string | object>, options?: any): this;

    /** Generate landing page copy */
    landing(brief: ContextResolver<string | object>, options?: any): this;

    /** Repurpose content into many formats */
    repurpose(content: ContextResolver<string>, options?: any): this;

    /** Improve content */
    improve(content: ContextResolver<string>, options?: any): this;

    /** SEO analysis */
    seo(params: ContextResolver<object>, options?: any): this;

    // ─── CONTROL FLOW ───────────────────────────────────────

    /** Transform context between steps */
    transform(fn: (ctx: PipelineContext) => Partial<PipelineContext> | Promise<Partial<PipelineContext>>): this;

    /** Conditional step — only runs if predicate returns true */
    when(predicate: (ctx: PipelineContext) => boolean, builderFn: (pipeline: Pipeline) => void): this;

    /** Run multiple steps in parallel */
    parallel(...builderFns: Array<(pipeline: Pipeline) => void>): this;

    /** Loop over an array in context */
    each(arrayKey: string, builderFn: (pipeline: Pipeline) => void): this;

    /** Side effect without modifying context */
    tap(fn: (ctx: PipelineContext) => void | Promise<void>): this;

    // ─── EXECUTION ──────────────────────────────────────────

    /** Execute the pipeline — returns final context */
    run(initialContext?: Partial<PipelineContext>): Promise<PipelineContext>;
  }

  // ─── Trilogy (Main Class) ──────────────────────────────────

  interface TrilogyKeys {
    docmind?: string;
    deep?: string;
    flux?: string;
  }

  interface TrilogyOptions extends ClientOptions {
    docmindUrl?: string;
    deepUrl?: string;
    fluxUrl?: string;
  }

  class Trilogy {
    docmind: DocMind | null;
    deep: Deep | null;
    flux: Flux | null;

    constructor(keys?: TrilogyKeys, options?: TrilogyOptions);

    /** Create a new pipeline */
    pipeline(): Pipeline;

    /** Alias: DocMind client */
    readonly input: DocMind | null;
    /** Alias: Deep client */
    readonly intelligence: Deep | null;
    /** Alias: Flux client */
    readonly output: Flux | null;

    // ─── Preset Pipelines ───────────────────────────────────

    /** Parse receipt → research merchant → blog post */
    receiptToBlog(receiptInput: string | Buffer, options?: any): Pipeline;

    /** Parse receipt → social media post */
    receiptToSocial(receiptInput: string | Buffer, options?: any): Pipeline;

    /** Research query → Twitter thread */
    researchToThread(query: string, options?: any): Pipeline;

    /** Research query → blog post */
    researchToBlog(query: string, options?: any): Pipeline;

    /** Research query → email newsletter */
    researchToEmail(query: string, options?: any): Pipeline;

    /** Parse invoice → vendor research → report */
    invoiceToReport(invoiceInput: string | Buffer, options?: any): Pipeline;

    /** Fact-check claims → thread */
    factCheckToThread(claims: string | string[], options?: any): Pipeline;

    /** Compare entities → blog */
    compareToBlog(entities: string[], aspects?: string[], options?: any): Pipeline;

    /** Compare entities → social post */
    compareToSocial(entities: string[], aspects?: string[], options?: any): Pipeline;

    /** Extract URL data → blog */
    extractToBlog(url: string, options?: any): Pipeline;

    /** Extract URL data → repurpose into many formats */
    extractToRepurpose(url: string, targetTypes?: string[], options?: any): Pipeline;

    /** Parse contract → research terms → summary email */
    contractToEmail(contractInput: string | Buffer, options?: any): Pipeline;

    /** Parse bank statement → financial summary */
    statementToReport(statementInput: string | Buffer, options?: any): Pipeline;

    /** Content → SEO + improve + repurpose into all formats */
    contentBlitz(content: string, options?: any): Pipeline;

    /** Research → blog + thread + social in parallel */
    researchToAll(query: string, options?: any): Pipeline;
  }

  // ─── Presets Object ────────────────────────────────────────

  interface Presets {
    receiptToBlog(trilogy: Trilogy, receiptInput: string | Buffer, options?: any): Pipeline;
    receiptToSocial(trilogy: Trilogy, receiptInput: string | Buffer, options?: any): Pipeline;
    researchToThread(trilogy: Trilogy, query: string, options?: any): Pipeline;
    researchToBlog(trilogy: Trilogy, query: string, options?: any): Pipeline;
    researchToEmail(trilogy: Trilogy, query: string, options?: any): Pipeline;
    invoiceToReport(trilogy: Trilogy, invoiceInput: string | Buffer, options?: any): Pipeline;
    factCheckToThread(trilogy: Trilogy, claims: string | string[], options?: any): Pipeline;
    compareToBlog(trilogy: Trilogy, entities: string[], aspects?: string[], options?: any): Pipeline;
    compareToSocial(trilogy: Trilogy, entities: string[], aspects?: string[], options?: any): Pipeline;
    extractToBlog(trilogy: Trilogy, url: string, options?: any): Pipeline;
    extractToRepurpose(trilogy: Trilogy, url: string, targetTypes?: string[], options?: any): Pipeline;
    contractToEmail(trilogy: Trilogy, contractInput: string | Buffer, options?: any): Pipeline;
    statementToReport(trilogy: Trilogy, statementInput: string | Buffer, options?: any): Pipeline;
    contentBlitz(trilogy: Trilogy, content: string, options?: any): Pipeline;
    researchToAll(trilogy: Trilogy, query: string, options?: any): Pipeline;
  }

  const presets: Presets;

  export { Trilogy, Pipeline, presets, PipelineContext, StepEvent, TimelineEntry, PipelineMeta, TrilogyKeys, TrilogyOptions };
}
