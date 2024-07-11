export interface PuzzleResponse {
  puzzles: string;
  success: boolean;
}

export interface DecryptedPuzzleResponse {
  board: string[];
  difficulty: number;
  id: number;
  optionalWords: string[];
  version: string;
  words: string[];
  x5: string[];
}
