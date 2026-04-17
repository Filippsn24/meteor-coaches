const PHOTOS = [
  "vasilchenko-sasha",
  "nahushev-kantemir",
  "bufaten-pavel",
  "saratovskij-danila",
  "shatov-aleksandr",
  "tulovskij-mihail",
  "vasilev-oleg",
  "kalinkin-nikita",
  "ionov-pavel",
];

const photoSet = new Set(PHOTOS);

export function hasPhoto(slug) {
  return photoSet.has(slug);
}

export function photoUrl(slug) {
  return `assets/coaches/${slug}.jpg`;
}
