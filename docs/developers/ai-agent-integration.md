---
sidebar_position: 1
sidebar_label: AI Agent / MCP Integration
---

# Integrating an AI Agent with the Aramid Bridge (Algorand / AVM side)

This page is written for developers building an **AI agent or MCP (Model Context
Protocol) tool** that initiates Aramid Bridge transfers from an Algorand-family
chain (Algorand, Voi, AramidChain — anything of `type: "algo"` in the bridge
configuration). It documents the **exact** wire format the `bridge-soldier-nodejs-app`
soldiers expect, derived directly from the soldier source code (not from
marketing copy), so an agent can construct a valid `axfer`/`pay` transaction
without trial and error.

If anything here ever disagrees with the soldier source code, the code wins —
this document should be re-derived from:

- `soldier/interface/aramid/ITransfer.ts`
- `soldier/algo/message/parseITransfer.ts`
- `soldier/algo/message/processITransfer.ts`
- `soldier/algo2algo/createAlgoPayloadFromAlgo.ts`
- `soldier/algo2eth/createEthPayloadFromAlgo.ts`
- `soldier/algo2near/createNearPayloadFromAlgo.ts`
- `soldier/common/getTokenConversion.ts`
- `soldier/common/validateTransfer.ts`

## 1. Mental model: what actually happens on-chain

Aramid is a lock-and-release (or lock-and-mint) multisig bridge. There is no
smart contract call on Algorand — bridging is triggered by sending a normal
**asset transfer (`axfer`)** or **payment (`pay`)** transaction to the bridge's
multisig address, with bridging instructions embedded in the transaction
**note field** as a JSON string.

```
User wallet  --axfer/pay + note-->  Bridge multisig address (source chain)
                                        |
                                        v
                        Soldiers (independent validator nodes) observe the
                        transaction, independently recompute the payload,
                        sign it, and once threshold signatures are reached,
                        one soldier submits the release transaction on the
                        destination chain.
```

Because every soldier independently recomputes the expected payload from the
raw on-chain transaction (see `checkAlgoPayloadFromAlgoNetwork.ts` /
`validateTransfer.ts`), **the note must be byte-for-byte correct and the
amounts must satisfy exact integer arithmetic** — there is no tolerance/epsilon
in the comparisons (`numbersAreNotEqual` compares `BigNumber(...).toFixed(0,1)`
strings for strict equality).

## 2. Discovering bridgable assets and routes

Do not hardcode routes. The bridge configuration is versioned and published to
IPFS; the canonical route table is `chains2tokens`, keyed as:

```
chains2tokens[sourceChainId][destinationChainId][sourceTokenId][destinationTokenId] = MappingItem
```

**How to fetch the live configuration:**

1. Soldiers detect configuration updates by scanning the Algorand mainnet
   config address (`ARAMICOCHLHSX3G5KCKK23M72ETI537GK5VGLOVHXAGPIELWYJKIMGKK6I`,
   chain 101003 / AramidChain) for an asset-transfer transaction whose note
   starts with `aramid-config/v1:j`, e.g.:
   ```json
   aramid-config/v1:j{"ipfsHash":"QmZ2Z5RE2XwxXPSQqLksWKKfaDYCJ11qFLHA7YJCvPUiy5"}
   ```
2. Fetch that hash from an IPFS gateway:
   ```bash
   curl -s "https://ipfs.io/ipfs/$HASH" | jq .
   # or: https://cloudflare-ipfs.com/ipfs/$HASH
   ```
3. The downloaded JSON is a `PublicConfigurationRoot`:
   ```ts
   interface PublicConfigurationRoot {
     hash?: string;                 // sha256 of the config, for integrity check
     addresses: AddressesPublicConfiguration;
     chains: { [chainId: string]: ChainItem };
     chains2tokens: SourceChain2DestinationChain;
   }

   type ChainItem = {
     chainId: number;
     name: string;
     type: "algo" | "eth" | "near";
     address: string;               // <-- the bridge/multisig deposit address for this chain
     tokens: { [tokenId: string]: TokenItem };
     confirmationCount?: number;
     // ...
   };
   ```

