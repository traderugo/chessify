const ChessWebAPI = require('chess-web-api');

export async function getGameResults(gameId) {
  const chess = new ChessWebAPI();
  const { body } = await chess.getGameById(gameId);
  return body;
}