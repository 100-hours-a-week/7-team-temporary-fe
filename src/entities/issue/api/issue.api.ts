import { apiFetch, Endpoint } from "@/shared/api";
import { AuthService } from "@/shared/auth";
import type { CreateIssueRequestDto } from "./types";

export async function createIssue(payload: CreateIssueRequestDto): Promise<void> {
  await AuthService.refreshAndRetry(() =>
    apiFetch<void, CreateIssueRequestDto>(Endpoint.ISSUE.BASE, {
      method: "POST",
      body: payload,
      authRequired: true,
    }),
  );
}