**An asset pair is "bridgable" if and only if** a `MappingItem` exists at
`chains2tokens[sourceChainId][destinationChainId][sourceTokenId][destinationTokenId]`
in the *currently published* config. Re-fetch periodically (soldiers reload
every ~5 minutes) — do not cache indefinitely, and always re-validate
immediately before building a transaction, since routes and fee tiers can
change between when a user asks and when the agent executes.

`MappingItem` (the object your agent needs per route):

```ts
type MappingItem = {
  sourceChain: number;
  sourceToken: string;
  sourceDecimals: number;
  sourceType: string;
  destinationChain: number;
  destinationToken: string;
  destinationDecimals: number;
  destinationType: string;
  feeAlternatives: Array<FeeAlternativeItem>;
};

type FeeAlternativeItem = {
  validFrom: number;        // round number, inclusive
  validUntil: number;       // round number, inclusive
  minimumAmount: string;    // in source token base units
  maximumAmount: string;    // in source token base units
  sourceConst: number;      // flat fee, source token base units
  sourcePercent: number;    // e.g. 0.001 = 0.1%
  destinationConst: number;
  destinationPercent: number;
  ifPremiumTokenUsed: boolean; // pick the alternative matching the token you use
};
```

`feeAlternatives` typically has two entries per route: one for standard tokens
and one for premium ("Aramid"-prefixed, `isPremium: true`) tokens, which
usually have a much lower `minimumAmount`. Pick the alternative where
`ifPremiumTokenUsed === tokenConfig.isPremium` and the current round falls
inside `[validFrom, validUntil]`.

> **Current constraint:** Algorand→Algorand-family (algo2algo) routes only
> support source and destination tokens with **identical decimals**
> (`createAlgoPayloadFromAlgo.ts` throws `Only tokens with same decimals is
> possible to bridge at the moment` otherwise). Algo→EVM and Algo→NEAR routes
> do support a decimals shift (see §4).

## 3. Checking the destination bridge has enough liquidity — REQUIRED pre-flight check

**The soldier code does not itself verify that the destination bridge address
holds enough of the destination token before it accepts and forwards your
transfer for signing.** If the destination bridge address does not hold
enough balance to release/mint the requested `destinationAmount`, the release
transaction will simply fail on the destination chain (or get stuck),
even though your source-chain lock transaction already succeeded and your
funds are already committed. **Your agent must perform this check itself,
before submitting the source transaction.**

Procedure:

1. Resolve the destination chain's bridge address: `chains[destinationChainId].address`.
2. Query that address's balance of `destinationToken` on the destination chain:
   - **AVM destination** (Algorand/Voi/AramidChain): use the indexer/algod
     `account-assets` (for ASAs) or the account's `amount` field (for native
     ALGO/VOI). For ARC-200 tokens, call the token contract's balance method.
   - **EVM destination**: for the native coin, check the address's native
     balance; for ERC-20, call `balanceOf(bridgeAddress)` on the token
     contract.
3. Compare the bridge's available balance against the `destinationAmount` you
   are about to request (see §4 for how `destinationAmount` is computed).
   If the bridge balance is lower, **do not submit the transaction** — surface
   a "destination liquidity insufficient" condition to the user/caller
   instead of locking funds that cannot currently be released.
4. Treat native-gas-token bridge balances with extra care: on EVM chains the
   bridge also needs enough native coin for the release tx's gas, and on AVM
   destinations the bridge account needs to be opted in to the destination
   ASA (see step 5 below) and hold enough ALGO/VOI for the minimum balance
   requirement in addition to the amount being released.
5. If the destination is an AVM chain and the destination asset is an ASA,
   also check that the **recipient address** is opted in to that ASA
   (`account-assets` includes the asset id). If not opted in, warn the user —
   the app UI does this same check before letting a user proceed.

This check is advisory/defensive on the client side — it is not enforced by
the protocol — but it is the only way to avoid submitting a transfer that the
bridge cannot currently fulfill.

