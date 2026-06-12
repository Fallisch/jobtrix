import { render, screen } from "@testing-library/react";
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

  it("enthält den Lebenslauf-Text", () => {
    render(<CvDocument cv="Mein detaillierter Lebenslauf" profile={profile} />);
    expect(screen.getByText("Mein detaillierter Lebenslauf")).toBeInTheDocument();
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

  it("rendert Profildaten im linken Hauptbereich", () => {
    render(<CvDocument cv="Mein moderner Lebenslauf" profile={profile} template="modern" />);
    const content = screen.getByTestId("modern-content");
    expect(content).toHaveTextContent("Persönliche Daten");
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
