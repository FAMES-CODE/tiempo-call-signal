import { firebirdQuery } from "@/app/firebird-db";
import {
  customersSchema,
  CustomerT,
  parseCustomerRow,
} from "./schemas/customersSchema";
import prisma from "@/app/db";

const MAX_VALIDATION_ERRORS_LOGGED = 10;

function parseCustomerRows(
  rows: Record<string, unknown>[],
): { valid: CustomerT[]; skipped: number; sampleErrors: string[] } {
  const valid: CustomerT[] = [];
  const sampleErrors: string[] = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const result = parseCustomerRow(rows[i], i);
    if (result.ok) {
      valid.push(result.data);
    } else {
      skipped++;
      if (sampleErrors.length < MAX_VALIDATION_ERRORS_LOGGED) {
        sampleErrors.push(
          `index=${result.index} recordid=${result.recordid}: ${result.error}`,
        );
      }
    }
  }

  return { valid, skipped, sampleErrors };
}

export async function getCustomersFromFirebird(): Promise<CustomerT[]> {
  const customers = await firebirdQuery("SELECT * FROM CLIENTS");
  if (!Array.isArray(customers)) {
    throw new Error("Expected an array of customers");
  }

  const { valid, skipped, sampleErrors } = parseCustomerRows(
    customers as Record<string, unknown>[],
  );

  if (skipped > 0) {
    console.warn(
      `[syncCustomers] ${skipped} client(s) ignoré(s) (données invalides). Exemples :`,
      sampleErrors,
    );
  }

  if (valid.length === 0 && customers.length > 0) {
    throw new Error(
      `Aucun client valide sur ${customers.length} ligne(s). Exemples : ${sampleErrors.join("; ")}`,
    );
  }

  return valid;
}

export async function getCustomerById(id: number): Promise<CustomerT | null> {
  const customers = await firebirdQuery("SELECT * FROM CLIENTS WHERE ID = ?", [
    id,
  ]);
  if (!Array.isArray(customers) || customers.length === 0) {
    return null;
  }

  const parsed = customersSchema.safeParse(customers[0]);
  if (!parsed.success) {
    const fallback = parseCustomerRow(
      customers[0] as Record<string, unknown>,
      0,
    );
    if (fallback.ok) return fallback.data;
    console.error("Customer schema validation failed:", parsed.error.flatten());
    throw new Error(
      `Client invalide (ID ${id}): ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
    );
  }

  return parsed.data;
}

function mapCustomerToPayload(customer: CustomerT) {
  return {
    CLIENT: customer.client,
    CODE_CLIENT: customer.code_client,
    RECORDID: customer.recordid,
    ACTIVITE: customer.activite ?? null,
    CODE_POSTAL: customer.code_postal ?? null,
    ADRESSE: customer.adresse ?? null,
    COMMUNE: customer.commune ?? null,
    WILAYA: customer.wilaya ?? null,
    CONTACT: customer.contact ?? null,
    TEL: customer.tel ?? null,
    FAX: customer.fax ?? null,
    NUM_RC: customer.num_rc ?? null,
    NUM_IF: customer.num_if ?? null,
    NUM_IS: customer.num_is ?? null,
    NUM_ART: customer.num_art ?? null,
    NIN: customer.nin ?? null,
    COMPTE: customer.compte ?? null,
    RIB: customer.rib ?? null,
    EMAIL: customer.email ?? null,
    SITE_WEB: customer.site_web ?? null,
    SOLDE_INI: customer.solde_ini,
    ACHATS: customer.achats,
    VERSER: customer.verser,
    CREDIT_LIMIT: customer.credit_limit ?? null,
    NOTES: customer.notes ?? null,
    FAMILLE: customer.famille ?? null,
    SOUS_FAMILLE: customer.sous_famille ?? null,
    NBR_BON: customer.nbr_bon ?? null,
    SOLDE: customer.solde,
    MODE_TARIF: customer.mode_tarif ?? null,
    TYPE_FID: customer.type_fid ?? null,
    NUM_CF: customer.num_cf ?? null,
    ALLOW_CREDIT: customer.allow_credit ?? null,
    DATE_PASSAGE: customer.date_passage ?? null,
    VIS_ADMIN: customer.vis_admin ?? null,
    CODE_FRS: customer.code_frs ?? null,
    CODE_DEPOT: customer.code_depot ?? null,
    LATITUDE: customer.latitude ?? null,
    LONGITUDE: customer.longitude ?? null,
    CODE_VENDEUR: customer.code_vendeur ?? null,
    SUP: customer.sup ?? null,
    DATE_DER_MODIFICATION: customer.date_der_modification ?? null,
    UTILISATEUR: customer.utilisateur ?? null,
    NOM_ORD: customer.nom_ord ?? null,
    JRNL: customer.jrnl ?? null,
  } as const;
}

export async function syncCustomers(): Promise<number> {
  const customers = await getCustomersFromFirebird();

  for (const customer of customers) {
    const payload = mapCustomerToPayload(customer);

    await prisma.customer.upsert({
      where: { RECORDID: customer.recordid },
      update: payload,
      create: payload,
    });
  }

  return customers.length;
}
