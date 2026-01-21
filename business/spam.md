Since your app is **tournament-agnostic** (meaning it supports any type of tournament—trading, sports, esports, quizzes, debates, etc.), and you're concerned about users creating tons of **unused/abandoned tournaments** that could spam the platform, clog search/discovery, waste server resources, or look unprofessional, that's a smart thing to address early.

The **percentage fee model** (platform cut from participant entry fees) still edges out as the stronger primary choice for your setup, but you can (and should) layer in protections against abuse. Here's why and how to make it work well.

### Why Percentage Fee Wins for a Tournament-Agnostic App
- **Incentivizes quality over quantity** — Hosts only create tournaments they believe will attract participants (and entry fees), because that's when you (and they) make money. Random "test" or spam tournaments rarely get entries, so they cost the host nothing extra — but they also don't generate junk if you add soft barriers (more below).
- **Revenue scales with success** — Viral or popular tournaments (e.g., a hot trading challenge in Lagos communities) bring in more without you chasing subscriptions from inactive hosts.
- **Lower friction for broad adoption** — Anyone can host anything for free (or very low cost) to start — perfect for your agnostic approach. People experiment with niche ideas (crypto prediction contests, local debate tourneys, fitness challenges) without upfront commitment. Subscriptions would scare off casual/one-off hosts, limiting variety and growth.
- **Real-world parallels** — Platforms like Start.gg (esports-focused) use a ~6% platform fee on registrations (plus processing), and Challonge has optional paid upgrades but keeps basic creation free/low-fee. Fantasy sports and prop-style comps almost all use rake/entry-fee cuts — it aligns everyone when real money flows.

Subscription for hosts would feel mismatched here: It punishes experimentation (pay even if your tournament flops or stays private), and you'd need many paying power-users to make decent revenue. For agnostic apps, it often leads to slower growth unless you have super-sticky niches.

**Recommended starting cut**: 8-12% of entry fees (after payment processing). You can make it tiered (lower % for bigger prize pools) or offer "featured" boosts for higher cuts.

### How to Prevent Spam/Unused Tournament Abuse
Combine these anti-spam tactics — inspired by Challonge, Start.gg, and general UGC best practices — to keep things clean without killing usability:

1. **Require minimum viability signals before public visibility**  
   - Tournaments start as **private/draft** by default.  
   - To go public/listed in search/feed: Require at least 1-3 confirmed participants, a set start date (not too far away), or a description/rules.  
   - Auto-archive/delete drafts unused after 30-60 days (with warning emails).

2. **Rate limiting & account-based restrictions**  
   - New accounts: Limit to 3-5 active tournaments at once (or per week).  
   - Verified accounts (email + phone + maybe KYC-lite for paid ones): Higher limits.  
   - Soft cap: After X inactive tournaments, require approval or pause creation until some get completed/participants.

3. **Auto-cleanup & moderation tools**  
   - Auto-delete/archive tournaments with 0 participants after deadline passes.  
   - Flag/report system: Let users report spam; mods (or AI-assisted) review and ban repeat offenders.  
   - Hide low-activity tournaments from main discovery (e.g., sort by participant count or recent activity).

4. **Hybrid premium perks (optional add-on)**  
   - Keep core creation + percentage fee free/low.  
   - Sell optional **host subscriptions** ($5-20/mo) for extras like: unlimited drafts, custom branding, analytics, priority in discovery, no auto-archive, or 0% platform fee on their tournaments.  
   - This gives predictable revenue from serious hosts without gating the basics.

5. **Other lightweight guards**  
   - CAPTCHA or simple proof-of-human on creation for new users.  
   - Require unique titles/descriptions (block duplicates).  
   - Monitor creation patterns (e.g., many identical tournaments from one IP → flag/suspend).

This combo keeps the platform feeling open and creative (key for tournament-agnostic appeal) while preventing it from turning into a graveyard of dead brackets.

What do you think — does this fit your vision for how users will host (mostly casual community ones, or more organized groups)? Are you planning to allow paid entries from day one, or start with free-only tournaments? That could influence the exact anti-abuse tweaks too. Let's refine it! 🚀




-- 1. The view to always get the current, real wallet balance
CREATE OR REPLACE VIEW user_wallet_balance AS
SELECT 
  profile_id,
  COALESCE(SUM(
    CASE 
      WHEN type IN ('deposit', 'refund') AND status = 'completed' THEN amount
      WHEN type IN ('entry_fee', 'withdrawal') AND status = 'completed' THEN -amount
      ELSE 0
    END
  ), 0) AS current_balance
FROM transactions
GROUP BY profile_id;


-- 2. The RPC function to add money (refund / deposit)
CREATE OR REPLACE FUNCTION add_to_wallet(
  p_profile_id uuid,
  p_amount numeric,
  p_description text DEFAULT 'Credit / Refund',
  p_tournament_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO transactions (
    profile_id,
    amount,
    currency,
    type,
    status,
    description,
    tournament_id,
    created_at
  )
  VALUES (
    p_profile_id,
    p_amount,
    'NGN',
    'refund',                    -- you can change to 'deposit' if you prefer
    'completed',
    p_description,
    p_tournament_id,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. (Optional) Function to read balance directly via RPC if you prefer it over the view
CREATE OR REPLACE FUNCTION get_wallet_balance(p_profile_id uuid)
RETURNS numeric AS $$
DECLARE
  bal numeric;
BEGIN
  SELECT current_balance INTO bal
  FROM user_wallet_balance
  WHERE profile_id = p_profile_id;

  RETURN COALESCE(bal, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;