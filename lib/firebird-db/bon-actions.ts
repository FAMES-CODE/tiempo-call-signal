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

export async function createBon1ForCallSheet(
  input: CreateBon1ForCallSheetInput,
): Promise<CreatedBon1 & { alreadyExisted: boolean }> {
  const now = new Date();
  const refBon = `CALLSHEET:${input.callSheetId}`;

  const existing = await firebirdQuery<ExistingBonLookup>(
    "SELECT recordid, num_bon FROM bon1 WHERE ref_bon = ?",
    [refBon],
  );
  if (existing[0]) {
    return { ...existing[0], alreadyExisted: true };
  }

  const gen = await firebirdQuery<{ id: number }>(
    "SELECT id FROM sp_gen_bon11_id",
  );
  const id = gen[0]?.id;
  if (!id || typeof id !== "number") {
    throw new Error("Unable to generate NUM_BON (sp_gen_bon11_id)");
  }
  const numBon = String(id).slice(0, 10);

  // Keep REF_BON for idempotence, and also put the business observation in AUTRE_INFO.
  const who = input.utilisateur?.trim() ? input.utilisateur.trim() : "unknown";
  const iso = now.toISOString();
  const baseTrace = `Created by ${who} from the tiempo-call-signal application, on ${iso} (CallSheet #${input.callSheetId})`;
  const autreInfo = input.observation?.trim()
    ? `${baseTrace} - ${input.observation.trim()}`
    : baseTrace;

  await firebirdQuery(
    "INSERT INTO bon1 (num_bon, date_bon, heure, code_client, ref_bon, autre_info, blocage, jrnl, utilisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      numBon,
      now,
      formatHeure(now),
      input.codeClient,
      refBon,
      autreInfo,
      "F",
      2,
      input.utilisateur ?? null,
    ],
  );

  const rows = await firebirdQuery<CreatedBon1>(
    "SELECT recordid, num_bon FROM bon1 WHERE ref_bon = ?",
    [refBon],
  );
  if (!rows[0]) {
    throw new Error("Insert BON1 (call sheet): not found after insertion");
  }

  return { ...rows[0], alreadyExisted: false };
}

export type Bon2LineInput = {
  produit: string;
  qte?: number | null;
  pv_ht?: number | null;
  tva?: number | null;
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

  await firebirdQuery(
    "INSERT INTO bon2 (recordid, num_bon, produit, qte, pv_ht, tva) VALUES (?, ?, ?, ?, ?, ?)",
    [
      recordid,
      numBon,
      produit,
      line.qte ?? null,
      line.pv_ht ?? null,
      line.tva ?? null,
    ],
  );

  return { recordid };
}

