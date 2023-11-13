import type { Event } from "@yuudachi/framework/types";
import { Client, Events } from "discord.js";
import { injectable } from "tsyringe";
import { logger } from "#logger";

@injectable()
export default class implements Event {
  public name = "Debug logging";

  public event = Events.Debug as const;

  public disabled = true;

  public constructor(private readonly client: Client<true>) {}

  public execute(): void {
    this.client.on(this.event, async (message) => {
      logger.debug(message);
    });
  }
}
