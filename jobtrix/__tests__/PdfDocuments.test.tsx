import { render, screen, within } from "@testing-library/react";
import React from "react";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { ProfileData } from "@/lib/profile-storage";

const profile: ProfileData = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  email: "anna@example.de",
  phone: "0151 12345678",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  experience: [],
  qualifications: [{ label: "Python", value: 80 }, { label: "SQL", value: 60 }],
  interests: [{ label: "Datenanalyse", value: 40 }],
};

describe("CoverLetterDocument – PDF-Layout", () => {
  it("enthält den Namen des Nutzers im Header", () => {
    render(<CoverLetterDocument coverLetter="Sehr geehrte Damen" profile={profile} />);
    expect(screen.getByText("Anna Beispiel")).toBeInTheDocument();
  });

  it("enthält die Adresse des Nutzers im Header", () => {
    render(<CoverLetterDocument coverLetter="Sehr geehrte Damen" profile={profile} />);
    expect(screen.getByText("Hauptstraße 5, 10115 Berlin")).toBeInTheDocument();
  });

  it("enthält den Anschreiben-Text", () => {
    render(<CoverLetterDocument coverLetter="Mein individuelles Anschreiben" profile={profile} />);
    expect(screen.getByText("Mein individuelles Anschreiben")).toBeInTheDocument();
  });
});

describe("CvDocument – PDF-Layout", () => {
  it("enthält den Namen des Nutzers im Header", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} />);
    expect(screen.getByText("Anna Beispiel")).toBeInTheDocument();
  });

  it("enthält die Adresse des Nutzers im Header", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} />);
    expect(screen.getByText("Hauptstraße 5, 10115 Berlin")).toBeInTheDocument();
  });

  it("zeigt den KI-Freitext nur, wenn weder Erfahrung noch Ausbildung vorhanden sind", () => {
    const noTimelineProfile = { ...profile, education: [], experience: [] };
    render(<CvDocument cv="Mein detaillierter Lebenslauf" profile={noTimelineProfile} />);
    expect(screen.getByText("Mein detaillierter Lebenslauf")).toBeInTheDocument();
  });

  it("zeigt strukturierte Ausbildung statt Freitext, wenn Ausbildungseinträge vorhanden sind", () => {
    render(<CvDocument cv="Mein detaillierter Lebenslauf" profile={profile} />);
    expect(screen.queryByText("Mein detaillierter Lebenslauf")).not.toBeInTheDocument();
    expect(screen.getByTestId("classic-cv-education")).toBeInTheDocument();
  });
});

describe("CoverLetterDocument – Modern-Layout", () => {
  it("rendert eine Sidebar mit dem Namen des Nutzers", () => {
    render(<CoverLetterDocument coverLetter="Sehr geehrte Damen" profile={profile} template="modern" />);
    const sidebar = screen.getByTestId("modern-sidebar");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveTextContent("Anna Beispiel");
  });

  it("rendert den Anschreiben-Text im Hauptbereich", () => {
    render(<CoverLetterDocument coverLetter="Mein modernes Anschreiben" profile={profile} template="modern" />);
    const content = screen.getByTestId("modern-content");
    expect(content).toHaveTextContent("Mein modernes Anschreiben");
  });

  it("klassisches Layout hat keine Sidebar", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="classic" />);
    expect(screen.queryByTestId("modern-sidebar")).not.toBeInTheDocument();
  });
});

describe("CoverLetterDocument – Modern-Layout Farbe", () => {
  it("Standardfarbe der Sidebar ist #1E3A5F wenn kein accentColor übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="modern" />);
    const sidebar = screen.getByTestId("modern-sidebar");
    expect(sidebar).toHaveStyle({ backgroundColor: "#1E3A5F" });
  });

  it("Sidebar verwendet accentColor wenn übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="modern" accentColor="#1A5C38" />);
    const sidebar = screen.getByTestId("modern-sidebar");
    expect(sidebar).toHaveStyle({ backgroundColor: "#1A5C38" });
  });

  it("accentColor hat keinen Effekt auf klassisches Layout", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="classic" accentColor="#1A5C38" />);
    expect(screen.queryByTestId("modern-sidebar")).not.toBeInTheDocument();
  });
});

describe("CoverLetterDocument – Modern-Layout Profilfoto", () => {
  it("zeigt Foto im Modern-Layout wenn vorhanden", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CoverLetterDocument coverLetter="Brief" profile={profileWithPhoto} template="modern" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    const profileWithoutPhoto = { ...profile, photo: null };
    expect(() =>
      render(<CoverLetterDocument coverLetter="Brief" profile={profileWithoutPhoto} template="modern" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Modern-Layout Farbe", () => {
  it("Standardfarbe des Headers ist #1E3A5F wenn kein accentColor übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const header = screen.getByTestId("modern-cv-header");
    expect(header).toHaveStyle({ backgroundColor: "#1E3A5F" });
  });

  it("Header verwendet accentColor wenn übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" accentColor="#5C1A1A" />);
    const header = screen.getByTestId("modern-cv-header");
    expect(header).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });
});

