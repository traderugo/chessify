export const theme = {
  // Containers
  container: "max-w-5xl mx-auto px-4",

  // Cards & Panels
  card: "bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm",
  cardHover: "hover:bg-gray-50 dark:hover:bg-gray-800/50 transition",

  // Navbar
  navbar: "bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50",
  navbarInner: "max-w-5xl mx-auto px-4 py-3 flex justify-between items-center",

  // Buttons
  primaryButton: "bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full transition px-5 py-2 flex items-center gap-2",
  dangerButton: "bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full transition px-4 py-1.5",

  // Text
  heading1: "text-3xl font-bold text-gray-900 dark:text-gray-100",
  heading2: "text-xl font-bold text-gray-800 dark:text-gray-200 mb-4",
  mutedText: "text-gray-600 dark:text-gray-400",
  link: "text-gray-700 dark:text-gray-300 hover:text-blue-500 font-medium transition",

  // Icons & Buttons
  iconButton: "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition",
  
  // Mobile menu dropdown
  mobileDropdown: "absolute right-0 mt-2 w-48 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden",
};

///////////////////////////////////////
-- 2. Tournaments / Events
CREATE TABLE tournaments (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    title               text          NOT NULL,
    description         text,
    host_id             uuid          REFERENCES profiles(id) ON DELETE SET NULL,
    entry_fee           bigint        DEFAULT 0,           -- in smallest unit (kobo/cents)
    currency            text          DEFAULT 'NGN',
    max_participants    integer       CHECK (max_participants > 0),
    start_date          timestamptz,
    status              text          DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'cancelled')),
    prize_pool          bigint        DEFAULT 0,
    external_link       text,                              -- lichess arena, discord, etc
    created_at          timestamptz   DEFAULT now(),
    updated_at          timestamptz   DEFAULT now()
);

-- 3. Participants / Registrations
CREATE TABLE tournament_participants (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id       uuid          REFERENCES tournaments(id) ON DELETE CASCADE,
    profile_id          uuid          REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at           timestamptz   DEFAULT now(),
    payment_status      text          DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_reference   text,                              -- Paystack/Flutterwave ref
    UNIQUE(tournament_id, profile_id)
);

-- 4. Very basic transaction log (mostly for entry fees)
CREATE TABLE transactions (
    id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id          uuid          REFERENCES profiles(id),
    tournament_id       uuid          REFERENCES tournaments(id),
    amount              bigint        NOT NULL,
    currency            text          NOT NULL DEFAULT 'NGN',
    type                text          NOT NULL
        CHECK (type IN ('entry_fee', 'sponsorship', 'prize_payout', 'platform_fee')),
    status              text          DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    reference           text,                              -- payment gateway reference
    created_at          timestamptz   DEFAULT now()
);

-- Enable Row Level Security on all important tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 1. Profiles - users can see others' basic info, but only edit own
CREATE POLICY "Profiles are public readable"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Tournaments
-- Everyone can see published/ongoing/completed tournaments
CREATE POLICY "Public can see active tournaments"
    ON tournaments FOR SELECT
    USING (status IN ('published', 'ongoing', 'completed'));

-- Only host can see draft tournaments + manage their own
CREATE POLICY "Host can manage own tournaments"
    ON tournaments FOR ALL
    USING (host_id = auth.uid())
    WITH CHECK (host_id = auth.uid());

-- 3. Tournament participants
-- Participants can see who joined their own tournaments (both as host or participant)
CREATE POLICY "Participants visible to host and joined users"
    ON tournament_participants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tournaments t
            WHERE t.id = tournament_id
            AND (t.host_id = auth.uid() OR EXISTS (
                SELECT 1 FROM tournament_participants tp
                WHERE tp.tournament_id = t.id
                AND tp.profile_id = auth.uid()
            ))
        )
    );

-- Only authenticated users can join (insert)
CREATE POLICY "Authenticated users can join tournaments"
    ON tournament_participants FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Users can see/update their own participation
CREATE POLICY "Users manage own participation"
    ON tournament_participants FOR UPDATE
    USING (profile_id = auth.uid());

-- 4. Transactions - very restrictive (mostly for internal use / host verification)
CREATE POLICY "Users see own transactions"
    ON transactions FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "Only system can insert transactions"  -- you should use service_role key for inserts
    ON transactions FOR INSERT
    WITH CHECK (false);  -- normal users cannot insert - only backend/service role

-- Simple function + trigger to update prize_pool when participant pays
CREATE OR REPLACE FUNCTION update_tournament_prize_pool()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        UPDATE tournaments
        SET prize_pool = prize_pool + NEW.amount
        WHERE id = NEW.tournament_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_prize_after_payment
    AFTER UPDATE OF payment_status
    ON tournament_participants
    FOR EACH ROW
    WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
    EXECUTE FUNCTION update_tournament_prize_pool();

