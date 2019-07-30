import { ReviewEntriesWord } from "../ReviewEntriesComponent";

const mockWords: ReviewEntriesWord[] = [
  {
    id: "0",
    vernacular: "toad",
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