describe("CvDocument – Modern-Layout (Beispiel-Layout-Stil)", () => {
  it("rendert Foto-Banner in der Kopfzeile", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} template="modern" />);
    const header = screen.getByTestId("modern-cv-header");
    expect(header).toBeInTheDocument();
  });

  it("rendert Name im Lebenslauf", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} template="modern" />);
    expect(screen.getByText("Anna Beispiel")).toBeInTheDocument();
  });

  it("rendert Profildaten im linken Hauptbereich ohne doppelte Persönliche Daten", () => {
    render(<CvDocument cv="Mein moderner Lebenslauf" profile={profile} template="modern" />);
    const content = screen.getByTestId("modern-content");
    expect(content).not.toHaveTextContent("Persönliche Daten");
    expect(content).toHaveTextContent("HU Berlin");
  });

  it("rendert Qualifikationen in der rechten Spalte", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const quals = screen.getByTestId("modern-cv-quals");
    expect(quals).toHaveTextContent("Python");
    expect(quals).toHaveTextContent("SQL");
  });

  it("rendert Interessen in der rechten Spalte", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const interests = screen.getByTestId("modern-cv-interests");
    expect(interests).toHaveTextContent("Datenanalyse");
  });

  it("rendert Foto wenn vorhanden", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CvDocument cv="CV" profile={profileWithPhoto} template="modern" />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "data:image/png;base64,abc123");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CvDocument cv="CV" profile={{ ...profile, photo: null }} template="modern" />)
    ).not.toThrow();
  });

  it("klassisches Layout hat keine modern-cv-header", () => {
    render(<CvDocument cv="CV" profile={profile} template="classic" />);
    expect(screen.queryByTestId("modern-cv-header")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Modern-Layout cvStyle", () => {
  const profileMultiEdu: ProfileData = {
    ...profile,
    education: [
      { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
      { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
    ],
  };

  it("zeigt Ausbildungseinträge chronologisch bei cvStyle classic", () => {
    render(<CvDocument cv="CV" profile={profileMultiEdu} template="modern" cvStyle="classic" />);
    const entries = screen.getAllByTestId("modern-edu-entry");
    expect(entries[0]).toHaveTextContent("2014");
    expect(entries[1]).toHaveTextContent("2018");
  });

  it("zeigt Ausbildungseinträge antichronologisch bei cvStyle american", () => {
    render(<CvDocument cv="CV" profile={profileMultiEdu} template="modern" cvStyle="american" />);
    const entries = screen.getAllByTestId("modern-edu-entry");
    expect(entries[0]).toHaveTextContent("2018");
    expect(entries[1]).toHaveTextContent("2014");
  });

  it("verhält sich wie classic wenn cvStyle fehlt", () => {
    render(<CvDocument cv="CV" profile={profileMultiEdu} template="modern" />);
    const entries = screen.getAllByTestId("modern-edu-entry");
    expect(entries[0]).toHaveTextContent("2014");
    expect(entries[1]).toHaveTextContent("2018");
  });
});

describe("CvDocument – Modern-Layout Berufserfahrung", () => {
  const profileWithExperience: ProfileData = {
    ...profile,
    experience: [
      {
        id: "1",
        company: "Acme GmbH",
        position: "Entwickler",
        period: "01/2020 - 12/2022",
        tasks: "Backend-Entwicklung\nCode-Reviews",
      },
    ],
  };

  it("rendert Berufserfahrung-Sektion mit Firma, Position, Zeitraum und Aufgaben als Stichpunkte", () => {
    render(<CvDocument cv="CV" profile={profileWithExperience} template="modern" />);
    const entry = screen.getByTestId("modern-exp-entry");
    expect(entry).toHaveTextContent("Acme GmbH");
    expect(entry).toHaveTextContent("Entwickler");
    expect(entry).toHaveTextContent("01/2020 - 12/2022");
    expect(entry).toHaveTextContent("Backend-Entwicklung");
    expect(entry).toHaveTextContent("Code-Reviews");
  });

  it("zeigt Berufserfahrung vor Ausbildung in der linken Spalte", () => {
    render(<CvDocument cv="CV" profile={profileWithExperience} template="modern" />);
    const content = screen.getByTestId("modern-content");
    const headings = within(content).getAllByText(/^(Berufserfahrung|Ausbildung)$/);
    expect(headings[0]).toHaveTextContent("Berufserfahrung");
    expect(headings[1]).toHaveTextContent("Ausbildung");
  });

  it("zeigt keine Berufserfahrung-Sektion wenn keine Einträge vorhanden sind", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    expect(screen.queryByText("Berufserfahrung")).not.toBeInTheDocument();
    expect(screen.queryByTestId("modern-exp-entry")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Modern-Layout Berufserfahrung cvStyle", () => {
  const profileMultiExp: ProfileData = {
    ...profile,
    experience: [
      { id: "1", company: "Firma A", position: "Junior Entwickler", period: "2018 - 2020", tasks: "Aufgabe A" },
      { id: "2", company: "Firma B", position: "Senior Entwickler", period: "2020 - 2023", tasks: "Aufgabe B" },
    ],
  };

  it("zeigt Berufserfahrungseinträge chronologisch bei cvStyle classic", () => {
    render(<CvDocument cv="CV" profile={profileMultiExp} template="modern" cvStyle="classic" />);
    const entries = screen.getAllByTestId("modern-exp-entry");
    expect(entries[0]).toHaveTextContent("Firma A");
    expect(entries[1]).toHaveTextContent("Firma B");
  });

  it("zeigt Berufserfahrungseinträge antichronologisch bei cvStyle american", () => {
    render(<CvDocument cv="CV" profile={profileMultiExp} template="modern" cvStyle="american" />);
    const entries = screen.getAllByTestId("modern-exp-entry");
    expect(entries[0]).toHaveTextContent("Firma B");
    expect(entries[1]).toHaveTextContent("Firma A");
  });

  it("sortiert Ausbildung unabhängig von der Berufserfahrung-Sortierung", () => {
    const profileMulti: ProfileData = {
      ...profileMultiExp,
      education: [
        { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
        { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
      ],
    };
    render(<CvDocument cv="CV" profile={profileMulti} template="modern" cvStyle="american" />);
    const expEntries = screen.getAllByTestId("modern-exp-entry");
    const eduEntries = screen.getAllByTestId("modern-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma B");
    expect(eduEntries[0]).toHaveTextContent("2018");
  });
});

describe("CoverLetterDocument – Dokument-Kennzeichnung", () => {
  it("zeigt die Kennzeichnung 'Anschreiben' im klassischen Layout", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="classic" />);
    expect(screen.getByText("Anschreiben")).toBeInTheDocument();
  });

  it("zeigt die Kennzeichnung 'Anschreiben' im modernen Layout", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="modern" />);
    expect(screen.getByText("Anschreiben")).toBeInTheDocument();
  });
});

describe("CvDocument – Dokument-Kennzeichnung", () => {
  it("zeigt die Kennzeichnung 'Lebenslauf' im klassischen Layout", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} template="classic" />);
    expect(screen.getByText("Lebenslauf")).toBeInTheDocument();
  });

  it("zeigt die Kennzeichnung 'Lebenslauf' im modernen Layout", () => {
    render(<CvDocument cv="Lebenslauf-Inhalt" profile={profile} template="modern" />);
    expect(screen.getByText("Lebenslauf")).toBeInTheDocument();
  });
});

