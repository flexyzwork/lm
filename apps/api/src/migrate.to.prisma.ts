import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const client = new DynamoDBClient({
  region: "ap-northeast-2",
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "DUMMYIDEXAMPLE",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "DUMMYEXAMPLEKEY",
  },
});

const TABLE_NAME = "Course";

// 🔥 1. DynamoDB 데이터를 일반 JSON으로 변환 (AttributeValue → 일반 타입)
function unmarshallDynamoDBItem(item: any) {
  const converted: any = {};
  for (const key in item) {
    if (item[key].S !== undefined) {
      converted[key] = item[key].S;
    } else if (item[key].N !== undefined) {
      converted[key] = Number(item[key].N);
    } else if (item[key].BOOL !== undefined) {
      converted[key] = item[key].BOOL;
    } else if (item[key].L !== undefined) {
      converted[key] = item[key].L.length > 0 ? item[key].L.map(unmarshallDynamoDBItem) : [];
    } else if (item[key].M !== undefined) {
      converted[key] = Object.keys(item[key].M).length > 0 ? unmarshallDynamoDBItem(item[key].M) : {};
    }
  }
  return converted;
}

// 🔥 2. DynamoDB에서 모든 강의 가져오기
async function fetchAllCoursesFromDynamoDB() {
  const command = new ScanCommand({ TableName: TABLE_NAME });

  try {
    const { Items } = await client.send(command);
    return Items ? Items.map(unmarshallDynamoDBItem) : [];
  } catch (error) {
    console.error("❌ DynamoDB Scan 실패:", error);
    return [];
  }
}

// 🔥 3. PostgreSQL로 데이터 마이그레이션
async function migrateCoursesToPostgres() {
  console.log("🚀 시작: DynamoDB → PostgreSQL 마이그레이션");
  const courses = await fetchAllCoursesFromDynamoDB();

  for (const course of courses) {
    try {
      // 📌 강의 저장
      const createdCourse = await prisma.course.create({
        data: {
          courseId: course.courseId || uuidv4(),
          teacherId: course.teacherId,
          teacherName: course.teacherName,
          title: course.title || "Untitled Course",
          description: course.description || "",
          category: course.category || "Uncategorized",
          image: course.image || "",
          price: course.price || 0,
          level: course.level as "Beginner" | "Intermediate" | "Advanced",
          status: course.status as "Draft" | "Published",
        },
      });

      console.log(`✅ 성공: 강의(${createdCourse.courseId}) 저장 완료`);

      // 📌 섹션 저장
      for (const section of course.sections || []) {
        if (!section.sectionId) {
          console.warn(`⚠️ 섹션 ID 없음: ${section.sectionTitle}, 자동 생성`);
          section.sectionId = uuidv4();
        }

        const createdSection = await prisma.section.create({
          data: {
            sectionId: section.sectionId,
            courseId: createdCourse.courseId,
            sectionTitle: section.sectionTitle || "Untitled Section",
            sectionDescription: section.sectionDescription || "",
          },
        });

        console.log(`   ➡️  섹션(${createdSection.sectionId}) 저장 완료`);

        // 📌 챕터 저장 (섹션이 생성된 후 실행)
        for (const chapter of section.chapters || []) {
          if (!chapter.chapterId) {
            console.warn(`⚠️ 챕터 ID 없음: ${chapter.title}, 자동 생성`);
            chapter.chapterId = uuidv4();
          }

          await prisma.chapter.create({
            data: {
              chapterId: chapter.chapterId,
              sectionId: createdSection.sectionId,  // ✅ `sectionId`가 존재하도록 보장
              type: chapter.type as "Text" | "Quiz" | "Video",
              title: chapter.title || "Untitled Chapter",
              content: chapter.content || "",
            },
          });

          console.log(`      📌 챕터(${chapter.chapterId}) 저장 완료`);
        }
      }
    } catch (error) {
      console.error(`❌ 실패: 강의(${course.courseId}) 저장 중 오류 발생`, error);
    }
  }

  console.log("🎉 마이그레이션 완료");
}

// 실행
migrateCoursesToPostgres()
  .catch((err) => console.error("❌ 마이그레이션 오류:", err))
  .finally(() => prisma.$disconnect());