## 4. The `aramid-transfer/v1:j` message schema (source of truth)

This is the note payload the **user's wallet** attaches to the `axfer`/`pay`
transaction sent to the source chain's bridge address. It is parsed by
`parseITransfer.ts` and typed as `ITransfer`:

```ts
type ITransfer = {
  destinationNetwork: number;   // destination chainId, e.g. 8453 (Base), 416101 (Voi)
  destinationAddress: string;   // final RECIPIENT address on the destination chain
  destinationToken: string;     // destination chain's token id (REQUIRED, see note below)
  feeAmount: string;            // fee portion, in SOURCE token base units, as a string
  sourceAmount: string;         // net transfer amount, in SOURCE token base units, as a string
  destinationAmount: string;    // amount the recipient should receive, in DESTINATION token base units
  note?: string;                // optional free-text memo, max 50 chars, restricted charset (see below)
};
```

**Field names are camelCase.** (Some older internal notes describe a
kebab-case shape like `"destination-network"` / `"fee-amount"` — that shape is
stale and does not match `ITransfer.ts`, `parseITransfer.ts`, or how the
soldier test-suite actually constructs these transactions. Always use the
camelCase field names above.)

- `destinationToken` is **required** in the current implementation. Passing it
  as `undefined` will make the soldier throw when resolving the destination
  token config — there is no "infer from the only mapping" fallback active
  in the current code path, regardless of older documentation claiming
  otherwise.
- `note`, if present, must be **≤ 50 characters** and match
  `/^[\p{L}\p{N}\s\.,\-_\/@\*\+\$%]*$/u` (letters, numbers, whitespace, and
  `. , - _ / @ * + $ %`). Anything else is rejected.
- All numeric amount fields (`feeAmount`, `sourceAmount`, `destinationAmount`)
  are **strings** containing base-unit integers (no decimal points, no
  scientific notation) — e.g. `"1000000"` for 1 ALGO (6 decimals), not
  `"1.0"` or `"1e6"`.

### The complete note string

```
aramid-transfer/v1:j{"destinationNetwork":416101,"destinationAddress":"VOI_ADDRESS...","destinationToken":"0","feeAmount":"1000","sourceAmount":"999000","destinationAmount":"999000","note":"invoice-123"}
```

This exact UTF-8 string is what goes into the Algorand transaction's `note`
field (base64-encoded on the wire, as usual for Algorand notes).

### The transaction the note is attached to

- **Type:** `axfer` if bridging an ASA, `pay` if bridging native ALGO/VOI.
- **`to`:** the **bridge multisig address** for the source chain
  (`chains[sourceChainId].address`), **not** the destination recipient — the
  recipient lives inside the note as `destinationAddress`.
- **`amount`:** `sourceAmount + feeAmount` (the **total** debited from the
  user), as an integer in source-token base units. This is enforced exactly:
  `processITransfer`/`createAlgoPayloadFromAlgo` require
  `sourceAmount + feeAmount == axfer/pay amount` or the transfer is rejected.
- **`assetIndex`** (axfer only): the source ASA id (`0`/omitted implies native
  token via `pay`).

## 5. Computing `sourceAmount`, `feeAmount`, and `destinationAmount` — rounding rules

This is the part that must be exactly right, because soldiers recompute these
numbers independently from the raw chain data and reject any mismatch.

### 5.1 All arithmetic is integer, rounded DOWN, never up

The soldier code configures `BigNumber.ROUNDING_MODE = BigNumber.ROUND_FLOOR`
and consistently calls `.toFixed(0, 1)` (`1` = `ROUND_DOWN`) whenever it
converts a computed amount back to an integer string. **Your agent must do
the same: truncate towards zero, never round to nearest, never round up.**
Rounding up would let a user claim more value on the destination chain than
was actually collateralized on the source chain, so soldiers will always
reject an over-rounded destination amount.

### 5.2 Network-wide minimum fee floor

Independent of the per-route fee configuration, every source chain enforces a
hard floor equivalent to **dividing by 1.001** (~0.0999000999%,
i.e. slightly under 0.1%):

