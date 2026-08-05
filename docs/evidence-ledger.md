# Evidence ledger

Checked on **2026-08-04**.

| Public claim | Evidence | Qualification |
|---|---|---|
| The product is live on the web | [thatsmybest.com](https://thatsmybest.com/) | Public product surface |
| The iPhone app is live | [Apple App Store](https://apps.apple.com/us/app/thats-my-best-ai-friend-quiz/id6788340469) | Apple lists Alex Bouchard as developer |
| The input is one to four Instagram-grid screenshots | App Store product description | User-provided screenshots |
| The product generates five visually grounded questions | App Store product description | The model also proposes the answer to each one |
| A creator can name one to three friends | Public website and App Store description | Web links keep participation install-free |
| The default creation path seals the model's proposed answer key | Production creation flow; its seal-time analytics name the two modes `trust_his_guesses` (default) and `pick_your_own` | No per-question confirmation step exists on the free path |
| Per-question correction is a paid capability | "Pick Your Own" upgrade priced at $4.99 on the web creation screen and $2.99 as the iOS in-app purchase | Optional; publishing never requires it |
| A corrected key triggers a rewrite of the affected lines | Production patch call fires when the sealed key differs from the model's guess | Keeps reactions from contradicting a changed truth |
| Generation cost was roughly 6–7¢ per completed quiz | Internal soft-launch measurement | Not a scale claim and not organic traction |

## Corrections to earlier versions of this ledger

Before 2026-08-04 this repository described a creator-confirmed answer key as
the product's defining boundary. That was accurate for the flow as built through
2026-07-04 and stopped being accurate when the per-question review tools moved
behind a paid upgrade later that day. The invariants listed in the README were
and remain true; the claim that a human confirmation step gated every seal was
not, and has been removed rather than softened.

## Language discipline

- **Live** means publicly reachable on the web or Apple App Store.
- **Soft launch** means founder, development, concierge, and early invited usage.
- **Default path** means what a creator gets without paying: generate, glance,
  seal.
- **Generation cost** means measured model-generation expense for the early flow;
  it does not include every business or distribution cost.
- No user-count or growth claim is made in this repository.
