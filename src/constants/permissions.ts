export const PERMISSIONS = {
  BOARD_MEMBERS: {
    CREATE: "board_members.create",
    VIEW: "board_members.view",
    UPDATE: "board_members.update",
    DELETE: "board_members.delete",
  },

  CO_FUNDERS: {
    CREATE: "co_funders.create",
    VIEW: "co_funders.view",
    UPDATE: "co_funders.update",
    DELETE: "co_funders.delete",
  },

  DEPARTMENTS: {
    CREATE: "departments.create",
    VIEW: "departments.view",
    UPDATE: "departments.update",
    DELETE: "departments.delete",
  },

  DISBURSEMENTS: {
    ACTIVITIES: {
      VIEW: "disbursements.activities.view",
      CREATE: "disbursements.activities.create",
      UPDATE: "disbursements.activities.update",
      DELETE: "disbursements.activities.delete",
    },
    SCHEDULES: {
      CREATE: "disbursements.schedules.create",
      VIEW: "disbursements.schedules.view",
    },
  },

  DISTRICTS: {
    CREATE: "districts.create",
    VIEW: "districts.view",
    UPDATE: "districts.update",
    DELETE: "districts.delete",
  },

  EMPLOYEES: {
    CREATE: "employees.create",
    VIEW: "employees.view",
    UPDATE: "employees.update",
    DELETE: "employees.delete",
  },

  LANDSCAPES: {
    CREATE: "landscapes.create",
    VIEW: "landscapes.view",
    UPDATE: "landscapes.update",
    DELETE: "landscapes.delete",
  },

  MUNICIPALITIES: {
    CREATE: "municipalities.create",
    VIEW: "municipalities.view",
    UPDATE: "municipalities.update",
    DELETE: "municipalities.delete",
  },

  ORGANIZATIONS: {
    CREATE: "organizations.create",
    VIEW: "organizations.view",
    UPDATE: "organizations.update",
    DELETE: "organizations.delete",
  },

  PARTNERS: {
    CREATE: "partners.create",
    VIEW: "partners.view",
    UPDATE: "partners.update",
    DELETE: "partners.delete",
  },

  PARTNER_CONTACTS: {
    CREATE: "partner_contacts.create",
    VIEW: "partner_contacts.view",
    UPDATE: "partner_contacts.update",
    DELETE: "partner_contacts.delete",
  },

  PERMISSIONS: {
    VIEW: "permissions.view",
    CREATE: "permissions.create",
    UPDATE: "permissions.update",
    DELETE: "permissions.delete",
  },

  POSITIONS: {
    CREATE: "positions.create",
    VIEW: "positions.view",
    UPDATE: "positions.update",
    DELETE: "positions.delete",
  },

  PROJECTS: {
    CREATE: "projects.create",
    VIEW: "projects.view",
  },

  REGIONS: {
    CREATE: "regions.create",
    VIEW: "regions.view",
    UPDATE: "regions.update",
    DELETE: "regions.delete",
  },

  FINANCIAL_REPORTS: {
    VIEW: "financials.reports.view",
    CREATE: "financials.reports.create",
    UPDATE: "financials.reports.update",
    DELETE: "financials.reports.delete",
  },

  REPORTS: {
    CREATE: "reports.create",
    VIEW: "reports.view",
    UPDATE: "reports.update",
    DELETE: "reports.delete",
    SUBMIT: "reports.submit",

    ATTACHMENTS: {
      GENERAL_UPLOAD: "reports.attachments.general.upload",
      TECHNICAL_UPLOAD: "reports.attachments.technical.upload",
      FINANCIAL_UPLOAD: "reports.attachments.financial.upload",
      GENERAL_VIEW: "reports.attachments.general.view",
      FINANCIAL_VIEW: "reports.attachments.financial.view",
      TECHNICAL_VIEW: "reports.attachments.technical.view",
      DOWNLOAD: "reports.attachments.download",
    },
  },

  TECHNICAL_REPORTS: {
    VIEW: "technicals.reports.view",
    DELETE: "technicals.reports.delete",
  },

  ROLES: {
    VIEW: "roles.view",
    CREATE: "roles.create",
    UPDATE: "roles.update",
    DELETE: "roles.delete",
    PERMISSIONS_ADD: "roles.permissions.add",
    PERMISSIONS_REMOVE: "roles.permissions.remove",
    PERMISSIONS_VIEW: "roles.permissions.view",
  },

  STRATEGIC_PLANS: {
    CREATE: "strategic_plans.create",
    VIEW: "strategic_plans.view",
    UPDATE: "strategic_plans.update",
    DELETE: "strategic_plans.delete",
  },

  SUB_LANDSCAPES: {
    CREATE: "sub_landscapes.create",
    VIEW: "sub_landscapes.view",
    UPDATE: "sub_landscapes.update",
    DELETE: "sub_landscapes.delete",
  },

  TOPICS: {
    CREATE: "topics.create",
    VIEW: "topics.view",
    UPDATE: "topics.update",
    DELETE: "topics.delete",
  },

  USERS: {
    VIEW: "users.view",
    CREATE: "users.create",
    UPDATE: "users.update",
    DELETE: "users.delete",
    ACTIVE: "users.active",
    ROLES_ADD: "users.roles.add",
    ROLES_REMOVE: "users.roles.remove",
    ROLES_VIEW: "users.roles.view",
  },
} as const;
