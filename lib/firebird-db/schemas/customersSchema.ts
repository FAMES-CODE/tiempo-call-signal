import * as zod from "zod";

/** Chaîne Firebird : null/vide autorisés, tronquée si besoin. */
function fbString(maxLen?: number) {
  return zod.preprocess((val) => {
    if (val === null || val === undefined) return undefined;
    const s = String(val).trim();
    if (!s) return undefined;
    return maxLen ? s.slice(0, maxLen) : s;
  }, zod.string().optional());
}

/** Nombre Firebird (montants, soldes) : accepte décimaux et valeurs négatives. */
function fbFloat(defaultValue = 0) {
  return zod.preprocess((val) => {
    if (val === null || val === undefined || val === "") return defaultValue;
    const n = Number(val);
    return Number.isFinite(n) ? n : defaultValue;
  }, zod.number());
}

function fbOptionalFloat() {
  return zod.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  }, zod.number().optional());
}

function fbOptionalInt() {
  return zod.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const n = Number(val);
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  }, zod.number().int().optional());
}

function fbOptionalDate() {
  return zod.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const d = val instanceof Date ? val : new Date(val as string | number);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }, zod.date().optional());
}

export const customersSchema = zod.object({
  recordid: zod.coerce.number().int(),
  code_client: zod.preprocess((val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim().slice(0, 50);
  }, zod.string()),
  client: zod.preprocess((val) => {
    if (val === null || val === undefined) return "";
    return String(val).trim().slice(0, 100);
  }, zod.string()),
  activite: fbString(100),
  code_postal: fbString(20),
  adresse: fbString(100),
  commune: fbString(50),
  wilaya: fbString(25),
  contact: fbString(40),
  tel: fbString(50),
  fax: fbString(40),
  num_rc: fbString(20),
  num_if: fbString(20),
  num_is: fbString(20),
  num_art: fbString(20),
  nin: fbString(100),
  compte: fbString(40),
  rib: fbString(40),
  email: fbString(50),
  site_web: fbString(50),
  solde_ini: fbFloat(0),
  achats: fbFloat(0),
  verser: fbFloat(0),
  credit_limit: fbOptionalFloat(),
  notes: fbString(255),
  famille: fbString(50),
  sous_famille: fbString(50),
  nbr_bon: fbOptionalInt(),
  solde: fbFloat(0),
  mode_tarif: fbString(10),
  type_fid: fbString(10),
  num_cf: fbString(20),
  allow_credit: fbOptionalInt(),
  date_passage: fbOptionalDate(),
  vis_admin: fbOptionalInt(),
  code_frs: fbString(20),
  code_depot: fbString(10),
  latitude: fbOptionalFloat(),
  longitude: fbOptionalFloat(),
  code_vendeur: fbString(20),
  sup: fbOptionalInt(),
  date_der_modification: fbOptionalDate(),
  utilisateur: fbString(50),
  nom_ord: fbString(50),
  jrnl: fbOptionalInt(),
});

export type CustomerT = zod.infer<typeof customersSchema>;

export function parseCustomerRow(
  raw: Record<string, unknown>,
  index: number,
): { ok: true; data: CustomerT } | { ok: false; index: number; recordid: unknown; error: string } {
  const withDefaults = {
    ...raw,
    code_client:
      raw.code_client != null && String(raw.code_client).trim()
        ? raw.code_client
        : raw.recordid != null
          ? `C${raw.recordid}`
          : `ROW${index}`,
    client:
      raw.client != null && String(raw.client).trim()
        ? raw.client
        : raw.recordid != null
          ? `Client ${raw.recordid}`
          : `Client ${index}`,
  };

  const parsed = customersSchema.safeParse(withDefaults);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }

  return {
    ok: false,
    index,
    recordid: raw.recordid,
    error: JSON.stringify(parsed.error.flatten().fieldErrors),
  };
}
