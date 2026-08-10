import { Router, type IRouter } from "express";
import { AskQuestionBody, AskQuestionResponse } from "@workspace/api-zod";
import { datasetStore } from "../store";

const router: IRouter = Router();

router.post("/questions", (req, res) => {
  const input = AskQuestionBody.parse(req.body);
  const dataset = input.dataset_id ? datasetStore.get(input.dataset_id) : undefined;
  const question = input.question.toLowerCase();
  let answer =
    "I can answer this once you upload a dataset with a date and amount column. The analysis will be computed from your rows, not guessed by the assistant.";
  let demo = true;

  if (dataset && dataset.id !== "demo-retail") {
    demo = false;
    if (question.includes("top") || question.includes("most") || question.includes("best")) {
      answer = dataset.profile.top_product
        ? `${dataset.profile.top_product} is the leading product or service by detected revenue at $${dataset.profile.top_product_revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}.`
        : "I could not identify a product or service column confidently enough to rank items.";
    } else if (question.includes("profit") || question.includes("margin")) {
      answer = dataset.profile.cost_column && dataset.profile.revenue_column
        ? `Detected revenue is $${dataset.profile.revenue_total.toLocaleString(undefined, { maximumFractionDigits: 2 })} and detected cost is $${dataset.profile.cost_total.toLocaleString(undefined, { maximumFractionDigits: 2 })}, leaving $${dataset.profile.profit_total.toLocaleString(undefined, { maximumFractionDigits: 2 })} before other expenses.`
        : "I need both a revenue and cost column to calculate profit safely.";
    } else if (question.includes("revenue") || question.includes("sales") || question.includes("amount")) {
      answer = dataset.profile.revenue_column
        ? `Detected revenue totals $${dataset.profile.revenue_total.toLocaleString(undefined, { maximumFractionDigits: 2 })} across ${dataset.row_count.toLocaleString()} rows, using “${dataset.profile.revenue_column}”.`
        : "I could not detect a revenue or amount column confidently enough to answer that.";
    } else if (question.includes("quantity") || question.includes("units") || question.includes("hours")) {
      answer = dataset.profile.quantity_column
        ? `Detected quantity totals ${dataset.profile.quantity_total.toLocaleString(undefined, { maximumFractionDigits: 2 })} using “${dataset.profile.quantity_column}”.`
        : "I could not detect a quantity, units, or hours column confidently enough to answer that.";
    } else if (question.includes("column") || question.includes("data") || question.includes("schema")) {
      answer = `I reviewed ${dataset.columns.length} columns across ${dataset.row_count.toLocaleString()} rows. ${dataset.profile.mappings.length} columns have a confident business meaning; ${dataset.profile.warnings.length} review item${dataset.profile.warnings.length === 1 ? "" : "s"} remain.`;
    }
  }

  res.status(201).json(
    AskQuestionResponse.parse({
      question: input.question,
      answer,
      demo,
    }),
  );
});

export default router;