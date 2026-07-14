export type Requirement = { code:string; label:string; source:"statutory"|"findvillas_policy"; expires:boolean; description:string };

const req = (code:string,label:string,source:Requirement["source"],description:string,expires=false):Requirement => ({code,label,source,description,expires});

export function applicationRequirements(input:{applicantType:"individual"|"legal_entity";relationship:"owner_operator"|"manager_agent";vatRegistered:boolean;hasForeignInvolvement:boolean}) {
  const rows=[req("IDENTITY","Identity document","statutory","Watermarked Thai ID or passport for the applicant/signatory.",true)];
  if(input.applicantType==="legal_entity") rows.push(
    req("DBD_CERTIFICATE","Current DBD certificate","statutory","DBD certificate issued within the previous three months.",true),
    req("AUTHORIZED_SIGNATORY_ID","Authorized signatory identity","statutory","Watermarked ID/passport for an authorized signatory.",true),
    req("SHAREHOLDER_LIST","Current shareholder list","statutory","Current certified shareholder evidence for ownership review.",true),
  );
  if(input.relationship==="manager_agent")rows.push(req("MANAGEMENT_AUTHORITY","Management authority","statutory","Signed management agreement or power of attorney establishing authority and scope.",true));
  if(input.vatRegistered)rows.push(req("VAT_CERTIFICATE","VAT certificate (P.P.20)","statutory","Current VAT registration for the applicant/entity."));
  if(input.hasForeignInvolvement)rows.push(req("FOREIGN_BUSINESS_AUTHORITY","Foreign business authority","statutory","Applicable Foreign Business Act licence, certificate, or BOI authority.",true));
  return rows;
}

export function complianceRequirements(legalPath:"hotel_license"|"non_hotel_notification") {
  const rows=[
    req("PROPERTY_RIGHT","Property ownership or right to use","statutory","Title, lease, or owner consent authorizing accommodation use.",true),
    req("FLOOR_PLAN","Building and floor plans","statutory","Plans showing every building, floor, room, and declared capacity."),
    req("PROPERTY_PHOTOS","Current property photographs","statutory","Current exterior, room, safety-equipment, and shared-area photographs."),
    req("FIRE_SAFETY","Fire-safety evidence","statutory","Installation/certification evidence and current photographs.",true),
    req("LIABILITY_INSURANCE","Guest liability insurance","findvillas_policy","Current policy covering paying guests at this property.",true),
  ];
  if(legalPath==="hotel_license") rows.push(
    req("HOTEL_LICENSE","Hotel business licence","statutory","Current licence showing holder, licensed name, address, number, and type.",true),
    req("BUILDING_HOTEL_USE","Building authorization for hotel use","statutory","Authorization under applicable building-control requirements.",true),
  ); else rows.push(
    req("NON_HOTEL_NOTIFICATION","Non-hotel notification acknowledgment","statutory","Current DOPA acknowledgment for no more than 8 rooms and 30 guests.",true),
    req("MAIN_INCOME_EVIDENCE","Main-income evidence","statutory","Evidence that accommodation is supplementary income under the notification path."),
  );
  return rows;
}