describe("CoverLetterDocument – Traditionell-Layout", () => {
  it("rendert Briefkopf mit Foto oben rechts neben den Kontaktdaten", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CoverLetterDocument coverLetter="Sehr geehrte Damen" profile={profileWithPhoto} template="traditional" />);
    const header = screen.getByTestId("traditional-header");
    const img = within(header).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
    expect(header.lastElementChild).toBe(img);
    expect(screen.getByText("Anna Beispiel")).toBeInTheDocument();
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CoverLetterDocument coverLetter="Brief" profile={{ ...profile, photo: null }} template="traditional" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("rendert Datum und Betreff im formalen Briefstil", () => {
    render(<CoverLetterDocument coverLetter="Sehr geehrte Damen" profile={profile} template="traditional" />);
    expect(screen.getByTestId("traditional-date")).toHaveTextContent(/^\d{2}\.\d{2}\.\d{4}$/);
    expect(screen.getByTestId("traditional-subject")).toHaveTextContent(/Betreff/i);
  });

  it("rendert den Anschreiben-Text", () => {
    render(<CoverLetterDocument coverLetter="Mein individuelles Anschreiben" profile={profile} template="traditional" />);
    expect(screen.getByText("Mein individuelles Anschreiben")).toBeInTheDocument();
  });

  it("ist schwarz-weiß unabhängig von übergebener Akzentfarbe", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="traditional" accentColor="#FF0000" />);
    const header = screen.getByTestId("traditional-header");
    expect(header).not.toHaveStyle({ backgroundColor: "#FF0000" });
    expect(screen.queryByTestId("modern-sidebar")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Traditionell-Layout", () => {
  const profileWithExperience: ProfileData = {
    ...profile,
    experience: [
      {
        id: "1",
        company: "Acme GmbH",
        position: "Entwickler",
        period: "01/2020 - 12/2022",
        tasks: "Backend-Entwicklung\nCode-Reviews",
      },
    ],
  };

  it("rendert Name und Kontaktdaten links sowie Foto oben rechts im Kopfbereich", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CvDocument cv="CV" profile={profileWithPhoto} template="traditional" />);
    const header = screen.getByTestId("traditional-header");
    expect(within(header).getByText("Anna Beispiel")).toBeInTheDocument();
    expect(within(header).getByText("Hauptstraße 5, 10115 Berlin")).toBeInTheDocument();
    const img = within(header).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
    expect(header.lastElementChild).toBe(img);
  });

  it("rendert Berufserfahrung als Tabelle mit Zeitraum links und Inhalt (inkl. Aufgaben-Stichpunkten) rechts", () => {
    render(<CvDocument cv="CV" profile={profileWithExperience} template="traditional" />);
    expect(screen.getByTestId("traditional-exp-table")).toBeInTheDocument();
    const row = screen.getByTestId("traditional-exp-row");
    expect(row).toHaveTextContent("01/2020 - 12/2022");
    expect(row).toHaveTextContent("Entwickler");
    expect(row).toHaveTextContent("Acme GmbH");
    expect(row).toHaveTextContent("Backend-Entwicklung");
    expect(row).toHaveTextContent("Code-Reviews");
  });

  it("rendert Ausbildung als Tabelle mit Zeitraum links und Inhalt rechts", () => {
    render(<CvDocument cv="CV" profile={profile} template="traditional" />);
    expect(screen.getByTestId("traditional-edu-table")).toBeInTheDocument();
    const row = screen.getByTestId("traditional-edu-row");
    expect(row).toHaveTextContent("2018");
    expect(row).toHaveTextContent("M.Sc.");
    expect(row).toHaveTextContent("HU Berlin");
  });

  it("rendert Qualifikationen und Interessen als Liste ohne Fortschrittsbalken", () => {
    render(<CvDocument cv="CV" profile={profile} template="traditional" />);
    expect(screen.getByTestId("traditional-quals")).toHaveTextContent("Python");
    expect(screen.getByTestId("traditional-quals")).toHaveTextContent("SQL");
    expect(screen.getByTestId("traditional-interests")).toHaveTextContent("Datenanalyse");
    expect(screen.queryAllByTestId("skill-bar-fill")).toHaveLength(0);
  });

  it("zeigt keine Berufserfahrung-Tabelle wenn keine Einträge vorhanden sind", () => {
    render(<CvDocument cv="CV" profile={profile} template="traditional" />);
    expect(screen.queryByTestId("traditional-exp-table")).not.toBeInTheDocument();
  });

  it("ist schwarz-weiß unabhängig von übergebener Akzentfarbe", () => {
    render(<CvDocument cv="CV" profile={profile} template="traditional" accentColor="#FF0000" />);
    const header = screen.getByTestId("traditional-header");
    expect(header).not.toHaveStyle({ backgroundColor: "#FF0000" });
    expect(screen.queryByTestId("modern-cv-header")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Traditionell-Layout cvStyle", () => {
  const profileMulti: ProfileData = {
    ...profile,
    education: [
      { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
      { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
    ],
    experience: [
      { id: "1", company: "Firma A", position: "Junior Entwickler", period: "2018 - 2020", tasks: "Aufgabe A" },
      { id: "2", company: "Firma B", position: "Senior Entwickler", period: "2020 - 2023", tasks: "Aufgabe B" },
    ],
  };

  it("sortiert Berufserfahrungs- und Ausbildungs-Tabelle bei cvStyle classic chronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="traditional" cvStyle="classic" />);
    const expRows = screen.getAllByTestId("traditional-exp-row");
    const eduRows = screen.getAllByTestId("traditional-edu-row");
    expect(expRows[0]).toHaveTextContent("Firma A");
    expect(eduRows[0]).toHaveTextContent("2014");
  });

  it("sortiert Berufserfahrungs- und Ausbildungs-Tabelle bei cvStyle american jeweils eigenständig antichronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="traditional" cvStyle="american" />);
    const expRows = screen.getAllByTestId("traditional-exp-row");
    const eduRows = screen.getAllByTestId("traditional-edu-row");
    expect(expRows[0]).toHaveTextContent("Firma B");
    expect(eduRows[0]).toHaveTextContent("2018");
  });
});

describe("CvDocument – Skill-Bar Breite", () => {
  it("Skill-Bar-Fill hat die Breite des übergebenen value", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const fills = screen.getAllByTestId("skill-bar-fill");
    expect(fills[0]).toHaveStyle({ width: "80%" });
    expect(fills[1]).toHaveStyle({ width: "60%" });
  });

  it("Interesse-Skill-Bar hat die Breite des übergebenen value", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const fills = screen.getAllByTestId("skill-bar-fill");
    const interestFill = fills[2];
    expect(interestFill).toHaveStyle({ width: "40%" });
  });
});

