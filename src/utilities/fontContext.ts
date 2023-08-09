import { createContext } from "react";

import { Hash } from "types/hash";

const FontContext = createContext<Hash<string>>({});

export default FontContext;
