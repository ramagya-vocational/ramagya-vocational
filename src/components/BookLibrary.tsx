import { BookOpen, ExternalLink } from "lucide-react";
import textbook from "@/assets/kaushal-vikas-grade-9.pdf.asset.json";
import { Button } from "@/components/ui/button";

export const BOOK_UNITS = [
  {
    number: "01",
    title: "Work with Life Forms",
    range: "Pages 1–68",
    chapters: [
      ["01", "Introduction to Agricultural Practices", "05"],
      ["02", "Rooftop Gardening", "21"],
      ["03", "Precision Farming", "39"],
      ["04", "Additional Vocations", "61"],
    ],
  },
  {
    number: "02",
    title: "Work with Machines and Materials",
    range: "Pages 69–140",
    chapters: [
      ["05", "Shaping Materials", "73"],
      ["06", "Construction", "91"],
      ["07", "Apparel", "113"],
      ["08", "Additional Vocations", "133"],
    ],
  },
  {
    number: "03",
    title: "Work in Human Services",
    range: "Pages 141–end",
    chapters: [
      ["09", "Personal and Lifestyle Services", "145"],
      ["10", "Healthcare", "163"],
      ["11", "Tourism", "185"],
      ["12", "Additional Vocations", "207"],
    ],
  },
] as const;

export function BookLibrary({ compact = false }: { compact?: boolean }) {
  return (
    <section className="book-library" aria-labelledby="book-library-title">
      <div className="book-library-head">
        <div>
          <p className="tech-label">Official Class IX textbook</p>
          <h2 id="book-library-title">Kaushal Vikas</h2>
          <p>Skill Education · Grade 9 · 12 chapters across three vocational worlds</p>
        </div>
        <Button asChild className="button-amber">
          <a href={textbook.url} target="_blank" rel="noopener noreferrer">
            <BookOpen className="h-4 w-4" /> Open textbook
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </Button>
      </div>

      <div className={`unit-grid${compact ? " unit-grid-compact" : ""}`}>
        {BOOK_UNITS.map((unit) => (
          <article className="unit-panel" key={unit.number}>
            <header>
              <span>UNIT {unit.number}</span>
              <small>{unit.range}</small>
              <h3>{unit.title}</h3>
            </header>
            <ol>
              {unit.chapters.map(([number, title, page]) => (
                <li key={number}>
                  <span className="chapter-number">{number}</span>
                  <span>{title}</span>
                  <span className="chapter-page">P.{page}</span>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}