// ═══════════════════════════════════════════════════════════════
// Pipeline Engine — declarative Input→Intelligence→Output flows
// ═══════════════════════════════════════════════════════════════

class Pipeline {
  constructor(trilogy) {
    this.trilogy = trilogy;
    this.steps = [];
    this._onStep = null;
    this._onError = null;
    this._context = {};
    this._name = 'unnamed';
  }

  /** Name the pipeline for logging */
  name(n) { this._name = n; return this; }

  /** Subscribe to step events */
  onStep(fn) { this._onStep = fn; return this; }

  /** Subscribe to errors (non-fatal) */
  onError(fn) { this._onError = fn; return this; }

  /** Inject initial context */
  context(ctx) { this._context = { ...this._context, ...ctx }; return this; }

  // ─── INPUT steps (DocMind) ────────────────────────────────

  /** Parse a document — result goes into ctx as 'document' */
  parse(type, input, options = {}) {
    this.steps.push({
      phase: 'input',
      name: `parse.${type}`,
      run: async (ctx) => {
        const result = await this.trilogy.docmind.parse[type](
          typeof input === 'function' ? input(ctx) : input,
          options
        );
        return { document: result.data, _parse_meta: result.meta };
      },
    });
    return this;
  }

  /** Parse receipt */
  parseReceipt(input, opts) { return this.parse('receipt', input, opts); }
  parseInvoice(input, opts) { return this.parse('invoice', input, opts); }
  parseBankStatement(input, opts) { return this.parse('bankStatement', input, opts); }
  parseContract(input, opts) { return this.parse('contract', input, opts); }

  /** Chat via DocMind LLM gateway */
  chat(messages, options = {}) {
    this.steps.push({
      phase: 'input',
      name: 'chat',
      run: async (ctx) => {
        const msgs = typeof messages === 'function' ? messages(ctx) : messages;
        const result = await this.trilogy.docmind.chat(msgs, options);
        return { chat_response: result.response, _chat_meta: result.meta };
      },
    });
    return this;
  }

  // ─── INTELLIGENCE steps (Deep) ────────────────────────────

