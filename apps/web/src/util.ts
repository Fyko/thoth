import { t } from "i18next";

type Arg = { description: string; name: string };

export function withCommonArguments(args: Arg[]): Arg[] {
  return [
    {
      name: t("common.commands.args.limit"),
    },
  ];
}
