import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InfoTooltip from "@/components/InfoTooltip";

describe("InfoTooltip", () => {
  it("zeigt einen antippbaren Info-Trigger an", () => {
    render(<InfoTooltip text="Hilfetext" />);
    expect(screen.getByTestId("info-tooltip-trigger")).toBeInTheDocument();
  });

  it("öffnet den Tooltip-Inhalt beim Klick", async () => {
    render(<InfoTooltip text="Hilfetext" />);

    expect(screen.queryByTestId("info-tooltip-content")).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("info-tooltip-trigger"));

    expect(screen.getByTestId("info-tooltip-content")).toHaveTextContent("Hilfetext");
  });

  it("rendert das Info-Icon dezent klein (w-4 h-4 statt w-5 h-5)", () => {
    render(<InfoTooltip text="Hilfetext" />);
    const trigger = screen.getByTestId("info-tooltip-trigger");
    // Kleineres Icon, passend zur Label-Schrift auf Mobile (#229).
    expect(trigger.className).toContain("w-4");
    expect(trigger.className).toContain("h-4");
    expect(trigger.className).not.toContain("w-5");
    expect(trigger.className).not.toContain("h-5");
  });
});