describe("CoverLetterDocument – Akzent-Layout", () => {
  it("rendert Foto-Banner mit Foto", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CoverLetterDocument coverLetter="Brief" profile={profileWithPhoto} template="accent" />);
    const banner = screen.getByTestId("accent-banner");
    const img = within(banner).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CoverLetterDocument coverLetter="Brief" profile={{ ...profile, photo: null }} template="accent" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("Namensband verwendet Standardfarbe wenn kein accentColor übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="accent" />);
    const nameBand = screen.getByTestId("accent-name-band");
    expect(nameBand).toHaveStyle({ backgroundColor: "#1E3A5F" });
    expect(nameBand).toHaveTextContent("Anna Beispiel");
  });

  it("Namensband verwendet accentColor wenn übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="accent" accentColor="#5C1A1A" />);
    const nameBand = screen.getByTestId("accent-name-band");
    expect(nameBand).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });

  it("rendert 'Bewerbung'-Band mit Akzentstreifen in gewählter Farbe", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="accent" accentColor="#5C1A1A" />);
    const band = screen.getByTestId("accent-bewerbung-band");
    expect(band).toHaveTextContent("Bewerbung");
    const stripes = band.querySelectorAll("div");
    expect(stripes[0]).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });

  it("rendert den Anschreiben-Text einspaltig", () => {
    render(<CoverLetterDocument coverLetter="Mein individuelles Anschreiben" profile={profile} template="accent" />);
    expect(screen.getByText("Mein individuelles Anschreiben")).toBeInTheDocument();
  });

  it("klassisches Layout hat kein Foto-Banner", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="classic" />);
    expect(screen.queryByTestId("accent-banner")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Akzent-Layout", () => {
  const profileWithExperience: ProfileData = {
    ...profile,
    experience: [
      {
        id: "1",
        company: "Acme GmbH",
        position: "Entwickler",
        period: "01/2020 - 12/2022",
        tasks: "Backend-Entwicklung\nCode-Reviews",
      },
    ],
  };

  it("rendert Foto-Banner mit Foto und Namensband", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CvDocument cv="CV" profile={profileWithPhoto} template="accent" />);
    const banner = screen.getByTestId("accent-banner");
    const img = within(banner).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
    expect(screen.getByTestId("accent-name-band")).toHaveTextContent("Anna Beispiel");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CvDocument cv="CV" profile={{ ...profile, photo: null }} template="accent" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("Namensband verwendet Standardfarbe wenn kein accentColor übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" />);
    expect(screen.getByTestId("accent-name-band")).toHaveStyle({ backgroundColor: "#1E3A5F" });
  });

  it("Namensband verwendet accentColor wenn übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" accentColor="#5C1A1A" />);
    expect(screen.getByTestId("accent-name-band")).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });

  it("rendert Berufserfahrung als Zeitstrahl mit Pfeil-Marker vor Ausbildung", () => {
    render(<CvDocument cv="CV" profile={profileWithExperience} template="accent" />);
    const content = screen.getByTestId("accent-content");
    const headings = within(content).getAllByText(/^(Berufserfahrung|Ausbildung)$/);
    expect(headings[0]).toHaveTextContent("Berufserfahrung");
    expect(headings[1]).toHaveTextContent("Ausbildung");

    const expEntry = screen.getByTestId("accent-exp-entry");
    expect(expEntry).toHaveTextContent(">");
    expect(expEntry).toHaveTextContent("01/2020 - 12/2022");
    expect(expEntry).toHaveTextContent("Acme GmbH");
    expect(expEntry).toHaveTextContent("Entwickler");
    expect(expEntry).toHaveTextContent("Backend-Entwicklung");
    expect(expEntry).toHaveTextContent("Code-Reviews");
  });

  it("rendert Ausbildung als eigenen Zeitstrahl-Abschnitt", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" />);
    const eduEntry = screen.getByTestId("accent-edu-entry");
    expect(eduEntry).toHaveTextContent(">");
    expect(eduEntry).toHaveTextContent("2018");
    expect(eduEntry).toHaveTextContent("M.Sc.");
    expect(eduEntry).toHaveTextContent("HU Berlin");
  });

  it("zeigt keine Berufserfahrung-Sektion wenn keine Einträge vorhanden sind", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" />);
    expect(screen.queryByText("Berufserfahrung")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accent-exp-entry")).not.toBeInTheDocument();
  });

  it("rendert Qualifikationen und Interessen als Fortschrittsbalken", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" />);
    const quals = screen.getByTestId("accent-cv-quals");
    expect(quals).toHaveTextContent("Python");
    const interests = screen.getByTestId("accent-cv-interests");
    expect(interests).toHaveTextContent("Datenanalyse");
    expect(screen.getAllByTestId("skill-bar-fill")).toHaveLength(3);
  });

  it("klassisches Layout hat kein Foto-Banner", () => {
    render(<CvDocument cv="CV" profile={profile} template="classic" />);
    expect(screen.queryByTestId("accent-banner")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Akzent-Layout cvStyle", () => {
  const profileMulti: ProfileData = {
    ...profile,
    education: [
      { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
      { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
    ],
    experience: [
      { id: "1", company: "Firma A", position: "Junior Entwickler", period: "2018 - 2020", tasks: "Aufgabe A" },
      { id: "2", company: "Firma B", position: "Senior Entwickler", period: "2020 - 2023", tasks: "Aufgabe B" },
    ],
  };

  it("sortiert Berufserfahrung und Ausbildung bei cvStyle classic chronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="accent" cvStyle="classic" />);
    const expEntries = screen.getAllByTestId("accent-exp-entry");
    const eduEntries = screen.getAllByTestId("accent-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma A");
    expect(eduEntries[0]).toHaveTextContent("2014");
  });

  it("sortiert Berufserfahrung und Ausbildung bei cvStyle american jeweils eigenständig antichronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="accent" cvStyle="american" />);
    const expEntries = screen.getAllByTestId("accent-exp-entry");
    const eduEntries = screen.getAllByTestId("accent-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma B");
    expect(eduEntries[0]).toHaveTextContent("2018");
  });
});

describe("CoverLetterDocument – Kreativ-Layout", () => {
  it("rendert eine Sidebar mit rundem Foto", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CoverLetterDocument coverLetter="Brief" profile={profileWithPhoto} template="creative" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    const img = within(sidebar).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CoverLetterDocument coverLetter="Brief" profile={{ ...profile, photo: null }} template="creative" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("Sidebar verwendet Standardfarbe wenn kein accentColor übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="creative" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    expect(sidebar).toHaveStyle({ backgroundColor: "#1E3A5F" });
  });

  it("Sidebar verwendet accentColor wenn übergeben", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="creative" accentColor="#5C1A1A" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    expect(sidebar).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });

  it("zeigt Kontaktdaten mit Icons in der Sidebar", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="creative" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    expect(sidebar).toHaveTextContent("Hauptstraße 5, 10115 Berlin");
    expect(sidebar).toHaveTextContent("anna@example.de");
    expect(sidebar).toHaveTextContent("0151 12345678");
    expect(within(sidebar).getByTestId("creative-icon-location")).toBeInTheDocument();
    expect(within(sidebar).getByTestId("creative-icon-email")).toBeInTheDocument();
    expect(within(sidebar).getByTestId("creative-icon-phone")).toBeInTheDocument();
  });

  it("rendert den Anschreiben-Text einspaltig", () => {
    render(<CoverLetterDocument coverLetter="Mein individuelles Anschreiben" profile={profile} template="creative" />);
    expect(screen.getByText("Mein individuelles Anschreiben")).toBeInTheDocument();
  });

  it("klassisches Layout hat keine Kreativ-Sidebar", () => {
    render(<CoverLetterDocument coverLetter="Brief" profile={profile} template="classic" />);
    expect(screen.queryByTestId("creative-sidebar")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Kreativ-Layout", () => {
  const profileWithExperience: ProfileData = {
    ...profile,
    experience: [
      {
        id: "1",
        company: "Acme GmbH",
        position: "Entwickler",
        period: "01/2020 - 12/2022",
        tasks: "Backend-Entwicklung\nCode-Reviews",
      },
    ],
  };

  it("rendert Sidebar mit rundem Foto und Namen", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CvDocument cv="CV" profile={profileWithPhoto} template="creative" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    const img = within(sidebar).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
    expect(sidebar).toHaveTextContent("Anna Beispiel");
  });

  it("rendert ohne Crash wenn kein Foto vorhanden", () => {
    expect(() =>
      render(<CvDocument cv="CV" profile={{ ...profile, photo: null }} template="creative" />)
    ).not.toThrow();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("Sidebar verwendet Standardfarbe wenn kein accentColor übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="creative" />);
    expect(screen.getByTestId("creative-sidebar")).toHaveStyle({ backgroundColor: "#1E3A5F" });
  });

  it("Sidebar verwendet accentColor wenn übergeben", () => {
    render(<CvDocument cv="CV" profile={profile} template="creative" accentColor="#5C1A1A" />);
    expect(screen.getByTestId("creative-sidebar")).toHaveStyle({ backgroundColor: "#5C1A1A" });
  });

  it("rendert Berufserfahrung und Ausbildung als getrennte Abschnitte mit Icon-Markern", () => {
    render(<CvDocument cv="CV" profile={profileWithExperience} template="creative" />);
    const content = screen.getByTestId("creative-content");
    const headings = within(content).getAllByText(/^(Berufserfahrung|Ausbildung)$/);
    expect(headings[0]).toHaveTextContent("Berufserfahrung");
    expect(headings[1]).toHaveTextContent("Ausbildung");

    const expEntry = screen.getByTestId("creative-exp-entry");
    expect(within(expEntry).getByTestId("creative-icon-briefcase")).toBeInTheDocument();
    expect(expEntry).toHaveTextContent("01/2020 - 12/2022");
    expect(expEntry).toHaveTextContent("Acme GmbH");
    expect(expEntry).toHaveTextContent("Entwickler");
    expect(expEntry).toHaveTextContent("Backend-Entwicklung");
    expect(expEntry).toHaveTextContent("Code-Reviews");

    const eduEntry = screen.getByTestId("creative-edu-entry");
    expect(within(eduEntry).getByTestId("creative-icon-graduation")).toBeInTheDocument();
    expect(eduEntry).toHaveTextContent("2018");
    expect(eduEntry).toHaveTextContent("M.Sc.");
    expect(eduEntry).toHaveTextContent("HU Berlin");
  });

  it("zeigt keine Berufserfahrung-Sektion wenn keine Einträge vorhanden sind", () => {
    render(<CvDocument cv="CV" profile={profile} template="creative" />);
    expect(screen.queryByText("Berufserfahrung")).not.toBeInTheDocument();
    expect(screen.queryByTestId("creative-exp-entry")).not.toBeInTheDocument();
  });

  it("rendert Qualifikationen und Interessen mit Icons als Fortschrittsbalken in der Sidebar", () => {
    render(<CvDocument cv="CV" profile={profile} template="creative" />);
    const sidebar = screen.getByTestId("creative-sidebar");
    const quals = within(sidebar).getByTestId("creative-cv-quals");
    expect(quals).toHaveTextContent("Python");
    expect(within(quals).getAllByTestId("creative-icon-star").length).toBeGreaterThan(0);
    const interests = within(sidebar).getByTestId("creative-cv-interests");
    expect(interests).toHaveTextContent("Datenanalyse");
    expect(within(interests).getAllByTestId("creative-icon-heart").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("skill-bar-fill")).toHaveLength(3);
  });

  it("klassisches Layout hat keine Kreativ-Sidebar", () => {
    render(<CvDocument cv="CV" profile={profile} template="classic" />);
    expect(screen.queryByTestId("creative-sidebar")).not.toBeInTheDocument();
  });
});

describe("CvDocument – Kreativ-Layout cvStyle", () => {
  const profileMulti: ProfileData = {
    ...profile,
    education: [
      { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
      { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
    ],
    experience: [
      { id: "1", company: "Firma A", position: "Junior Entwickler", period: "2018 - 2020", tasks: "Aufgabe A" },
      { id: "2", company: "Firma B", position: "Senior Entwickler", period: "2020 - 2023", tasks: "Aufgabe B" },
    ],
  };

  it("sortiert Berufserfahrung und Ausbildung bei cvStyle classic chronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="creative" cvStyle="classic" />);
    const expEntries = screen.getAllByTestId("creative-exp-entry");
    const eduEntries = screen.getAllByTestId("creative-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma A");
    expect(eduEntries[0]).toHaveTextContent("2014");
  });

  it("sortiert Berufserfahrung und Ausbildung bei cvStyle american jeweils eigenständig antichronologisch", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="creative" cvStyle="american" />);
    const expEntries = screen.getAllByTestId("creative-exp-entry");
    const eduEntries = screen.getAllByTestId("creative-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma B");
    expect(eduEntries[0]).toHaveTextContent("2018");
  });
});

describe("CvDocument – Accent-Layout: Skill-Bar-Farbe", () => {
  it("färbt die Skill-Balken in der übergebenen Akzentfarbe statt fixem Blau", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" accentColor="#5C1A1A" />);
    const fills = screen.getAllByTestId("skill-bar-fill");
    expect(fills.length).toBeGreaterThan(0);
    fills.forEach((fill) => expect(fill).toHaveStyle({ backgroundColor: "#5C1A1A" }));
  });

  it("nutzt ohne übergebene Akzentfarbe die Default-Akzentfarbe des accent-Templates, nicht das generische Blau", () => {
    render(<CvDocument cv="CV" profile={profile} template="accent" />);
    const fills = screen.getAllByTestId("skill-bar-fill");
    expect(fills.length).toBeGreaterThan(0);
    fills.forEach((fill) => {
      expect(fill).toHaveStyle({ backgroundColor: "#1E3A5F" });
      expect(fill).not.toHaveStyle({ backgroundColor: "#2F80ED" });
    });
  });
});

