export interface ProjectCoFunderRequest {
  co_funder_id: string;
  amount: string;
}

export interface GrantedProjectRequest {
  grant_date: string;
  grant_amount: string;
}

export interface ProjectRequest {
  agreement_number: string;
  title: string;
  start_date: string;
  end_date: string;
  own_funds: string;
  organization_contribution: string;
  description: string;
  status: string;

  region_id: string;
  district_id: string;
  municipality_id: string;

  landscape_id: string;
  sub_landscape_id: string;

  support_partner_id: string;
  local_organization_id: string;
  strategic_plan_id: string;

  topic_ids: string[];

  co_funders: ProjectCoFunderRequest[];

  granted_project?: GrantedProjectRequest;
}

export interface ShortSupportPartner {
  id: string;
  name: string;
}

export interface GrantedProject {
  grant_date: string | null;
  grant_amount: string | null;
}

export interface Project {
  id: string;
  agreement_number: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  support_partner: ShortSupportPartner | null;
  granted_project: GrantedProject | null;
}

interface NamedRef {
  id: string;
  name: string;
}

export interface ProjectDetail {
  id: string;
  agreement_number: string;
  title: string;
  start_date: string;
  end_date: string;
  own_funds: string;
  organization_contribution: string | null;
  co_funders_contribution: string | null;
  description: string | null;
  status: string;
  region: NamedRef;
  district: NamedRef & { code: string };
  municipality: NamedRef;
  landscape: NamedRef;
  sub_landscape: NamedRef;
  support_partner: NamedRef;
  local_organization: NamedRef;
  strategic_plan: NamedRef & {
    code: string;
    start_date: string;
    end_date: string;
    description: string | null;
  };
  granted_project: {
    id: string;
    grant_date: string | null;
    grant_amount: string;
  } | null;
  topics: NamedRef[];
  project_co_funders: {
    id: string;
    co_funder_name: string;
    amount: string;
  }[];
  disbursement_schedules: {
    id: string;
    reference: string;
    disbursement_month: string;
    disbursement_amount: string;
    percentage: string;
    report_submission_date: string;
  }[];
}
