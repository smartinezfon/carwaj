export const CAR_CATALOG: Record<string, string[]> = {
  // Japanese
  Toyota: ["Camry", "Corolla", "Land Cruiser", "Prado", "Hilux", "RAV4", "Yaris", "Fortuner", "Avalon", "Crown", "Sequoia"],
  Nissan: ["Altima", "Patrol", "Sunny", "X-Trail", "Kicks", "Maxima", "Pathfinder", "Sentra", "Armada", "Tiida"],
  Honda: ["Accord", "Civic", "CR-V", "Pilot", "HR-V", "Odyssey", "Passport"],
  Mitsubishi: ["Pajero", "Outlander", "Montero", "ASX", "Eclipse Cross", "Xpander"],
  Mazda: ["CX-5", "CX-9", "CX-60", "Mazda3", "Mazda6"],
  Lexus: ["ES", "LS", "RX", "GX", "LX", "NX", "UX"],
  Infiniti: ["QX50", "QX55", "QX60", "QX80", "Q50", "Q60"],

  // Korean
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Accent", "Palisade", "Staria", "Creta", "Ioniq 5", "Ioniq 6"],
  Kia: ["Sportage", "Sorento", "Optima", "Cerato", "Telluride", "Seltos", "Carnival", "EV6", "Stinger"],
  Genesis: ["G70", "G80", "G90", "GV70", "GV80"],

  // American
  Ford: ["F-150", "Explorer", "Expedition", "Mustang", "Edge", "Escape", "Bronco", "Ranger"],
  Chevrolet: ["Tahoe", "Suburban", "Malibu", "Camaro", "Silverado", "Trailblazer", "Blazer", "Traverse"],
  GMC: ["Yukon", "Sierra", "Acadia", "Terrain", "Canyon"],
  Jeep: ["Grand Cherokee", "Wrangler", "Cherokee", "Compass", "Gladiator"],
  Dodge: ["Charger", "Challenger", "Durango", "Ram 1500"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck"],
  Cadillac: ["Escalade", "XT5", "XT6", "CT5"],
  Lincoln: ["Navigator", "Aviator", "Corsair"],

  // German
  BMW: ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "iX", "i4"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "EQS", "EQE"],
  Audi: ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "e-tron GT"],
  Volkswagen: ["Tiguan", "Touareg", "Passat", "Jetta", "Atlas", "Golf", "ID.4"],
  Porsche: ["Cayenne", "Macan", "Panamera", "911", "Taycan", "Cayenne Coupe"],

  // British
  "Land Rover": ["Range Rover", "Range Rover Sport", "Range Rover Velar", "Discovery", "Defender", "Evoque"],
  Bentley: ["Bentayga", "Continental GT", "Flying Spur"],
  "Rolls-Royce": ["Cullinan", "Phantom", "Ghost", "Wraith", "Spectre"],
  "Aston Martin": ["DBX", "Vantage", "DB11", "DBS"],

  // Italian
  Ferrari: ["488", "Roma", "Portofino", "SF90", "296 GTB", "Purosangue"],
  Lamborghini: ["Urus", "Huracan", "Aventador", "Revuelto"],
  Maserati: ["Levante", "Ghibli", "Quattroporte", "Grecale", "GranTurismo"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],

  // French
  Renault: ["Duster", "Koleos", "Captur", "Megane", "Logan", "Symbol", "Arkana"],
  Peugeot: ["2008", "3008", "5008", "208", "508"],
  Citroen: ["C3", "C4", "C5 Aircross", "Berlingo"],

  // Chinese
  BYD: ["Atto 3", "Seal", "Han", "Tang", "Dolphin", "Sealion 6", "Seal U"],
  Jetour: ["X70", "X90", "Dashing", "T2"],
  Chery: ["Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo 6"],
  MG: ["MG5", "MG6", "ZS", "HS", "RX5", "4 EV"],
  Haval: ["H6", "H2", "Jolion", "Dargo"],
  Geely: ["Coolray", "Okavango", "Tugella"],
  "Great Wall": ["Wingle", "Cannon"],
  OMODA: ["C5", "S5"],
  Deepal: ["S07", "L07"],

  // Swedish
  Volvo: ["XC40", "XC60", "XC90", "S60", "S90", "V60", "EX30", "EX90"],

  // Japanese Luxury
  Acura: ["MDX", "RDX", "TLX"],

  Other: ["Other"],
};

export const CAR_MAKES = Object.keys(CAR_CATALOG);
