(function () {
  window.AOC = window.AOC || {};
  window.AOC.DATA = window.AOC.DATA || {};

  // Use whatever internal tier names you want; these are neutral.
  // You can extend with move rules, values, sprites, etc later.
  window.AOC.DATA.PIECES = [
    { id: "pawn",     name: "Pawn",     tier: "pawn",    icon: "assets/ui/pieces/pawn.png" },
    { id: "ninja",    name: "Ninja",    tier: "pawn",    icon: "assets/ui/pieces/ninja.png" },

    { id: "bishop",   name: "Bishop",   tier: "officer", icon: "assets/ui/pieces/bishop.png" },
    { id: "knight",   name: "Knight",   tier: "officer", icon: "assets/ui/pieces/knight.png" },
    { id: "horseman", name: "Horseman", tier: "officer", icon: "assets/ui/pieces/horseman.png" },
    { id: "rook",     name: "Rook",     tier: "officer", icon: "assets/ui/pieces/rook.png" },
    { id: "queen",    name: "Queen",    tier: "officer", icon: "assets/ui/pieces/queen.png" },

    { id: "king",     name: "King",     tier: "royal",   icon: "assets/ui/pieces/king.png" },
    { id: "emperor",  name: "Emperor",  tier: "royal",   icon: "assets/ui/pieces/emperor.png" },
    { id: "pharaoh",  name: "Pharaoh",  tier: "royal",   icon: "assets/ui/pieces/pharaoh.png" },
  ];
})();