describe("CvDocument – Accent-Layout: Foto-loses Banner", () => {
  it("reduziert die Banner-Höhe ohne Foto, sodass kein voller Verlaufsblock leer bleibt", () => {
    render(<CvDocument cv="CV" profile={{ ...profile, photo: null }} template="accent" />);
    const banner = screen.getByTestId("accent-banner");
    expect(banner).not.toHaveStyle({ height: "130px" });
    expect(within(banner).queryByRole("img")).not.toBeInTheDocument();
  });

  it("behält mit Foto das volle Banner-Layout inklusive Foto bei", () => {
    const profileWithPhoto = { ...profile, photo: "data:image/png;base64,abc123" };
    render(<CvDocument cv="CV" profile={profileWithPhoto} template="accent" />);
    const banner = screen.getByTestId("accent-banner");
    expect(banner).toHaveStyle({ height: "130px" });
    const img = within(banner).getByRole("img");
    expect(img).toHaveAttribute("src", "data:image/png;base64,abc123");
  });
});

describe("CvDocument – andere Templates bleiben unverändert", () => {
  it("behält im modernen Template die generische blaue Skill-Bar-Farbe bei", () => {
    render(<CvDocument cv="CV" profile={profile} template="modern" />);
    const fills = screen.getAllByTestId("skill-bar-fill");
    expect(fills.length).toBeGreaterThan(0);
    fills.forEach((fill) => expect(fill).toHaveStyle({ backgroundColor: "#2F80ED" }));
  });
});

