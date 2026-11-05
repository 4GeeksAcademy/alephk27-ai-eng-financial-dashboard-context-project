// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

vi.mock("@/components/dashboard/dashboard-header", () => ({
  DashboardHeader: ({ period }: { period: string }) => <h1>{period}</h1>,
}));

vi.mock("@/components/dashboard/kpi-row", () => ({
  KPIRow: ({ metrics, loading }: { metrics: unknown; loading: boolean }) => (
    <div data-testid="kpi-row">
      {loading ? "Loading KPIs" : JSON.stringify(metrics)}
    </div>
  ),
}));

vi.mock("@/components/dashboard/income-outcome-chart", () => ({
  IncomeOutcomeChart: () => <div>Income/outcome chart</div>,
}));

vi.mock("@/components/dashboard/profit-percent-chart", () => ({
  ProfitPercentChart: () => <div>Profit chart</div>,
}));

const validMovements = [
  {
    create_date: "2024-01-15",
    amount: 100,
    operation_type: "income",
    category: "sales",
    business_type: "B2B",
  },
];

describe("App data loading", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders calculated metrics after a successful response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => validMovements,
    } as Response);

    render(<App />);

    expect(await screen.findByText(/\"totalIncome\":100/)).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an alert for a non-successful HTTP response", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 503 } as Response);

    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo cargar la informacion financiera.",
    );
    expect(screen.getByTestId("kpi-row").textContent).toContain("Loading KPIs");
  });

  it("shows an alert when the network request is rejected", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network unavailable"));

    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo cargar la informacion financiera.",
    );
  });

  it("shows an alert when the API payload is malformed", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ ...validMovements[0], amount: "100" }],
    } as Response);

    render(<App />);

    expect((await screen.findByRole("alert")).textContent).toContain(
      "No se pudo cargar la informacion financiera.",
    );
  });
});