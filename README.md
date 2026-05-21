# trilogy-framework

**The AI Pipeline Framework.** Input → Intelligence → Output as one declarative flow.

```
npm install trilogy-framework
```

## The Idea

Three API calls is three API calls. A pipeline is *one thought*.

```javascript
const { Trilogy } = require('trilogy-framework');

const t = new Trilogy({
  docmind: 'dm_p_...',
  deep: 'deep_p_...',
  flux: 'flux_p_...',
}, {
  docmindUrl: 'https://your-docmind.railway.app',
  deepUrl: 'https://your-deep.railway.app',
  fluxUrl: 'https://your-flux.railway.app',
});

// Receipt → research the merchant → write a blog post about it
const result = await t.pipeline()
  .name('receipt-to-blog')
  .parseReceipt('./receipt.jpg')
  .research(ctx => `Tell me about ${ctx.document.merchant}`)
  .blog(ctx => `Expense spotlight: ${ctx.document.merchant}`)
  .run();

console.log(result.content);    // blog post
console.log(result.document);   // parsed receipt
console.log(result.research);   // merchant research
console.log(result._pipeline);  // timing + step metadata
```

## Presets — One-Liners

```javascript
// Receipt → blog
const result = await t.receiptToBlog('./receipt.jpg').run();

// Research → Twitter thread
const result = await t.researchToThread('Why AI agents are replacing SaaS').run();

// Research → blog + thread + social in parallel
const result = await t.researchToAll('MCP protocol explained').run();

// Invoice → vendor research → professional report
const result = await t.invoiceToReport('./invoice.pdf').run();

// Fact-check → thread debunking myths
const result = await t.factCheckToThread([
  'The Great Wall is visible from space',
  'Humans only use 10% of their brain',
]).run();

// Compare → blog post
const result = await t.compareToBlog(
  ['React', 'Vue', 'Svelte'],
  ['performance', 'learning curve', 'ecosystem']
).run();

// Raw content → SEO + improve + repurpose into 5 formats
const result = await t.contentBlitz(myDraftPost).run();

// Contract → key term research → summary email
const result = await t.contractToEmail('./contract.pdf').run();

// Bank statement → financial summary report
const result = await t.statementToReport('./statement.pdf').run();
```

## Custom Pipelines

```javascript
const result = await t.pipeline()
  .name('competitor-intel')
  .research('Top 5 AI document parsing APIs in 2026')
  .compare(
    ctx => ctx.research.key_findings?.slice(0, 5) || ['DocMind', 'AWS Textract', 'Google Document AI'],
    ['pricing', 'accuracy', 'speed', 'developer experience']
  )
  .blog(ctx => ({
    topic: 'AI Document Parsing: Complete Comparison Guide',
    context: JSON.stringify(ctx.comparison),
  }))
  .thread(ctx => ({
    topic: 'Which AI document parser should you use?',
    context: ctx.content?.hook || JSON.stringify(ctx.comparison),
  }))
  .onStep(step => console.log(`[${step.phase}] ${step.step} (${step.elapsed_ms}ms)`))
  .run();
```

## Control Flow

### Conditional Steps

```javascript
t.pipeline()
  .parseReceipt('./receipt.jpg')
  .when(
    ctx => ctx.document.total > 100,
    p => p.research(ctx => `Is ${ctx.document.merchant} overcharging?`)
  )
  .blog(ctx => `Expense report: ${ctx.document.merchant}`)
  .run();
```

### Parallel Execution

```javascript
t.pipeline()
  .research('AI trends 2026')
  .parallel(
    p => p.blog(ctx => ({ topic: 'AI Trends', context: ctx.research })),
    p => p.thread(ctx => ({ topic: 'AI Trends', context: ctx.research })),
    p => p.email(ctx => ({ topic: 'AI Newsletter', context: ctx.research })),
  )
  .run();
```

### Loops

```javascript
t.pipeline()
  .context({ urls: ['https://a.com', 'https://b.com', 'https://c.com'] })
  .each('urls', p => {
    p.extract(ctx => ctx.item)
     .blog(ctx => ({ topic: `Analysis of ${ctx.item}`, context: ctx.extracted }));
  })
  .run();
```

### Transform

```javascript
t.pipeline()
  .parseReceipt('./receipt.jpg')
  .transform(ctx => ({
    summary: `${ctx.document.merchant}: $${ctx.document.total}`,
    items: ctx.document.items.map(i => i.name).join(', '),
  }))
  .blog(ctx => ctx.summary)
  .run();
```

### Side Effects (Tap)

```javascript
t.pipeline()
  .parseReceipt('./receipt.jpg')
  .tap(ctx => saveToDatabase(ctx.document))
  .research(ctx => ctx.document.merchant)
  .tap(ctx => sendWebhook({ document: ctx.document, research: ctx.research }))
  .blog(ctx => ctx.document.merchant)
  .run();
```

## Step Events & Error Handling

```javascript
const result = await t.pipeline()
  .name('my-pipeline')
  .onStep(event => {
    console.log(`[${event.phase}] ${event.step} — step ${event.index + 1}/${event.total}`);
  })
  .onError((err, step, ctx) => {
    console.error(`Step "${step.name}" failed: ${err.message}`);
    // Pipeline continues — error is non-fatal when onError is set
  })
  .parseReceipt('./receipt.jpg')
  .research(ctx => ctx.document.merchant)
  .blog(ctx => ctx.document.merchant)
  .run();

// Execution timeline
console.log(result._pipeline);
// {
//   name: 'my-pipeline',
//   total_ms: 8432,
//   step_count: 3,
//   steps: [
//     { step: 'parse.receipt', phase: 'input', duration_ms: 1200, status: 'ok' },
//     { step: 'research', phase: 'intelligence', duration_ms: 4500, status: 'ok' },
//     { step: 'generate.blog', phase: 'output', duration_ms: 2732, status: 'ok' },
//   ]
// }
```

## Direct Client Access

```javascript
const t = new Trilogy(keys, options);

// Pipeline way
await t.pipeline().parseReceipt(file).run();

// Direct way — same clients
const receipt = await t.docmind.parse.receipt(file);
const report = await t.deep.quick('quantum computing');
const thread = await t.flux.generate.thread('AI trends');

// Aliases
t.input        // → t.docmind
t.intelligence // → t.deep
t.output       // → t.flux
```

## All 15 Presets

| Preset | Flow | Description |
|---|---|---|
| `receiptToBlog` | Input → Intelligence → Output | Receipt → merchant research → blog |
| `receiptToSocial` | Input → Output | Receipt → social post |
| `researchToThread` | Intelligence → Output | Research → Twitter thread |
| `researchToBlog` | Intelligence → Output | Deep research → long-form blog |
| `researchToEmail` | Intelligence → Output | Research → email newsletter |
| `researchToAll` | Intelligence → Output×3 | Research → blog + thread + social (parallel) |
| `invoiceToReport` | Input → Intelligence → Output | Invoice → vendor research → report |
| `factCheckToThread` | Intelligence → Output | Fact-check claims → thread |
| `compareToBlog` | Intelligence → Output | Compare entities → blog |
| `compareToSocial` | Intelligence → Output | Compare entities → social |
| `extractToBlog` | Intelligence → Output | URL extraction → blog |
| `extractToRepurpose` | Intelligence → Output | URL extraction → multi-format |
| `contractToEmail` | Input → Intelligence → Output | Contract → term research → email |
| `statementToReport` | Input → Output | Bank statement → financial summary |
| `contentBlitz` | Output → Output → Output | SEO + improve + repurpose (5 formats) |

## License

MIT
