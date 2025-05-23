// This file was generated by `python scripts/split_dictionary.py -l hi -m 6 -t 2000 -T 20000`.

export const keys = [
  "2309",
  "2310",
  "2313",
  "2325",
  "2326",
  "2327",
  "2330",
  "2331",
  "2332",
  "2333",
  "2335",
  "2337",
  "2340",
  "2342",
  "2343",
  "2344",
  "2346",
  "2347",
  "2348",
  "2349",
  "2350",
  "2352",
  "2354",
  "2357",
  "2358",
  "2360",
  "2361",
];

export default async function (key?: string): Promise<string | undefined> {
  if (!key) {
    return (await import("resources/dictionaries/hi/u.dic")).default;
  }

  switch (key) {
    case "2309":
      return (await import("resources/dictionaries/hi/u2309.dic")).default;
    case "2310":
      return (await import("resources/dictionaries/hi/u2310.dic")).default;
    case "2313":
      return (await import("resources/dictionaries/hi/u2313.dic")).default;
    case "2325":
      return (await import("resources/dictionaries/hi/u2325.dic")).default;
    case "2326":
      return (await import("resources/dictionaries/hi/u2326.dic")).default;
    case "2327":
      return (await import("resources/dictionaries/hi/u2327.dic")).default;
    case "2330":
      return (await import("resources/dictionaries/hi/u2330.dic")).default;
    case "2331":
      return (await import("resources/dictionaries/hi/u2331.dic")).default;
    case "2332":
      return (await import("resources/dictionaries/hi/u2332.dic")).default;
    case "2333":
      return (await import("resources/dictionaries/hi/u2333.dic")).default;
    case "2335":
      return (await import("resources/dictionaries/hi/u2335.dic")).default;
    case "2337":
      return (await import("resources/dictionaries/hi/u2337.dic")).default;
    case "2340":
      return (await import("resources/dictionaries/hi/u2340.dic")).default;
    case "2342":
      return (await import("resources/dictionaries/hi/u2342.dic")).default;
    case "2343":
      return (await import("resources/dictionaries/hi/u2343.dic")).default;
    case "2344":
      return (await import("resources/dictionaries/hi/u2344.dic")).default;
    case "2346":
      return (await import("resources/dictionaries/hi/u2346.dic")).default;
    case "2347":
      return (await import("resources/dictionaries/hi/u2347.dic")).default;
    case "2348":
      return (await import("resources/dictionaries/hi/u2348.dic")).default;
    case "2349":
      return (await import("resources/dictionaries/hi/u2349.dic")).default;
    case "2350":
      return (await import("resources/dictionaries/hi/u2350.dic")).default;
    case "2352":
      return (await import("resources/dictionaries/hi/u2352.dic")).default;
    case "2354":
      return (await import("resources/dictionaries/hi/u2354.dic")).default;
    case "2357":
      return (await import("resources/dictionaries/hi/u2357.dic")).default;
    case "2358":
      return (await import("resources/dictionaries/hi/u2358.dic")).default;
    case "2360":
      return (await import("resources/dictionaries/hi/u2360.dic")).default;
    case "2361":
      return (await import("resources/dictionaries/hi/u2361.dic")).default;
    default:
      return;
  }
}
