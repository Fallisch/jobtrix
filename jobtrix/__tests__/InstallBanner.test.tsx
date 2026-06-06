import { render, screen, fireEvent, act } from "@testing-library/react";
import InstallBanner from "@/components/InstallBanner";

jest.mock("next-intl", () => ({
  useTranslations: (ns: string) => {
    const t: Record<string, Record<string, string>> = {
      installBanner: {
        message: "JobTRIX auf dem Startbildschirm installieren",
        install: "Installieren",
        close: "Schließen",
      },
    };
    return (key: string) => t[ns]?.[key] ?? key;
  },
}));

function renderWithIntl(ui: React.ReactElement) {
  return render(ui);
}

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
    renderWithIntl(<InstallBanner />);
    expect(screen.queryByRole("region", { name: /install/i })).not.toBeInTheDocument();
  });

  it("erscheint wenn das beforeinstallprompt-Event ausgelöst wird", async () => {
    renderWithIntl(<InstallBanner />);

    await act(async () => {
      const event = mockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });

    expect(screen.getByRole("region", { name: /installieren/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /installieren/i })).toBeInTheDocument();
  });

  it("verschwindet wenn der Nutzer es schließt", async () => {
    renderWithIntl(<InstallBanner />);

    await act(async () => {
      const event = mockBeforeInstallPromptEvent();
      window.dispatchEvent(event);
    });

    fireEvent.click(screen.getByRole("button", { name: /schließen/i }));
    expect(screen.queryByRole("region", { name: /installieren/i })).not.toBeInTheDocument();
  });
});