  /** Run deep research — result goes into ctx as 'research' */
  research(query, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'research',
      run: async (ctx) => {
        const q = typeof query === 'function' ? query(ctx) : query;
        const result = await this.trilogy.deep.quick(q, options);
        return { research: result.report || result, _research_meta: result.meta };
      },
    });
    return this;
  }

  /** Deep research with streaming */
  researchDeep(query, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'research.deep',
      run: async (ctx) => {
        const q = typeof query === 'function' ? query(ctx) : query;
        const task = await this.trilogy.deep.research(q, { depth: 'deep', ...options });
        const result = await task.wait(options.pollInterval || 2000);
        return { research: result.result?.report || result.result, _research_meta: result.result?.meta };
      },
    });
    return this;
  }

  /** Fact-check claims */
  factCheck(claims, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'factCheck',
      run: async (ctx) => {
        const c = typeof claims === 'function' ? claims(ctx) : claims;
        const result = await this.trilogy.deep.factCheck(c, options);
        return { fact_check: result.claims, _factcheck_meta: result.meta };
      },
    });
    return this;
  }

  /** Compare entities */
  compare(entities, aspects, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'compare',
      run: async (ctx) => {
        const e = typeof entities === 'function' ? entities(ctx) : entities;
        const a = typeof aspects === 'function' ? aspects(ctx) : aspects;
        const result = await this.trilogy.deep.compare(e, a, options);
        return { comparison: result.comparison, _compare_meta: result.meta };
      },
    });
    return this;
  }

  /** Extract data from URL */
  extract(url, schema, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'extract',
      run: async (ctx) => {
        const u = typeof url === 'function' ? url(ctx) : url;
        const result = await this.trilogy.deep.extract(u, schema, options);
        return { extracted: result.data, _extract_meta: result.meta };
      },
    });
    return this;
  }

  // ─── OUTPUT steps (Flux) ──────────────────────────────────

  /** Generate content — result goes into ctx as 'content' */
  generate(type, brief, options = {}) {
    this.steps.push({
      phase: 'output',
      name: `generate.${type}`,
      run: async (ctx) => {
        const b = typeof brief === 'function' ? brief(ctx) : brief;
        const result = await this.trilogy.flux.generate[type](b, options);
        return { content: result.content, _generate_meta: result.meta };
      },
    });
    return this;
  }

  /** Generate blog post */
  blog(brief, opts) { return this.generate('blog', brief, opts); }
  thread(brief, opts) { return this.generate('thread', brief, opts); }
  social(brief, opts) { return this.generate('social', brief, opts); }
  email(brief, opts) { return this.generate('email', brief, opts); }
  ads(brief, opts) { return this.generate('ads', brief, opts); }
  product(brief, opts) { return this.generate('product', brief, opts); }
  landing(brief, opts) { return this.generate('landing', brief, opts); }

  /** Repurpose content into many formats */
  repurpose(content, options = {}) {
    this.steps.push({
      phase: 'output',
      name: 'repurpose',
      run: async (ctx) => {
        const c = typeof content === 'function' ? content(ctx) : content;
        const result = await this.trilogy.flux.repurpose(c, options);
        return { repurposed: result.content, _repurpose_meta: result.meta };
      },
    });
    return this;
  }

  /** Improve content */
  improve(content, options = {}) {
    this.steps.push({
      phase: 'output',
      name: 'improve',
      run: async (ctx) => {
        const c = typeof content === 'function' ? content(ctx) : content;
        const result = await this.trilogy.flux.improve(c, options);
        return { improved: result.content, _improve_meta: result.meta };
      },
    });
    return this;
  }

  /** SEO analysis */
  seo(params, options = {}) {
    this.steps.push({
      phase: 'intelligence',
      name: 'seo',
      run: async (ctx) => {
        const p = typeof params === 'function' ? params(ctx) : params;
        const result = await this.trilogy.flux.seo(p, options);
        return { seo: result.analysis, _seo_meta: result.meta };
      },
    });
    return this;
  }

  // ─── CONTROL FLOW ─────────────────────────────────────────

  /** Transform context between steps */
  transform(fn) {
    this.steps.push({
      phase: 'transform',
      name: 'transform',
      run: async (ctx) => {
        const result = fn(ctx);
        return result instanceof Promise ? await result : result;
      },
    });
    return this;
  }

  /** Conditional step — only runs if predicate returns true */
  when(predicate, builderFn) {
    const subPipeline = new Pipeline(this.trilogy);
    builderFn(subPipeline);
    this.steps.push({
      phase: 'control',
      name: 'when',
      run: async (ctx) => {
        if (predicate(ctx)) {
          for (const step of subPipeline.steps) {
            const result = await step.run(ctx);
            if (result) Object.assign(ctx, result);
          }
        }
        return {};
      },
    });
    return this;
  }

  /** Run multiple steps in parallel — results merged into context */
  parallel(...builderFns) {
    this.steps.push({
      phase: 'control',
      name: 'parallel',
      run: async (ctx) => {
        const pipelines = builderFns.map(fn => {
          const p = new Pipeline(this.trilogy);
          fn(p);
          return p;
        });

        const results = await Promise.all(
          pipelines.map(async (p) => {
            const subCtx = { ...ctx };
            for (const step of p.steps) {
              const result = await step.run(subCtx);
              if (result) Object.assign(subCtx, result);
            }
            return subCtx;
          })
        );

        // Merge all results
        const merged = {};
        for (const r of results) {
          for (const [k, v] of Object.entries(r)) {
            if (!(k in ctx)) merged[k] = v; // only new keys
          }
        }
        return merged;
      },
    });
    return this;
  }

  /** Loop over an array in context */
  each(arrayKey, builderFn) {
    this.steps.push({
      phase: 'control',
      name: `each(${arrayKey})`,
      run: async (ctx) => {
        const arr = ctx[arrayKey];
        if (!Array.isArray(arr)) return {};
        const results = [];
        for (let i = 0; i < arr.length; i++) {
          const subPipeline = new Pipeline(this.trilogy);
          builderFn(subPipeline);
          const itemCtx = { ...ctx, item: arr[i], index: i };
          for (const step of subPipeline.steps) {
            const result = await step.run(itemCtx);
            if (result) Object.assign(itemCtx, result);
          }
          results.push(itemCtx);
        }
        return { [`${arrayKey}_results`]: results };
      },
    });
    return this;
  }

  /** Add a side effect (logging, webhooks, saves) without modifying context */
  tap(fn) {
    this.steps.push({
      phase: 'tap',
      name: 'tap',
      run: async (ctx) => { await fn(ctx); return {}; },
    });
    return this;
  }

  // ─── EXECUTION ────────────────────────────────────────────

  /** Execute the pipeline — returns final context */
  async run(initialContext = {}) {
    const ctx = { ...this._context, ...initialContext };
    const timeline = [];
    const t0 = Date.now();

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stepStart = Date.now();

      if (this._onStep) {
        this._onStep({
          pipeline: this._name,
          phase: step.phase,
          step: step.name,
          index: i,
          total: this.steps.length,
          elapsed_ms: stepStart - t0,
        });
      }

      try {
        const result = await step.run(ctx);
        if (result) Object.assign(ctx, result);

        timeline.push({
          step: step.name,
          phase: step.phase,
          duration_ms: Date.now() - stepStart,
          status: 'ok',
        });
      } catch (err) {
        timeline.push({
          step: step.name,
          phase: step.phase,
          duration_ms: Date.now() - stepStart,
          status: 'error',
          error: err.message,
        });

        if (this._onError) {
          this._onError(err, step, ctx);
        } else {
          throw err;
        }
      }
    }

    ctx._pipeline = {
      name: this._name,
      steps: timeline,
      total_ms: Date.now() - t0,
      step_count: this.steps.length,
    };

    return ctx;
  }
}

module.exports = { Pipeline };
