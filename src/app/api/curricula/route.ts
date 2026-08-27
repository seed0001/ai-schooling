import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CalendarSchema, PreferencesSchema } from "@/lib/types";

const Body = z.object({
  title: z.string().min(2),
  subject: z.string().min(2),
  gradeLevel: z.string().min(1),
  entryMode: z.enum(["FROM_SCRATCH", "AROUND_SPINE", "FROM_GOALS"]).default("FROM_SCRATCH"),
  sourceMaterial: z.string().optional(),
  learnerProfile: z.string().min(10),
  preferences: PreferencesSchema.partial().optional(),
  calendar: CalendarSchema.partial().optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const b = parsed.data;

  const curriculum = await db.curriculum.create({
    data: {
      userId: user.id,
      title: b.title,
      subject: b.subject,
      gradeLevel: b.gradeLevel,
      entryMode: b.entryMode,
      sourceMaterial: b.sourceMaterial?.trim() || null,
      learnerProfile: b.learnerProfile,
      preferences: PreferencesSchema.parse(b.preferences ?? {}),
      calendar: CalendarSchema.parse(b.calendar ?? {}),
    },
  });

  return NextResponse.json({ id: curriculum.id });
}
