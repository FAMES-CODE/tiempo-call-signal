import { firebirdQuery } from "@/app/firebird-db";

type CreatedBon1 = {
  recordid: number;
  num_bon: string;
};

function formatHeure(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function isDuplicateNumBonError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /already exist|duplicate|unique|violation/i.test(msg);
}

async function nextAppNumBon(): Promise<string> {
  const gen = await firebirdQuery<{ id: number }>(
    "SELECT id FROM sp_gen_bon11_id",
  );
  const id = gen[0]?.id;
  if (!id || typeof id !== "number") {
    throw new Error("Unable to generate NUM_BON (sp_gen_bon11_id)");
  }
  return `APP_${String(id).slice(0, 10)}`;
}

async function allocateAppNumBon(maxAttempts = 25): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const numBon = await nextAppNumBon();
    const exists = await firebirdQuery<{ num_bon: string }>(
      "SELECT num_bon FROM bon1 WHERE num_bon = ?",
      [numBon],
    );
    if (exists.length === 0) return numBon;
  }
  throw new Error("Unable to allocate a unique NUM_BON for call sheet sync");
}

export async function createBon1(numBon: string): Promise<CreatedBon1> {
  const now = new Date();

  const existing = await firebirdQuery<{ num_bon: string }>(
    "SELECT num_bon FROM bon1 WHERE num_bon = ?",
    [numBon],
  );
  if (existing.length > 0) {
    const err = new Error(`BON1 ${numBon} already exists`);
    (err as Error & { code?: string }).code = "BON_ALREADY_EXISTS";
    throw err;
  }

  await firebirdQuery(
    "INSERT INTO bon1 (num_bon, date_bon, heure) VALUES (?, ?, ?)",
    [numBon, now, formatHeure(now)],
  );

  const rows = await firebirdQuery<CreatedBon1>(
    "SELECT recordid, num_bon FROM bon1 WHERE num_bon = ?",
    [numBon],
  );
  if (!rows[0]) throw new Error("Insert BON1: not found after insertion");
  return rows[0];
}

type CreateBon1ForCallSheetInput = {
  callSheetId: number;
  codeClient: string;
  utilisateur?: string | null;
  observation?: string | null;
};

type ExistingBonLookup = { recordid: number; num_bon: string };

/** Short REF_BON (Firebird often truncates CHAR columns — "CALLSHEET:12" collides). */
function callSheetRefBon(callSheetId: number): string {
  return `CS${callSheetId}`;
}

function callSheetMarker(callSheetId: number): string {
  return `(CallSheet #${callSheetId})`;
}

/** NUM_BON must be stored with APP_ prefix in Firebird. */
export function ensureAppNumBon(numBon: string): string {
  const trimmed = numBon.trim();
  if (!trimmed) return trimmed;
  if (trimmed.toUpperCase().startsWith("APP_")) return trimmed;
  return `APP_${trimmed}`;
}

type Bon1Row = { recordid: number; num_bon: string; autre_info?: string | null };

async function findExistingBon1ForCallSheet(
  callSheetId: number,
): Promise<ExistingBonLookup | null> {
  const refBon = callSheetRefBon(callSheetId);
  const byRef = await firebirdQuery<Bon1Row>(
    "SELECT recordid, num_bon, autre_info FROM bon1 WHERE ref_bon = ?",
    [refBon],
  );
  if (byRef[0]) {
    return {
      recordid: byRef[0].recordid,
      num_bon: ensureAppNumBon(byRef[0].num_bon),
    };
  }

  // Legacy rows: old "CALLSHEET:n" may have been truncated to the same REF_BON for every sheet.
  const marker = callSheetMarker(callSheetId);
  const byInfo = await firebirdQuery<Bon1Row>(
    "SELECT recordid, num_bon, autre_info FROM bon1 WHERE autre_info CONTAINING ?",
    [marker],
  );
  const match = byInfo.find((row) => row.autre_info?.includes(marker));
  if (match) {
    return {
      recordid: match.recordid,
      num_bon: ensureAppNumBon(match.num_bon),
    };
  }
  return null;
}

export async function createBon1ForCallSheet(
  input: CreateBon1ForCallSheetInput,
): Promise<CreatedBon1 & { alreadyExisted: boolean }> {
  const now = new Date();
  const refBon = callSheetRefBon(input.callSheetId);

  const existing = await findExistingBon1ForCallSheet(input.callSheetId);
  if (existing) {
    return { ...existing, alreadyExisted: true };
  }

  // Keep REF_BON for idempotence, and also put the business observation in AUTRE_INFO.
  const who = input.utilisateur?.trim() ? input.utilisateur.trim() : "unknown";
  const iso = now.toISOString();
  const baseTrace = `Created by ${who} from the tiempo-maintenance application, on ${iso} ${callSheetMarker(input.callSheetId)}`;
  const autreInfo = input.observation?.trim()
    ? `${baseTrace} - ${input.observation.trim()}`
    : baseTrace;

  const insertParams = [
    now,
    formatHeure(now),
    input.codeClient,
    refBon,
    autreInfo,
    "M",
    2,
    input.utilisateur ?? null,
    "A TERME",
    0.00000000000000,
    0.00000000000000,
  ] as const;

  let numBon = "";
  for (let attempt = 0; attempt < 25; attempt++) {
    numBon = await allocateAppNumBon();
    try {
      await firebirdQuery(
        "INSERT INTO bon1 (num_bon, date_bon, heure, code_client, ref_bon, autre_info, blocage, jrnl, utilisateur, mode_rg, REMISE, TOT_REMISE) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        [numBon, ...insertParams],
      );
      break;
    } catch (error) {
      if (!isDuplicateNumBonError(error) || attempt === 24) throw error;
    }
  }

  const rows = await firebirdQuery<CreatedBon1>(
    "SELECT recordid, num_bon FROM bon1 WHERE ref_bon = ?",
    [refBon],
  );
  if (!rows[0]) {
    throw new Error("Insert BON1 (call sheet): not found after insertion");
  }

  return {
    recordid: rows[0].recordid,
    num_bon: ensureAppNumBon(rows[0].num_bon),
    alreadyExisted: false,
  };
}

export type Bon2LineInput = {
  produit: string;
  qte?: number | null;
  PV_HT_AR?: number | null;
};

export async function insertBon2Line(
  numBon: string,
  line: Bon2LineInput,
): Promise<{ recordid: number }> {
  const produit = line.produit?.trim();
  if (!produit) throw new Error("BON2 line: product is required");

  const rec = await firebirdQuery<{ id: number }>(
    "SELECT gen_id(gen_bon2_id, 1) as id FROM rdb$database",
  );
  const recordid = rec[0]?.id;
  if (!recordid || typeof recordid !== "number") {
    throw new Error("Unable to generate RECORDID BON2");
  }

  const numBonWithPrefix = ensureAppNumBon(numBon);

  await firebirdQuery(
    "INSERT INTO bon2 (recordid, num_bon, produit, qte, PV_HT_AR, PV_HT) VALUES (?, ?, ?, ?, ?, ?)",
    [
      recordid,
      numBonWithPrefix,
      produit,
      line.qte ?? null,
      line.PV_HT_AR ?? null,
      line.PV_HT_AR ?? null,
    ]
  );

  return { recordid };
}

