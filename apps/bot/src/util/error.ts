/**
 * An error that is thrown when a command fails.
 *
 * This doesn't need to be logged as an error, as it is a normal part of the
 * command execution process.
 */
export class CommandError extends Error {
  public constructor(message: string) {
    super(message);

    this.name = "CommandError";
  }
}
