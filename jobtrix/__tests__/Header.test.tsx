import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

describe("Header", () => {
  it("zeigt den App-Namen JobTRIX an", () => {
    render(<Header />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("JobTRIX")).toBeInTheDocument();
  });

  it("enthält einen Link zur Startseite", () => {
    render(<Header />);
    const link = screen.getByRole("link", { name: /jobtrix/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
