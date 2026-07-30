const fs = require('fs');

const typesContent = fs.readFileSync('src/types.ts', 'utf8');

const proPlans = [
  {
    "name": "Plan Basic",
    "price": 0,
    "id": "basic",
    "priceQuarterly": 0,
    "limits": {
      "maxConcurrentBookings": 1,
      "maxListingsPerAccount": 1,
      "maxBookingsPerDay": 1
    },
    "features": [
      "Perfil básico",
      "1 Reserva cada 48h"
    ]
  },
  {
    "priceQuarterly": 12,
    "id": "medium",
    "price": 5,
    "name": "Plan Medium",
    "features": [
      "Perfil Medium",
      "1 Reserva cada 24h"
    ],
    "limits": {
      "maxConcurrentBookings": 1,
      "maxListingsPerAccount": 1,
      "maxBookingsPerDay": 1
    },
    "isRecommended": true
  },
  {
    "limits": {
      "maxListingsPerAccount": 1,
      "maxConcurrentBookings": 1,
      "maxBookingsPerDay": 999
    },
    "features": [
      "Perfil Premium",
      "Publicación solo 1 categoría",
      "Permite reserva sin limite"
    ],
    "id": "premium",
    "priceQuarterly": 24,
    "name": "Plan Premium",
    "price": 10
  },
  {
    "limits": {
      "maxListingsPerAccount": 2,
      "maxConcurrentBookings": 4,
      "maxBookingsPerDay": 999
    },
    "features": [
      "Perfil Premium Pro",
      "Publicación hasta 2 categoría",
      "Reserva sin limite",
      "Hasta 2 reservas misma franja horaria"
    ],
    "price": 15,
    "name": "Plan Premium Pro",
    "priceQuarterly": 36,
    "id": "premium-pro"
  }
];

let finalContent = typesContent.replace(
  /export const ENABLE_SEARCH_PROFESSIONALS = true;/g,
  'export const ENABLE_SEARCH_PROFESSIONALS = false;'
);

const proPlansStart = finalContent.indexOf('export const PRO_PLANS = [');
const proPlansEnd = finalContent.indexOf('];', proPlansStart) + 2;

finalContent = finalContent.substring(0, proPlansStart) + 
  `export const PRO_PLANS = ${JSON.stringify(proPlans, null, 2)};` +
  finalContent.substring(proPlansEnd);

fs.writeFileSync('src/types.ts', finalContent);
console.log('Successfully updated src/types.ts');
