// Duplicate rules: who lemlist considers "the same record" (PM: Edouard, artifact "Duplicate rules modal").
// One model, two UIs: Edouard's original modal (4 toggles) and the simplified one.

export type CompanyMatch = "domain" | "domain_name";

export interface Rules {
  /** Contacts with the same LinkedIn / Sales Navigator URL are merged, even with different emails. */
  contactLinkedin: boolean;
  /** Companies are the same when they share a domain, or a domain and a name. */
  companyMatch: CompanyMatch;
  /** Company names are cleaned (legal suffixes, copy errors) before matching. Only matters with domain_name. */
  cleanName: boolean;
  /** Companies with the same LinkedIn / Sales Navigator URL are merged. */
  companyLinkedin: boolean;
}

/** Edouard's defaults. Existing teams: today's behavior + clean name. New teams: LinkedIn duplicates allowed, domain only. */
export const DEFAULTS: Record<"existing" | "new", Rules> = {
  existing: { contactLinkedin: true, companyMatch: "domain_name", cleanName: true, companyLinkedin: true },
  new: { contactLinkedin: false, companyMatch: "domain", cleanName: false, companyLinkedin: false },
};

export type Version = "simplified" | "original";

/** The simplified UI has no "uncleaned name" state: the name is always cleaned when it counts. */
export function normalizeForSimplified(r: Rules): Rules {
  return r.companyMatch === "domain_name" ? { ...r, cleanName: true } : r;
}

// --- Plain sentences, used by the tab summary and the simplified modal's examples. ---

export function contactSummary(r: Rules): string {
  return r.contactLinkedin
    ? "Same email or same LinkedIn profile"
    : "Same email";
}

export function companySummary(r: Rules): string {
  const base = r.companyMatch === "domain" ? "Same domain" : "Same domain and name";
  return r.companyLinkedin ? `${base}, or same LinkedIn page` : base;
}

export function contactExample(r: Rules): string {
  return r.contactLinkedin
    ? "Theresa moves to a new company and keeps her LinkedIn profile: her contact is updated with her new email."
    : "Theresa moves to a new company and keeps her LinkedIn profile: she becomes a new contact, her old one stays as it was.";
}

export function companyExamples(r: Rules): string[] {
  const out: string[] = [];
  if (r.companyMatch === "domain") {
    out.push("Engie Belgium (engie.com) is added while Engie France (engie.com) exists: Engie France is updated.");
  } else {
    out.push("lemlist Ltd (lemlist.com) is added while lemlist (lemlist.com) exists: lemlist is updated.");
    out.push("lemlist North America (lemlist.com) is added: a new company is created.");
  }
  out.push(
    r.companyLinkedin
      ? "Acme Spain (acme.es) shares Acme France's LinkedIn page: Acme France is updated."
      : "Acme Spain (acme.es) shares Acme France's LinkedIn page: a new company is created.",
  );
  return out;
}

/** Keeps the modal open (and the proto panel usable) when the click lands in the floating proto panel. */
export function keepProtoPanel(e: Event) {
  if ((e.target as Element | null)?.closest?.("[data-proto-panel]")) e.preventDefault();
}
