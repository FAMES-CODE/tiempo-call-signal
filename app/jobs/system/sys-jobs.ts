import prisma from "../../../app/db";
import bcrypt from "bcrypt";

export async function checkAdmin() {
  console.log("Checking for admin user...");
  const admin = await prisma.user.findFirst({
    where: { role: "admin" },
  });
  if (!admin) {
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD?.trim();
    if (!defaultPassword) {
      console.error(
        "[startup] Aucun admin en base : définissez DEFAULT_ADMIN_PASSWORD pour en créer un.",
      );
      return;
    }
    console.log("No admin user found. Creating default admin user...");
    await prisma.user.create({
      data: {
        username: "admin",
        password: await bcrypt.hash(defaultPassword, 10),
        role: "admin",
      },
    });
    console.log("Admin user created with username");
  }
  return console.log("Admin user check complete.");
}
