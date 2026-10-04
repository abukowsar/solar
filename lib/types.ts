export interface SetupRequest {
  id: string;
  ref: string;
  name: string;
  phone: string;
  district: string;
  upazila: string;
  address: string;
  utility: string;
  category: string;
  roof: number;
  roofType: string;
  units: number;
  load: number;
  goals: string[];
  when: string;
  source: string;
  geo: string;
  notes: string;
  kw: number;
  stage: number;
  interests: string[];
  created: string;
  /** true when contact details were hidden for the current viewer */
  masked?: boolean;
}

export interface Provider {
  id: string;
  ref: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  home: string;
  kind: string;
  expKw: number;
  docs: string[];
  types: string[];
  services: string[];
  serve: string[];
  enlistment: string;
  solset: string;
  created: string;
}

export type PublicProvider = Omit<Provider, "phone" | "email" | "contact">;

export interface SavedDesign {
  id: string;
  ref: string;
  created: string;
  contact: { name: string; phone: string; district: string; geo: string };
  input: import("./design").DesignInput;
  summary: { kwp: number; panels: number; panelW: number; inverterKw: number; batteryKwh: number; capex: number; lcoe: number; gen: number; exp: number };
  solset: { mode: "solset" | "local" | "error"; id?: string; url?: string; error?: string };
}

export interface Subscriber {
  id: string;
  channel: "email" | "sms";
  contact: string;
  role: "owner" | "provider" | "other";
  district: string;
  created: string;
}

export interface AuditEntry {
  at: string;
  action: string;
  target: string;
}
