export const biomeData = {
  forest: {
    name: "forest",
    isBlocking: false,
    weight: 0.7,
    decorationChance: 0.4,
    decorations: ["forest0", "forest1", "forest2", "forest3"]
  },
  mountain: {
    name: "mountain",
    isBlocking: true,
    weight: 0.15,
    decorationChance: 1,
    decorations: ["mountain0", "mountain1", "mountain2"]
  },
  desert: {
    name: "desert",
    isBlocking: false,
    weight: 0.15,
    decorationChance: 0.0,
    decorations: ["desert0"]
  },
  campsite: {
    name: "campsite",
    isBlocking: false,
    weight: 0,
    decorationChance: 1,
    decorations: ["campsite0"]
  },
  ocean: {
    name: "ocean",
    isBlocking: true,
    weight: 0.0,
    decorationChance: 0.5,
    decorations: ["ocean0"]
  }
};
