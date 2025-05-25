import type { PlopTypes } from "@turbo/gen";
import { apiRouteGenerator } from "./actions/api-route.generator";
import { databaseTableGenerator } from "./actions/database-table.generator";
import { serviceGenerator } from "./actions/service.generator";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  helpers(plop);
  apiRouteGenerator(plop);
  databaseTableGenerator(plop);
  serviceGenerator(plop);
}

function helpers(plop: PlopTypes.NodePlopAPI) {
  plop.addHelper("ifEquals", function (a, b, options) {
    // @ts-ignore
    return a === b ? options.fn(this) : options.inverse(this);
  });

  plop.setHelper("timestamp", () => Date.now().toString());

  // Sets a template variable
  plop.addHelper("set", (name, value, options) => {
    if (!options.data.root) {
      options.data.root = {};
    }
    options.data.root[name] = value;
  });
}
