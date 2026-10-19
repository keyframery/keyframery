# Monthly AI visibility sample

Prepared 19 October 2026. No prompt runs or citations are claimed by these templates. The [twelve prompts](ai-prompts.csv) deliberately omit Keyframery; they measure whether a developer's actual task leads an answer engine to a useful, accurate recommendation. This is a directional sample, not market share or a ranking system.

## Run the same sample

1. Once a month, run every prompt in a fresh conversation in each available answer product. Keep the exact prompt wording and IDs. Do not provide this repository, brand context or follow-up hints. Keep locale/language, account mode and search setting consistent and record any differences.
2. Record the actual product and displayed model/version; use `not_disclosed` if hidden. Record `search_on`, `search_off`, `automatic`, `ai_mode` or the actual product mode. An unavailable product, quota limit or unsupported search mode is `unavailable`, not a negative answer. No paid subscription is required by this kit.
3. Save the complete answer and visible sources privately. Record the timestamp with offset, locale and run ID. Use a new run ID for a repeated answer; don't replace an unfavorable run with a favorable rerun. If repeating, run the full set under the same declared sampling rule.
4. Add one observation row per visible citation. Reuse the run ID for multiple citations so denominators count **runs**, not rows. For an answer without citations, add one row with a blank citation URL and `citation_present=false`. Keep mention, recommendation and citation as separate fields.
5. Open each visible citation and record whether it resolves, directly supports the associated claim and names the correct tool. A claim unsupported by its citation is not an accurate citation. Score the claim against the current official docs/source; save the page/version/date checked.
6. Where an answer is wrong, record the exact error, evidence and a concrete correction task for the existing relevant docs. The maintainer evaluates the correction; an inaccurate answer alone is not a reason to create many overlapping pages.

## Fields and scoring

Use [ai-observations.csv](ai-observations.csv). Its header is the schema; it intentionally has no fabricated data rows.

| Field | Definition |
|---|---|
| `run_id`, `prompt_id`, `prompt` | Unique run, stable ID and the exact text used |
| `date_time`, `product`, `model`, `search_mode`, `locale` | Actual observation context; no guessed model version |
| `run_status` | `completed`, `unavailable` or `error` |
| `answer_artifact` | Private path/reference to complete answer and source list |
| `brand_mentioned` | Whether the answer visibly names Keyframery |
| `brand_recommended` | Whether it recommends Keyframery for the task; mention alone is insufficient |
| `citation_present`, `citation_url`, `cited_domain` | A visible linked source; record actual URL, not a guessed canonical |
| `is_keyframery_source` | Source belongs to `keyframery.com` or the official `keyframery/keyframery` repo |
| `claim`, `accuracy`, `evidence_url`, `checked_date` | Claim and `accurate`, `partial`, `incorrect` or `not_assessed`, supported by a checked primary source |
| `correction_task`, `notes` | Specific docs follow-up, missing context, mode changes or sampling exceptions |

For each product/mode, report **completed runs / planned runs**, **brand mentions / completed runs**, **brand recommendations / completed runs** and **runs with an accurate Keyframery citation / completed runs**. Deduplicate by run ID. Report citation accuracy among assessed claims separately. Use raw counts with small denominators; do not turn a 12-prompt convenience sample into a population estimate. Group changed models or search modes separately before comparing months.

## Interpret the channels separately

| Evidence | What it establishes | What it does not establish |
|---|---|---|
| Named crawler/Markdown request | A classified request reached an interface and was counted | A visible citation, recommendation or user visit |
| MCP initialization/tool call | A counted protocol action | A successful answer, integration or adoption |
| Saved answer with a visible source link | A citation in that specific sampled answer | Guaranteed repeatability or broad product visibility |
| Search Console generative AI impressions | Links shown in Google's documented AI features | AI clicks or conversions; counts overlap search reporting |
| Measured referral visit | A visit with the observed referrer in that collection system | Every AI visit, every citation or confirmed installation |

Google's [Generative AI performance documentation](https://support.google.com/webmasters/answer/16984139) defines the impressions report. Its [AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says special AI markup and `llms.txt` are unnecessary for Google visibility. Keep Markdown and MCP useful for developers while judging visibility from actual observed answers.
