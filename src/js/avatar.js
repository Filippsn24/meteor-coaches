const PHOTOS = [
  "vasilchenko-sasha",
  "vasilchenko-vova",
  "nahushev-kantemir",
  "bufaten-pavel",
  "bufatin-pavel",
  "saratovskij-danila",
  "shatov-aleksandr",
  "tulovskij-mihail",
  "vasilev-oleg",
  "kalinkin-nikita",
  "ionov-pavel",
  "tashaev-hasan",
];

const photoSet = new Set(PHOTOS);

export function hasPhoto(slug) {
  return photoSet.has(slug);
}

export function photoUrl(slug) {
  return `assets/coaches/${slug}.jpg`;
}