```ts
const maxNetSource = Math.floor(totalAmountSent / 1.001);
const minFees = totalAmountSent - maxNetSource;
// requirement: feeAmount >= minFees
// requirement: sourceAmount <= maxNetSource
```

where `totalAmountSent` is the full `axfer`/`pay` amount (`sourceAmount +
feeAmount`). This is checked identically in `createAlgoPayloadFromAlgo.ts`
(algo→algo) and `createEthPayloadFromAlgo.ts` (algo→eth); the near path is
analogous.

### 5.3 Per-route fee configuration (may require MORE than the floor)

Separately, `validateTransfer.ts` enforces the route's configured fee model
from the matching `FeeAlternativeItem`:

```ts
const minToBePaid = (sourceAmount)
  .multipliedBy(feeConfiguration.sourcePercent)
  .plus(feeConfiguration.sourceConst);
// requirement: feeAmount >= minToBePaid
```

Also enforced from the same `FeeAlternativeItem`:

```ts
// requirement: minimumAmount <= sourceAmount <= maximumAmount
```

**Your agent must compute `feeAmount` as at least the larger of:**
1. the 1/1.001 network floor (§5.2), and
2. `sourceAmount * feeConfiguration.sourcePercent + feeConfiguration.sourceConst` (§5.3)

Then round the fee **up** to the smallest integer that still satisfies both
minimums (i.e. do not round the fee itself down below the required minimum —
rounding-down only applies to *amounts computed from* a given fee/total, not
to the minimum-fee requirement itself). A safe approach:

```ts
import BigNumber from 'bignumber.js';

function computeFee(totalAmount: string, feeConfig: FeeAlternativeItem): string {
  const total = new BigNumber(totalAmount);
  const maxNetSource = new BigNumber(total).dividedBy(1.001).toFixed(0, 1); // ROUND_DOWN
  const networkFloor = total.minus(maxNetSource);
  const sourceAmountGuess = total.minus(networkFloor);
  const routeMin = sourceAmountGuess
    .multipliedBy(feeConfig.sourcePercent)
    .plus(feeConfig.sourceConst);
  // fee must clear BOTH floors; round the fee up to be safe
  return BigNumber.max(networkFloor, routeMin).integerValue(BigNumber.ROUND_CEIL).toFixed();
}
```

### 5.4 Decimals conversion (source token decimals ≠ destination token decimals)

`getTokenConversion.ts` computes a multiplier/divider pair from the decimals
difference:

```ts
const decimalsDiff = sourceDecimals - destinationDecimals;
const decimalsMultiplier = decimalsDiff < 0 ? 10 ** abs(decimalsDiff) : 1;
const decimalsDivider    = decimalsDiff > 0 ? 10 ** decimalsDiff      : 1;
```

The maximum permissible `destinationAmount` for a given net `sourceAmount`
(after fees) is:

```ts
const maxNetSourceAdjusted = floor(
  maxNetSource * decimalsMultiplier / decimalsDivider
);
// requirement: destinationAmount <= maxNetSourceAdjusted
```

For **algo→algo routes specifically, decimalsMultiplier must equal
decimalsDivider** (i.e. identical decimals) — the code throws otherwise. For
algo→eth and algo→near, a decimals shift is supported and this formula is the
one to use to size `destinationAmount` correctly.

### 5.5 Full worked example

Bridging **1 ALGO (6 decimals) → aAlgo on Voi (6 decimals, same decimals)**,
using the default 0.1% route fee with no constant component:

```
totalAmount to send in the axfer/pay tx = 1_000_000 (1 ALGO in microAlgo)
maxNetSource   = floor(1_000_000 / 1.001)              = 999_000
networkFloorFee = 1_000_000 - 999_000                  = 1_000
routeMinFee     = 999_000 * 0.001 + 0                   = 999   (rounded to 999)
feeAmount       = max(1_000, 999)                       = 1_000
sourceAmount    = totalAmount - feeAmount               = 999_000
decimalsMultiplier = decimalsDivider = 1 (same decimals)
maxNetSourceAdjusted = floor(999_000 * 1 / 1) = 999_000
destinationAmount    = 999_000   (must be <= maxNetSourceAdjusted; equal here)
```

