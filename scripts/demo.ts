/**
 * End-to-end pipeline smoke test, no UI:
 *   npm run demo
 * Requires DATABASE_URL and OPENROUTER_API_KEY in .env, and `npm run db:push` first.
 */
import { db } from "../src/lib/db";
import { getCurrentUser } from "../src/lib/auth";
import { generateOutline } from "../src/lib/generation/outline";
import { generateWeeks } from "../src/lib/generation/weeks";
import { generateLessons } from "../src/lib/generation/lessons";

async function main() {
  const user = await getCurrentUser();

  const curriculum = await db.curriculum.create({
    data: {
      userId: user.id,
      title: "DEMO — 5th Grade Science 2026-27",
      subject: "Science",
      gradeLevel: "5th grade",
      entryMode: "FROM_SCRATCH",
      learnerProfile:
        "One 10-year-old, homeschooled. Curious about space and animals, loses focus on long reading. Comfortable writing a few sentences. Has done basic experiments before.",
      preferences: {
        approach: "hands-on, inquiry-based, lots of observation",
        minutesPerDay: 45,
        resourcesOnHand: "kitchen supplies, magnifying glass, library access, printer",
        notes: "Prefers doing over reading. Keep writing short.",
      },
      calendar: {
        startDate: "2026-09-08",
        endDate: "2027-06-11",
        daysPerWeek: 4,
        weeksOfInstruction: 32,
        breaks: [],
      },
    },
  });
  console.log(`\nCurriculum ${curriculum.id}\n`);

  console.log("Generating year outline…");
  const units = await generateOutline(curriculum.id);
  units.forEach((u) => console.log(`  ${u.order}. ${u.title} (~${u.estWeeks}w)`));

  const unit1 = units[0];
  console.log(`\nBreaking Unit 1 "${unit1.title}" into weeks…`);
  const weeks = await generateWeeks(unit1.id);
  weeks.forEach((w) => console.log(`  Week ${w.order}: ${w.focus}`));

  const week1 = weeks[0];
  console.log(`\nGenerating lessons for Week 1 "${week1.focus}"…`);
  const lessons = await generateLessons(week1.id);
  lessons.forEach((l) => {
    console.log(`\n  Day ${l.order}: ${l.title} (${l.timeEstimateMin} min)`);
    console.log(`    Objective: ${l.objective}`);
    console.log(`    Hook: ${l.hook}`);
    console.log(`    Instruction: ${l.instruction}`);
    console.log(`    Practice: ${l.practice}`);
    console.log(`    Assessment: ${l.assessment}`);
    console.log(`    Differentiation: ${l.differentiation}`);
  });

  console.log(`\nDone. Open the app and visit /curriculum/${curriculum.id}\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
