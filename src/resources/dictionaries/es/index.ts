// This file was generated by `python scripts/split_dictionary.py -l es -t 3000 -T 30000 -m 10`.

const cases = [
  "97-98",
  "97-99",
  "97-103",
  "97-108",
  "97-109",
  "97-110",
  "97-112",
  "97-114",
  "97-115",
  "97-116",
  "98",
  "99-97",
  "99-104",
  "99-111",
  "100",
  "101-109",
  "101-110",
  "101-115",
  "101-120",
  "102",
  "103",
  "104",
  "105",
  "106",
  "108",
  "109",
  "110",
  "111",
  "112",
  "114-97",
  "114-101",
  "115",
  "116",
  "118",
  "122",
]

export default async function (start?: string, exclude?: string[]): Promise<[string?,string?]> {
  if (!start) {
    return ["", (await import("resources/dictionaries/es/u.dic")).default];
  }

  const startCase = start.split("").map(c=>c.toLocaleLowerCase().charCodeAt(0))
  var startCode = startCase.join("-")
  while (startCode){
    if (cases.includes(startCode)){
      break
    }
    startCase.pop()
    startCode = startCase.join("-")
  }

  if (!startCode || exclude?.includes(startCode)) {
    return [undefined, undefined]
  }

  switch (startCode) {
    case "97-98":
      return [startCode, (await import("resources/dictionaries/es/u97-98.dic")).default];
    case "97-99":
      return [startCode, (await import("resources/dictionaries/es/u97-99.dic")).default];
    case "97-103":
      return [startCode, (await import("resources/dictionaries/es/u97-103.dic")).default];
    case "97-108":
      return [startCode, (await import("resources/dictionaries/es/u97-108.dic")).default];
    case "97-109":
      return [startCode, (await import("resources/dictionaries/es/u97-109.dic")).default];
    case "97-110":
      return [startCode, (await import("resources/dictionaries/es/u97-110.dic")).default];
    case "97-112":
      return [startCode, (await import("resources/dictionaries/es/u97-112.dic")).default];
    case "97-114":
      return [startCode, (await import("resources/dictionaries/es/u97-114.dic")).default];
    case "97-115":
      return [startCode, (await import("resources/dictionaries/es/u97-115.dic")).default];
    case "97-116":
      return [startCode, (await import("resources/dictionaries/es/u97-116.dic")).default];
    case "98":
      return [startCode, (await import("resources/dictionaries/es/u98.dic")).default];
    case "99-97":
      return [startCode, (await import("resources/dictionaries/es/u99-97.dic")).default];
    case "99-104":
      return [startCode, (await import("resources/dictionaries/es/u99-104.dic")).default];
    case "99-111":
      return [startCode, (await import("resources/dictionaries/es/u99-111.dic")).default];
    case "100":
      return [startCode, (await import("resources/dictionaries/es/u100.dic")).default];
    case "101-109":
      return [startCode, (await import("resources/dictionaries/es/u101-109.dic")).default];
    case "101-110":
      return [startCode, (await import("resources/dictionaries/es/u101-110.dic")).default];
    case "101-115":
      return [startCode, (await import("resources/dictionaries/es/u101-115.dic")).default];
    case "101-120":
      return [startCode, (await import("resources/dictionaries/es/u101-120.dic")).default];
    case "102":
      return [startCode, (await import("resources/dictionaries/es/u102.dic")).default];
    case "103":
      return [startCode, (await import("resources/dictionaries/es/u103.dic")).default];
    case "104":
      return [startCode, (await import("resources/dictionaries/es/u104.dic")).default];
    case "105":
      return [startCode, (await import("resources/dictionaries/es/u105.dic")).default];
    case "106":
      return [startCode, (await import("resources/dictionaries/es/u106.dic")).default];
    case "108":
      return [startCode, (await import("resources/dictionaries/es/u108.dic")).default];
    case "109":
      return [startCode, (await import("resources/dictionaries/es/u109.dic")).default];
    case "110":
      return [startCode, (await import("resources/dictionaries/es/u110.dic")).default];
    case "111":
      return [startCode, (await import("resources/dictionaries/es/u111.dic")).default];
    case "112":
      return [startCode, (await import("resources/dictionaries/es/u112.dic")).default];
    case "114-97":
      return [startCode, (await import("resources/dictionaries/es/u114-97.dic")).default];
    case "114-101":
      return [startCode, (await import("resources/dictionaries/es/u114-101.dic")).default];
    case "115":
      return [startCode, (await import("resources/dictionaries/es/u115.dic")).default];
    case "116":
      return [startCode, (await import("resources/dictionaries/es/u116.dic")).default];
    case "118":
      return [startCode, (await import("resources/dictionaries/es/u118.dic")).default];
    case "122":
      return [startCode, (await import("resources/dictionaries/es/u122.dic")).default];
    default:
      return [undefined, undefined];
    }
}