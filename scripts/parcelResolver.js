import { Resolver } from "@parcel/plugin";

const toExclude = ["scripts/config.js"];

export default new Resolver({
  async resolve({ specifier }) {
    if (toExclude.includes(specifier)) {
      return { isExcluded: true };
    }

    return null;
  },
});
