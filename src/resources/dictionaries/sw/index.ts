// This file was generated by `python scripts/split_dictionary.py -l sw -m -1 -t 1500 -T 20000`.

export const keys = [
  "97",
  "98",
  "104",
  "105",
  "107",
  "108",
  "109",
  "110",
  "115",
  "116",
  "117",
  "118",
  "119",
];

export default async function (key?: string): Promise<string | undefined> {
  if (!key) {
    return (await import("resources/dictionaries/sw/u.dic")).default;
  }

  switch (key) {
    case "97":
      return (await import("resources/dictionaries/sw/u97.dic")).default;
    case "98":
      return (await import("resources/dictionaries/sw/u98.dic")).default;
    case "104":
      return (await import("resources/dictionaries/sw/u104.dic")).default;
    case "105":
      return (await import("resources/dictionaries/sw/u105.dic")).default;
    case "107":
      return (await import("resources/dictionaries/sw/u107.dic")).default;
    case "108":
      return (await import("resources/dictionaries/sw/u108.dic")).default;
    case "109":
      return (await import("resources/dictionaries/sw/u109.dic")).default;
    case "110":
      return (await import("resources/dictionaries/sw/u110.dic")).default;
    case "115":
      return (await import("resources/dictionaries/sw/u115.dic")).default;
    case "116":
      return (await import("resources/dictionaries/sw/u116.dic")).default;
    case "117":
      return (await import("resources/dictionaries/sw/u117.dic")).default;
    case "118":
      return (await import("resources/dictionaries/sw/u118.dic")).default;
    case "119":
      return (await import("resources/dictionaries/sw/u119.dic")).default;
    default:
      return;
  }
}