describe("CvDocument – Classic-Layout: strukturierte Daten", () => {
  const profileMulti: ProfileData = {
    ...profile,
    education: [
      { id: "1", institution: "HTW Berlin", degree: "B.Sc.", year: "2014" },
      { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
    ],
    experience: [
      { id: "1", company: "Firma A", position: "Junior Entwickler", period: "2018 - 2020", tasks: "Aufgabe A\nAufgabe A2" },
      { id: "2", company: "Firma B", position: "Senior Entwickler", period: "2020 - 2023", tasks: "Aufgabe B" },
    ],
  };

  it("zeigt Berufserfahrung strukturiert mit Zeitraum, Position und Firma", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    const entries = screen.getAllByTestId("classic-exp-entry");
    expect(entries.length).toBe(2);
    expect(entries[0]).toHaveTextContent("2018 - 2020");
    expect(entries[0]).toHaveTextContent("Junior Entwickler");
    expect(entries[0]).toHaveTextContent("Firma A");
    expect(entries[0]).toHaveTextContent("Aufgabe A");
  });

  it("zeigt Ausbildung strukturiert mit Jahr, Abschluss und Institution", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    const entries = screen.getAllByTestId("classic-edu-entry");
    expect(entries.length).toBe(2);
    expect(entries[0]).toHaveTextContent("2014");
    expect(entries[0]).toHaveTextContent("B.Sc.");
    expect(entries[0]).toHaveTextContent("HTW Berlin");
  });

  it("hält die Ausbildungs-Überschrift mit dem ersten Eintrag zusammen (kein Waisen-Header, #230)", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    const heading = screen.getByText("Ausbildung");
    // Überschrift und erster Eintrag liegen im selben (nicht umbrechenden)
    // Wrapper; nur der erste Eintrag ist mit der Überschrift gruppiert.
    const group = heading.parentElement as HTMLElement;
    const groupedEntries = within(group).getAllByTestId("classic-edu-entry");
    expect(groupedEntries).toHaveLength(1);
    expect(groupedEntries[0]).toHaveTextContent("2014");
  });

  it("hält die Berufserfahrungs-Überschrift mit dem ersten Eintrag zusammen (#230)", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    const heading = screen.getByText("Berufserfahrung");
    const group = heading.parentElement as HTMLElement;
    const groupedEntries = within(group).getAllByTestId("classic-exp-entry");
    expect(groupedEntries).toHaveLength(1);
  });

  it("zeigt Qualifikationen und Interessen als Skill-Balken", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    expect(screen.getByTestId("classic-cv-quals")).toBeInTheDocument();
    expect(screen.getByTestId("classic-cv-interests")).toBeInTheDocument();
    const fills = screen.getAllByTestId("skill-bar-fill");
    expect(fills.length).toBe(profileMulti.qualifications.length + profileMulti.interests.length);
  });

  it("kehrt bei cvStyle american Berufserfahrung und Ausbildung jeweils eigenständig antichronologisch um", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" cvStyle="american" />);
    const expEntries = screen.getAllByTestId("classic-exp-entry");
    const eduEntries = screen.getAllByTestId("classic-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma B");
    expect(eduEntries[0]).toHaveTextContent("2018");
  });

  it("behält bei cvStyle classic die chronologische Reihenfolge bei", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" cvStyle="classic" />);
    const expEntries = screen.getAllByTestId("classic-exp-entry");
    const eduEntries = screen.getAllByTestId("classic-edu-entry");
    expect(expEntries[0]).toHaveTextContent("Firma A");
    expect(eduEntries[0]).toHaveTextContent("2014");
  });

  it("bleibt eigenständig schlicht und klont nicht das moderne Spalten-Layout", () => {
    render(<CvDocument cv="CV" profile={profileMulti} template="classic" />);
    expect(screen.queryByTestId("modern-cv-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("modern-content")).not.toBeInTheDocument();
    expect(screen.queryByTestId("accent-banner")).not.toBeInTheDocument();
  });
});
