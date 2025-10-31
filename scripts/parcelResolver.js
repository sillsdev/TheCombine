import { Resolver } from "@parcel/plugin";

const toExclude = [/\/scripts\/.*/];

export default new Resolver({
  async resolve({ specifier }) {
    return toExclude.some((pattern) => pattern.test(specifier))
      ? { isExcluded: true }
      : null;
  },
});
