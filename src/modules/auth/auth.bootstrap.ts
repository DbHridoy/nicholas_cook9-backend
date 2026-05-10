import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { userRepository } from "../users/user.repository.js";

export const seedSuperAdmin = async () => {
  const existingSuperAdmin = await userRepository.existsByRole("super_admin");

  if (existingSuperAdmin) {
    return;
  }

  const existingEmailOwner = await userRepository.existsByEmail(env.SUPER_ADMIN_EMAIL);

  if (existingEmailOwner) {
    logger.warn(
      { email: env.SUPER_ADMIN_EMAIL },
      "SUPER_ADMIN_EMAIL already belongs to another user. Super admin was not seeded.",
    );
    return;
  }

  await userRepository.createSuperAdmin({
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD,
  });

  logger.info({ email: env.SUPER_ADMIN_EMAIL }, "Super admin seeded");
};
