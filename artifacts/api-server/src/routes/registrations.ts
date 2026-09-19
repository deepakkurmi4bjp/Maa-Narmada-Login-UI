import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, registrationsTable } from "@workspace/db";
import {
  CreateRegistrationBody,
  CreateRegistrationResponse,
  DeleteRegistrationParams,
  ListRegistrationsResponse,
  UpdateRegistrationBody,
  UpdateRegistrationParams,
  UpdateRegistrationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/registrations", async (_req, res): Promise<void> => {
  const registrations = await db
    .select()
    .from(registrationsTable)
    .orderBy(desc(registrationsTable.createdAt));

  res.json(ListRegistrationsResponse.parse(registrations));
});

router.post("/registrations", async (req, res): Promise<void> => {
  const parsed = CreateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [registration] = await db
    .insert(registrationsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateRegistrationResponse.parse(registration));
});

router.patch("/registrations/:id", async (req, res): Promise<void> => {
  const params = UpdateRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRegistrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [registration] = await db
    .update(registrationsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(registrationsTable.id, params.data.id))
    .returning();

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.json(UpdateRegistrationResponse.parse(registration));
});

router.delete("/registrations/:id", async (req, res): Promise<void> => {
  const params = DeleteRegistrationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [registration] = await db
    .delete(registrationsTable)
    .where(eq(registrationsTable.id, params.data.id))
    .returning({ id: registrationsTable.id });

  if (!registration) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;