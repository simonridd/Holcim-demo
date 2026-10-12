HOLCIM SUMMARY TO QUOTE

PUBLIC ROUTE
quote/index.html is a static route. On the existing GitHub Pages project,
the route is <published site base>/quote/ (for example /Holcim-demo/quote/).
The /quote URL redirects to /quote/ through normal directory hosting.
It does not require presenter setup or Genesys authentication. The homepage
now links to it using a relative URL, preserving the GitHub Pages project base.

USE
1. Copy the complete generated Holcim Sales Order Summary or Holcim Servicing
   Order Summary and paste it into Custom summary output.
2. Select Create quote. The generated document is brought into view. A summary
   without prices produces an explicitly unpriced draft, which can still be
   printed. Add pricing opens the first missing material rate for entry.
   Review all extracted details. Requested dates remain separate from confirmed
   dates. No demonstration rate is automatically inserted.
3. Confirm quantities, pricing units, currency, VAT basis/rate and all charges.
   Unknown values remain unknown. Enter zero only for explicitly absent charges.
4. Print / Save PDF opens the browser print dialog; choose Save as PDF.
   The editor is hidden when printing. The draft/demo wording remains visible.

This is a browser-local draft editor, not an automated Genesys API integration.
It does not issue a quote, place an order, store/share customer summaries or
generate public URLs containing customer information. Reloading clears the draft.
The quote page has no external scripts or Messenger embed.

SUMMARY FORMAT
The live Holcim Sales and Servicing custom prompts were updated on 12 October
2026 to use these exact labels, one label per line. Both saves returned
Configuration updated. The Sales preview was tested with fictional two-material
data and produced this structure. Servicing keeps original order details separate
from the requested replacement material lines.

Customer: ...
Company: ...
Project: ...
Site postcode: ...
Status: ...
Currency: GBP (only if explicitly stated; otherwise Not discussed)
Price basis: Excluding VAT / Including VAT / Not discussed
VAT rate: ...%
Delivery charge: GBP ... excluding VAT (only if stated)
Other charges: ...
Valid until: ...
Payment terms: ...
Purchase reference: ...
Quote reference: ...
Order reference: ...

MATERIALS
| Product | Quantity | Unit | Specification | Unit price | Price basis |
| --- | --- | --- | --- | --- | --- |
| ... | ... | ... | ... | ... | ... |

Requested delivery: ...
Confirmed delivery: ...
Delivery window: ...
Site access: ...

OUTSTANDING CHECKS
...
NEXT ACTIONS
...
EXISTING ORDER CONTEXT
...

Missing fields use Not discussed. Monetary unit prices retain their explicit
currency and pricing unit. Relative dates remain as stated unless resolvable
from trusted context. Original servicing order prices are not replacement prices.
Only explicitly verified quote/order references are recorded. The prompts retain
the existing safeguards against invented approvals, reservations, completed
actions or business-system updates and omit unnecessary personal contact details.

IMPORT AND ARITHMETIC
The deterministic parser reads labelled fields and Markdown material tables;
it does not interpret arbitrary prose with AI. Old free-form summaries may need
to be regenerated or completed in the editor. Original source text stays in the
input for comparison. Notes, including existing order tables, do not become new
quote lines. Unknown or ambiguous prices, pricing units, charges, tax bases and
currencies with other than two minor-unit digits prevent calculation of a total.
Pricing uses a single reviewed currency and VAT basis. Mixed line bases and
currencies require explicit review. No currency conversion is performed.
VAT-inclusive totals extract VAT; VAT-exclusive totals add it. Material amounts
are rounded to pennies per line; tax is rounded on the combined net amount.
All imported content is rendered as text, never HTML.

The example uses fictional customer data and demonstration prices, including
an explicitly zero additional charge. It is not a live Holcim price list.

CHECKS
Run node --test quote/quote-core.test.cjs (Node is needed for tests only).
The public page itself needs no installation, dependencies or build.
Browser checks cover /quote redirect, two-material conversion, expected totals,
missing charge review, mismatched pricing unit, text rendering, mobile overflow,
print layout, clear/reset and browser-local storage/network behaviour.
