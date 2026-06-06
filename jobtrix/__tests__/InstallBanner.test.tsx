import { render, screen, fireEvent, act } from "@testing-library/react";
import InstallBanner from "@/components/InstallBanner";

const mockBeforeInstallPromptEvent = () => {
  const event = new Event("beforeinstallprompt") as BeforeInstallPromptEvent;
  event.prompt = jest.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome: "accepted", platform: "" });
  return event;
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string; platform: string }>;
}

describe("InstallBanner", () => {
  it("ist initial nicht sichtbar", () => {
    render(<InstallBanner />);
    expect(screen.queryByRole("region", { name: /install/i })).not.toBeInTheDocument();
  });

  it("erscheint wenn das beforeinstallprompt-Event ausgelöst wird", async () => {
    render(<InstallBanner />);

    await act(async () => {
      const event = mockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });

    expect(screen.getByRole("region", { name: /installieren/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /installieren/i })).toBeInTheDocument();
  });

  it("verschwindet wenn der Nutzer es schließt", async () => {
    render(<InstallBanner />);

    await act(async () => {
      const event = mockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });

    fireEvent.click(screen.getByRole("button", { name: /schließen/i }));
    expect(screen.queryByRole("region", { name: /installieren/i })).not.toBeInTheDocument();
  });
});
