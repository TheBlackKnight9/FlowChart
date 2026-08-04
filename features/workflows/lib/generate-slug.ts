import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

/**
 * Generates a random hyphenated slug using an adjective and an animal name.
 * Example output: "brave-otter", "swift-fox"
 */
export function generateSlug(): string {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    style: "lowerCase",
  });
}
