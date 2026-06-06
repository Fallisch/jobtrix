import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/de",
}));

describe("Header", () => {
  it("zeigt den App-Namen JobTRIX an", () => {
    render(<Header locale="de" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("JobTRIX")).toBeInTheDocument();
  });

  it("enthält einen Link zur Startseite", () => {
    render(<Header locale="de" />);
    const link = screen.getByRole("link", { name: /jobtrix/i });
    expect(link).toHaveAttribute("href", "/de");
  });

  it("zeigt den Sprachumschalter an", () => {
    render(<Header locale="de" />);
    expect(screen.getByRole("button", { name: /english/i })).toBeInTheDocument();
  });
});
