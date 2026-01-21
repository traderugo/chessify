# Chess Tournament App

A Next.js app for organizing chess tournaments with Supabase for auth/DB, Paystack for payments, and chess.com integration.

## Setup
1. Install dependencies: `npm install`
2. Set up .env.local with Supabase and Paystack keys.
3. Create Supabase tables: users, tournaments (name, description, start_date, prize_pool, creator_id), tournament_participants (tournament_id, user_id), matches (id, tournament_id, player1, player2, result, chess_com_game_id), tournament_standings (tournament_id, player, points).
4. Run `npm run dev`

## Features
- User auth
- Create/join tournaments
- Pairings and results from chess.com
- Prize pools with payments