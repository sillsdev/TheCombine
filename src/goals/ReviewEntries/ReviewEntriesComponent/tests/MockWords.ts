import { ReviewEntriesWord } from "../ReviewEntriesTypes";

const mockWords: ReviewEntriesWord[] = [
  {
    id: "0",
    vernacular: "toad",
    pronunciationFiles: [],
    senses: [
      {
        senseId: "1",
        glosses: "bup, AHHHHHH",
        domains: [{ name: "domain", id: "number" }],
        deleted: false
      }
    ]
  },
  {
    id: "1",
    vernacular: "vern",
    pronunciationFiles: [],
    senses: [
      {
        senseId: "2",
        glosses: "gloss",
        domains: [{ name: "domain", id: "number" }],
        deleted: false
      }
    ]
  }
];

export default mockWords;
