// ═══════════════════════════════════════════════════════════════
// trilogy-framework — Input → Intelligence → Output as one flow
// ═══════════════════════════════════════════════════════════════

const { createTrilogy } = require('trilogy-sdk');
const { Pipeline } = require('./src/pipeline');
const { presets } = require('./src/presets');

class Trilogy {
  /**
   * @param {object} keys - API keys: { docmind, deep, flux }
   * @param {object} options - URLs + shared options
   */
  constructor(keys = {}, options = {}) {
    const clients = createTrilogy(keys, options);
    this.docmind = clients.docmind;
    this.deep = clients.deep;
    this.flux = clients.flux;
    this._options = options;
  }

  // ─── Pipeline Factory ──────────────────────────────────────

  /** Create a new pipeline */
  pipeline() {
    return new Pipeline(this);
  }

  // ─── Preset Pipelines ─────────────────────────────────────

  /** Parse receipt → research merchant → blog post */
  receiptToBlog(receiptInput, options) {
    return presets.receiptToBlog(this, receiptInput, options);
  }

  /** Parse receipt → social media post */
  receiptToSocial(receiptInput, options) {
    return presets.receiptToSocial(this, receiptInput, options);
  }

  /** Research query → Twitter thread */
  researchToThread(query, options) {
    return presets.researchToThread(this, query, options);
  }

  /** Research query → blog post */
  researchToBlog(query, options) {
    return presets.researchToBlog(this, query, options);
  }

  /** Research query → email newsletter */
  researchToEmail(query, options) {
    return presets.researchToEmail(this, query, options);
  }

  /** Parse invoice → vendor research → report */
  invoiceToReport(invoiceInput, options) {
    return presets.invoiceToReport(this, invoiceInput, options);
  }

  /** Fact-check claims → thread */
  factCheckToThread(claims, options) {
    return presets.factCheckToThread(this, claims, options);
  }

  /** Compare entities → blog */
  compareToBlog(entities, aspects, options) {
    return presets.compareToBlog(this, entities, aspects, options);
  }

  /** Compare entities → social post */
  compareToSocial(entities, aspects, options) {
    return presets.compareToSocial(this, entities, aspects, options);
  }

  /** Extract URL data → blog */
  extractToBlog(url, options) {
    return presets.extractToBlog(this, url, options);
  }

  /** Extract URL data → repurpose into many formats */
  extractToRepurpose(url, targetTypes, options) {
    return presets.extractToRepurpose(this, url, targetTypes, options);
  }

  /** Parse contract → research terms → summary email */
  contractToEmail(contractInput, options) {
    return presets.contractToEmail(this, contractInput, options);
  }

  /** Parse bank statement → financial summary */
  statementToReport(statementInput, options) {
    return presets.statementToReport(this, statementInput, options);
  }

  /** Content → SEO + improve + repurpose into all formats */
  contentBlitz(content, options) {
    return presets.contentBlitz(this, content, options);
  }

  /** Research → blog + thread + social in parallel */
  researchToAll(query, options) {
    return presets.researchToAll(this, query, options);
  }

  // ─── Direct Client Access ─────────────────────────────────

  /** Get the DocMind client directly */
  get input() { return this.docmind; }

  /** Get the Deep client directly */
  get intelligence() { return this.deep; }

  /** Get the Flux client directly */
  get output() { return this.flux; }
}

module.exports = { Trilogy, Pipeline, presets };
