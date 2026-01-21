const ChessWebAPI = require('chess-web-api');

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');
  const tournamentId = searchParams.get('tournamentId');
  const chess = new ChessWebAPI();
  try {
    const { body } = await chess.getGameById(gameId); // Or use appropriate endpoint
    // Parse result, update Supabase standings for tournamentId
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    // Example: await supabase.from('matches').update({ result: body.winner }).eq('chess_com_game_id', gameId);
    return Response.json(body);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 });
  }
}