import { Router, type IRouter } from "express";
import { AskQuestionBody, AskQuestionResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/questions", (req, res) => {
  const input = AskQuestionBody.parse(req.body);
  res.status(201).json(
    AskQuestionResponse.parse({
      question: input.question,
      answer:
        "This is a demo response. Once a dataset is connected, BizLens will compute the answer from your business data and explain the result here.",
      demo: true,
    }),
  );
});

export default router;