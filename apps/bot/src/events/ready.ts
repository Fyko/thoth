import type { Event } from "@yuudachi/framework/types";
import { Client, Events } from "discord.js";
import { Gauge } from "prom-client";
import { inject, injectable } from "tsyringe";
import { logger } from "#logger";
import { kGuildCountGuage } from "#util/symbols.js";

@injectable()
export default class implements Event {
  public name = "Ready handling";

  public event = Events.ClientReady as const;

  public constructor(
    private readonly client: Client<true>,
    @inject(kGuildCountGuage) private readonly guildCount: Gauge<string>,
  ) {}

  public execute(): void {
    this.client.on(this.event, async () => {
      logger.info(`Client is ready! Logged in as ${this.client.user!.tag}`);

      const guilds = this.client.guilds.cache.size;
      this.guildCount.set(guilds);
    });
  }
}
