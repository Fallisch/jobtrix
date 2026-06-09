import { render, screen } from "@testing-library/react";
import React from "react";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { ProfileData } from "@/lib/profile-storage";

const profile: ProfileData = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  qualifications: ["Python", "SQL"],
  interests: ["Datenanalyse"],
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
