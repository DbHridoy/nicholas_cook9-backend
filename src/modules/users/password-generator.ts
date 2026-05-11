import { randomInt } from "node:crypto";

const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const lowercase = "abcdefghijkmnopqrstuvwxyz";
const digits = "23456789";
const symbols = "!@#$%^&*";
const allCharacters = `${uppercase}${lowercase}${digits}${symbols}`;

const pick = (characters: string) => characters[randomInt(0, characters.length)];

export const createTemporaryPassword = (length = 14) => {
  const requiredCharacters = [pick(uppercase), pick(lowercase), pick(digits), pick(symbols)];
  const remainingCharacters = Array.from({ length: length - requiredCharacters.length }, () =>
    pick(allCharacters),
  );
  const passwordCharacters = [...requiredCharacters, ...remainingCharacters];

  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] = [
      passwordCharacters[swapIndex],
      passwordCharacters[index],
    ];
  }

  return passwordCharacters.join("");
};
