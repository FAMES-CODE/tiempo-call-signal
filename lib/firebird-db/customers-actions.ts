import { firebirdQuery } from "@/app/firebird-db";
import { customersSchema, CustomerT } from "./schemas/customersSchema";
import prisma from "@/app/db";

export async function getCustomers(): Promise<CustomerT[]> {
  const customers = await firebirdQuery("SELECT * FROM CLIENTS");
  if (!Array.isArray(customers)) {
    throw new Error("Expected an array of customers");
  }
  const parsed = customersSchema.array().safeParse(customers);
  if (!parsed.success) {
    console.error("Customer schema validation failed:", parsed.error.format());
    throw new Error(JSON.stringify(parsed.error.format()));
  }

  return parsed.data;
}

export async function getCustomerById(id: number): Promise<CustomerT | null> {
  const customers = await firebirdQuery("SELECT * FROM CLIENTS WHERE ID = ?", [
    id,
  ]);
  if (!Array.isArray(customers)) {
    throw new Error("Expected an array of customers");
  }
  const parsed = customersSchema.array().safeParse(customers);
  if (!parsed.success) {
    console.error("Customer schema validation failed:", parsed.error.format());
    throw new Error(JSON.stringify(parsed.error.format()));
  }

  return parsed.data[0] || null;
}
function mapCustomerToPayload(customer: CustomerT) {
  return {
    CLIENT: customer.client,
    CODE_CLIENT: customer.code_client,
    RECORDID: customer.recordid,
    ACTIVITE: customer.activite,
    CODE_POSTAL: customer.code_postal,
    ADRESSE: customer.adresse,
    COMMUNE: customer.commune,
    WILAYA: customer.wilaya,
    CONTACT: customer.contact,
    TEL: customer.tel,
    FAX: customer.fax,
    NUM_RC: customer.num_rc,
    NUM_IF: customer.num_if,
    NUM_IS: customer.num_is,
    NUM_ART: customer.num_art,
    NIN: customer.nin,
    COMPTE: customer.compte,
    RIB: customer.rib,
    EMAIL: customer.email,
    SITE_WEB: customer.site_web,
    SOLDE_INI: customer.solde_ini,
    ACHATS: customer.achats,
    VERSER: customer.verser,
    CREDIT_LIMIT: customer.credit_limit,
    NOTES: customer.notes,
    FAMILLE: customer.famille,
    SOUS_FAMILLE: customer.sous_famille,
    NBR_BON: customer.nbr_bon,
    SOLDE: customer.solde,
    MODE_TARIF: customer.mode_tarif,
    TYPE_FID: customer.type_fid,
    NUM_CF: customer.num_cf,
    ALLOW_CREDIT: customer.allow_credit,
    DATE_PASSAGE: customer.date_passage,
    VIS_ADMIN: customer.vis_admin,
    CODE_FRS: customer.code_frs,
    CODE_DEPOT: customer.code_depot,
    LATITUDE: customer.latitude,
    LONGITUDE: customer.longitude,
    CODE_VENDEUR: customer.code_vendeur,
    SUP: customer.sup,
    DATE_DER_MODIFICATION: customer.date_der_modification,
    UTILISATEUR: customer.utilisateur,
    NOM_ORD: customer.nom_ord,
    JRNL: customer.jrnl,
  } as const;
}

export async function syncCustomers(): Promise<void> {
  const customers = await getCustomers();

  for (const customer of customers) {
    const payload = mapCustomerToPayload(customer);

    await prisma.customer.upsert({
      where: { RECORDID: customer.recordid },
      update: payload,
      create: payload,
    });

  }

  console.log(`synced ${customers.length} customers`);
}