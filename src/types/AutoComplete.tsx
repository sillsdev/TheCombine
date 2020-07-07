export enum AutoComplete {
  Off = "Off",
  OnRequest = "OnRequest",
  AlwaysOn = "AlwaysOn",
}

export function randomAutoComplete(): AutoComplete {
  const randomSeed = Math.random();
  return randomSeed < 0.3333
    ? AutoComplete.Off
    : randomSeed < 0.6666
    ? AutoComplete.OnRequest
    : AutoComplete.AlwaysOn;
}
