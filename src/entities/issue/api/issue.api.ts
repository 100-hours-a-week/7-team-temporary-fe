import { apiFetch, Endpoint } from "@/shared/api";
import type { CreateIssueRequestDto } from "./types";

export async function createIssue(payload: CreateIssueRequestDto): Promise<void> {
  await apiFetch<void, CreateIssueRequestDto>(Endpoint.ISSUE.BASE, {
    method: "POST",
    body: payload,
    authRequired: true,
  });
}
