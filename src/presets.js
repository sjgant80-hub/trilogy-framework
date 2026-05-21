// ═══════════════════════════════════════════════════════════════
// Pipeline Presets — ready-made Input→Intelligence→Output flows
// ═══════════════════════════════════════════════════════════════

const presets = {

  // ─── RECEIPT → CONTENT ──────────────────────────────────────

  /** Parse receipt → research merchant → generate expense blog */
  receiptToBlog: (trilogy, receiptInput, options = {}) =>
    trilogy.pipeline()
      .name('receipt-to-blog')
      .parseReceipt(receiptInput)
      .research(ctx => `Tell me about ${ctx.document?.merchant || 'this business'}: history, reputation, what they're known for`)
      .blog(ctx => ({
        topic: `${ctx.document?.merchant || 'Purchase'} — expense breakdown and merchant spotlight`,
        context: `Receipt total: ${ctx.document?.total || 'unknown'}. Items: ${JSON.stringify(ctx.document?.items || [])}. Research: ${typeof ctx.research === 'string' ? ctx.research.slice(0, 500) : JSON.stringify(ctx.research).slice(0, 500)}`,
        ...options,
      })),

  /** Parse receipt → generate social post about the purchase */
  receiptToSocial: (trilogy, receiptInput, options = {}) =>
    trilogy.pipeline()
      .name('receipt-to-social')
      .parseReceipt(receiptInput)
      .social(ctx => ({
        topic: `Just spent ${ctx.document?.total || '$$'} at ${ctx.document?.merchant || 'a store'}`,
        context: `Items: ${JSON.stringify(ctx.document?.items || [])}`,
        tone: 'casual',
        ...options,
      })),

  // ─── RESEARCH → CONTENT ─────────────────────────────────────

  /** Deep research → generate Twitter thread */
  researchToThread: (trilogy, query, options = {}) =>
    trilogy.pipeline()
      .name('research-to-thread')
      .research(query)
      .thread(ctx => ({
        topic: typeof query === 'function' ? 'Research findings' : query,
        context: typeof ctx.research === 'string' ? ctx.research.slice(0, 2000) : JSON.stringify(ctx.research).slice(0, 2000),
        tone: 'authoritative',
        ...options,
      })),

  /** Deep research → generate blog post */
  researchToBlog: (trilogy, query, options = {}) =>
    trilogy.pipeline()
      .name('research-to-blog')
      .researchDeep(query)
      .blog(ctx => ({
        topic: typeof query === 'function' ? 'Research report' : query,
        context: typeof ctx.research === 'string' ? ctx.research.slice(0, 3000) : JSON.stringify(ctx.research).slice(0, 3000),
        length: '2000 words',
        ...options,
      })),

  /** Quick research → generate email newsletter */
  researchToEmail: (trilogy, query, options = {}) =>
    trilogy.pipeline()
      .name('research-to-email')
      .research(query)
      .email(ctx => ({
        topic: `Newsletter: ${typeof query === 'function' ? 'Latest findings' : query}`,
        context: typeof ctx.research === 'string' ? ctx.research.slice(0, 1500) : JSON.stringify(ctx.research).slice(0, 1500),
        tone: 'informative',
        ...options,
      })),

  // ─── INVOICE → REPORT ──────────────────────────────────────

  /** Parse invoice → research vendor → generate professional report */
  invoiceToReport: (trilogy, invoiceInput, options = {}) =>
    trilogy.pipeline()
      .name('invoice-to-report')
      .parseInvoice(invoiceInput)
      .research(ctx => `Company profile: ${ctx.document?.vendor || ctx.document?.from || 'vendor'} — credibility, reviews, industry standing`)
      .blog(ctx => ({
        topic: `Vendor Assessment Report: ${ctx.document?.vendor || ctx.document?.from || 'Unknown Vendor'}`,
        context: `Invoice amount: ${ctx.document?.total || 'unknown'}. Line items: ${JSON.stringify(ctx.document?.items || [])}. Vendor research: ${typeof ctx.research === 'string' ? ctx.research.slice(0, 500) : ''}`,
        tone: 'professional',
        ...options,
      })),

  // ─── FACT-CHECK → CONTENT ──────────────────────────────────

  /** Fact-check claims → generate thread debunking/confirming */
  factCheckToThread: (trilogy, claims, options = {}) =>
    trilogy.pipeline()
      .name('factcheck-to-thread')
      .factCheck(claims)
      .thread(ctx => ({
        topic: 'Fact Check Results',
        context: `Claims checked: ${JSON.stringify(ctx.fact_check?.map(c => ({ claim: c.claim, verdict: c.verdict })) || [])}`,
        tone: 'educational',
        ...options,
      })),

  // ─── COMPARE → CONTENT ─────────────────────────────────────

  /** Compare entities → generate blog comparing them */
  compareToBlog: (trilogy, entities, aspects, options = {}) =>
    trilogy.pipeline()
      .name('compare-to-blog')
      .compare(entities, aspects)
      .blog(ctx => ({
        topic: `${Array.isArray(entities) ? entities.join(' vs ') : 'Comparison'}: Which is best?`,
        context: JSON.stringify(ctx.comparison || {}).slice(0, 2000),
        tone: 'balanced',
        ...options,
      })),

  /** Compare entities → generate social post with winner */
  compareToSocial: (trilogy, entities, aspects, options = {}) =>
    trilogy.pipeline()
      .name('compare-to-social')
      .compare(entities, aspects)
      .social(ctx => ({
        topic: `${Array.isArray(entities) ? entities.join(' vs ') : 'Comparison'} showdown`,
        context: `Recommendation: ${ctx.comparison?.overall_recommendation || 'See comparison'}. Summary: ${ctx.comparison?.summary || ''}`,
        tone: 'engaging',
        ...options,
      })),

  // ─── EXTRACT → CONTENT ─────────────────────────────────────

  /** Extract data from URL → generate blog post about it */
  extractToBlog: (trilogy, url, options = {}) =>
    trilogy.pipeline()
      .name('extract-to-blog')
      .extract(url)
      .blog(ctx => ({
        topic: `Analysis of ${typeof url === 'function' ? 'extracted content' : url}`,
        context: JSON.stringify(ctx.extracted || {}).slice(0, 2000),
        ...options,
      })),

  /** Extract data from URL → repurpose into multiple formats */
  extractToRepurpose: (trilogy, url, targetTypes, options = {}) =>
    trilogy.pipeline()
      .name('extract-to-repurpose')
      .extract(url)
      .repurpose(ctx => JSON.stringify(ctx.extracted || {}), {
        targetTypes: targetTypes || ['twitter_thread', 'linkedin_post', 'email', 'instagram_caption'],
        ...options,
      }),

  // ─── CONTRACT → ANALYSIS ───────────────────────────────────

  /** Parse contract → research key terms → generate summary email */
  contractToEmail: (trilogy, contractInput, options = {}) =>
    trilogy.pipeline()
      .name('contract-to-email')
      .parseContract(contractInput)
      .research(ctx => `Legal terms explained simply: ${(ctx.document?.key_terms || ctx.document?.clauses || []).slice(0, 5).join(', ')}`)
      .email(ctx => ({
        topic: `Contract Summary: ${ctx.document?.title || ctx.document?.parties?.[0] || 'Agreement Review'}`,
        context: `Parties: ${JSON.stringify(ctx.document?.parties || [])}. Key terms: ${JSON.stringify(ctx.document?.key_terms || [])}. Research: ${typeof ctx.research === 'string' ? ctx.research.slice(0, 500) : ''}`,
        tone: 'professional',
        ...options,
      })),

  // ─── BANK STATEMENT → REPORT ───────────────────────────────

  /** Parse bank statement → generate financial summary blog */
  statementToReport: (trilogy, statementInput, options = {}) =>
    trilogy.pipeline()
      .name('statement-to-report')
      .parseBankStatement(statementInput)
      .blog(ctx => ({
        topic: `Financial Summary: ${ctx.document?.account_holder || 'Account'} — ${ctx.document?.period || 'Statement Period'}`,
        context: `Balance: ${ctx.document?.closing_balance || 'N/A'}. Transactions: ${ctx.document?.transaction_count || 'N/A'}. Categories: ${JSON.stringify(ctx.document?.categories || {})}`,
        tone: 'professional',
        ...options,
      })),

  // ─── CONTENT → CONTENT (Improve + Repurpose) ──────────────

  /** Take raw content → SEO optimize → improve → repurpose into all formats */
  contentBlitz: (trilogy, content, options = {}) =>
    trilogy.pipeline()
      .name('content-blitz')
      .context({ raw_content: content })
      .seo(ctx => ({ content: ctx.raw_content, ...options }))
      .improve(ctx => ctx.raw_content, { goals: ['clarity', 'engagement', 'seo'], ...options })
      .repurpose(ctx => ctx.improved || ctx.raw_content, {
        targetTypes: ['twitter_thread', 'linkedin_post', 'email', 'instagram_caption', 'blog_post'],
        ...options,
      }),

  // ─── MULTI-PARALLEL PIPELINES ──────────────────────────────

  /** Research a topic → generate blog + thread + social in parallel */
  researchToAll: (trilogy, query, options = {}) =>
    trilogy.pipeline()
      .name('research-to-all')
      .research(query)
      .parallel(
        p => p.blog(ctx => ({
          topic: typeof query === 'function' ? 'Research findings' : query,
          context: typeof ctx.research === 'string' ? ctx.research.slice(0, 2000) : JSON.stringify(ctx.research).slice(0, 2000),
          ...options,
        })),
        p => p.thread(ctx => ({
          topic: typeof query === 'function' ? 'Research findings' : query,
          context: typeof ctx.research === 'string' ? ctx.research.slice(0, 1000) : JSON.stringify(ctx.research).slice(0, 1000),
          ...options,
        })),
        p => p.social(ctx => ({
          topic: typeof query === 'function' ? 'Research findings' : query,
          context: typeof ctx.research === 'string' ? ctx.research.slice(0, 500) : JSON.stringify(ctx.research).slice(0, 500),
          tone: 'engaging',
          ...options,
        }))
      ),
};

module.exports = { presets };