Resulting note:
```json
{"destinationNetwork":416101,"destinationAddress":"<recipient VOI/AVM address>","destinationToken":"302189","feeAmount":"1000","sourceAmount":"999000","destinationAmount":"999000","note":"my-transfer"}
```

And the `axfer`/`pay` transaction sends **`1_000_000` micro-units of the
source ASA (or ALGO)** to `chains[416001].address` (the Algorand mainnet
bridge address) with that note attached.

## 6. Building the transaction (algosdk)

```ts
import algosdk from 'algosdk';

const note = new Uint8Array(
  Buffer.from(
    'aramid-transfer/v1:j' + JSON.stringify({
      destinationNetwork: 416101,
      destinationAddress: recipientAddress,
      destinationToken: '302189',
      feeAmount: '1000',
      sourceAmount: '999000',
      destinationAmount: '999000',
      note: 'my-transfer',
    }),
    'utf8'
  )
);

const suggestedParams = await algodClient.getTransactionParams().do();

// axfer, if bridging an ASA (assetIndex > 0):
const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
  from: userAddress,
  to: bridgeAddress,          // chains[sourceChainId].address from the public config
  amount: 1_000_000,          // sourceAmount + feeAmount, integer, base units
  assetIndex: sourceAssetId,
  note,
  suggestedParams,
});

// pay, if bridging native ALGO/VOI (no assetIndex):
// const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//   from: userAddress, to: bridgeAddress, amount: 1_000_000, note, suggestedParams,
// });
```

## 7. Pre-flight validation checklist

Before broadcasting, an agent should verify locally (soldiers will reject the
transfer otherwise, and a rejected transfer still costs the source chain's
network fee and can strand funds until manually recovered):

- [ ] Route exists in the freshly-fetched `chains2tokens[sourceChainId][destinationChainId][sourceToken][destinationToken]`.
- [ ] `destinationToken` is present and non-empty in the note.
- [ ] `sourceAmount + feeAmount == axfer/pay amount` exactly (integer strings).
- [ ] `feeAmount >= max(networkFloorFee, routeMinFee)` (§5.2–5.3).
- [ ] `feeConfiguration.minimumAmount <= sourceAmount <= feeConfiguration.maximumAmount`.
- [ ] `destinationAmount <= maxNetSourceAdjusted` and computed with `ROUND_DOWN` (§5.4).
- [ ] For algo→algo routes: source and destination token decimals are equal.
- [ ] `note` (memo) is ≤ 50 chars and matches the allowed charset, or omitted.
- [ ] The `to` address of the `axfer`/`pay` is the **bridge address**
      (`chains[sourceChainId].address`), not the destination recipient.
- [ ] The destination bridge address holds enough `destinationToken` balance
      to cover `destinationAmount` (§3) — and, for AVM destinations, the
      recipient is opted in to the destination ASA.
- [ ] The user's account is opted in to the source ASA (obviously — you can't
      hold/send it otherwise) and has enough balance for `amount` plus the
      Algorand transaction fee.

## 8. What happens after you submit

1. Soldiers observe the confirmed transaction and independently recompute the
   expected payload (§4–§5); each soldier that agrees signs it.
2. A pseudo-randomly (VRF-like) selected soldier submits the release/mint
   transaction on the destination chain, tagged `aramid-confirm/v1:j` on AVM
   destinations. For EVM destinations, a `Payload` is gossiped and a proof
   (`aramid-proof/v1:j`) is later recorded once the destination transaction is
   confirmed.
3. Transactions are only processed automatically within a bounded window from
   the source confirmation (approximately 1000 rounds / ~1 hour on Algorand);
   after that, manual reconciliation is required (see the "Revert Failed
   Transactions" node-operator guide).

For a deeper description of the multisig/consensus model, see
[Core Architecture](/docs/core-architecture); for the fee floor rationale, see
[Fee Structure](/docs/fee-structure).
