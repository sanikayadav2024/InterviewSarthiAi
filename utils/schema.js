import { pgTable, serial, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";

// MockInterview table
export const MockInterview = pgTable("mockinterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonmockresp").notNull(),      // lowercase column
  jobPosition: varchar("jobposition").notNull(),     // lowercase column
  jobDesc: varchar("jobdesc").notNull(),            // lowercase column
  jobExperience: varchar("jobexperience").notNull(),// lowercase column
  createdBy: varchar("createdby").notNull(),        // lowercase column
  createdAt: varchar("createdat"),
  mockId: varchar("mockid").notNull()
});

// Question table
export const Question = pgTable("question", {
  id: serial("id").primaryKey(),
  MockQuestionJsonResp: text("mockquestionjsonresp").notNull(),
  jobPosition: varchar("jobposition").notNull(),
  jobDesc: varchar("jobdesc").notNull(),
  jobExperience: varchar("jobexperience").notNull(),
  typeQuestion: varchar("typequestion").notNull(),
  company: varchar("company").notNull(),
  createdBy: varchar("createdby").notNull(),
  createdAt: varchar("createdat"),
  mockId: varchar("mockid").notNull()
});

// UserAnswer table
export const UserAnswer = pgTable("useranswer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockid").notNull(),
  question: varchar("question").notNull(),
  correctAns: text("correctans"),
  userAns: text("userans"),
  feedback: text("feedback"),
  rating: varchar("rating"),
  userEmail: varchar("useremail"),
  createdAt: varchar("createdat")
});



// Newsletter table
export const Newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  newname: varchar("newname"),
  newemail: varchar("newemail"),
  newmessage: text("newmessage"),
  createdat: varchar("createdat"),
});

// DailyQuestion table
export const DailyQuestion = pgTable("dailyquestion", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category"),
  difficulty: varchar("difficulty"),
  createdby: varchar("createdby"),
  questionDate: varchar("questiondate").notNull().unique(),
  createdAt: timestamp("createdat").defaultNow().notNull(),
});

// DailyQuestionAnswers table

export const DailyQuestionAnswers = pgTable("dailyquestionanswers", {
  id: serial("id").primaryKey(),
  questionId: integer("questionid")
    .references(() => DailyQuestion.id) // foreign key to dailyquestion
    .notNull(),
  answer: text("answer").notNull(),
  submittedBy: varchar("submittedby", { length: 255 }).notNull(),
  submittedAt: timestamp("submittedat").defaultNow().notNull(),
});



