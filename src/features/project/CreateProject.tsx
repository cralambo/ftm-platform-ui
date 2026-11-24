import { useMemo } from "react";
import { FieldArray, FormikProvider, getIn, useFormik } from "formik";
import * as Yup from "yup";

import {
  Alert,
  Box,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { useNotify } from "@/hooks/useNotify";
import { getErrorMessage } from "@/utils/errors";

import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "./projectApi";

import type { Project, ProjectRequest } from "./project.types";

// =========================================================
// APIs EXISTANTES
// =========================================================

import { useGetRegionsQuery } from "@/features/region/regionApi";
import { useGetMunicipalitiesQuery } from "@/features/municipality/municipalityApi";
import { useGetLandscapesQuery } from "@/features/landscape/landscapeApi";
import { useGetSubLandscapesQuery } from "@/features/subLandscape/subLandscapeApi";
import { useGetAllSupportPartnersQuery } from "@/features/partner/supportPartnerApi";
import { useGetAllLocalOrganizationsQuery } from "@/features/organization/localOrganizationApi";
import { useGetAllStrategicPlansQuery } from "@/features/strategicPlan/strategicPlanApi";
import { useGetAllTopicsQuery } from "@/features/topic/topicApi";
import { useGetAllCoFundersQuery } from "@/features/coFunder/coFunderApi";

import FundingSummary from "@/features/project/FundingSummary";
import { computeBudget, formatCents, toCents } from "@/features/project/budget";
import { useGetDistrictsByRegionQuery } from "../district/districtApi";
import CommonCard from "@/components/common/CommonCard";
import CommonGreyButton from "@/components/common/CommonGreyButton";
import CommonBlueButton from "@/components/common/CommonBlueButton";
import { tokens } from "@/theme";
import CommonDatePicker from "@/components/common/CommonDatePicker";
import dayjs from "dayjs";

// =========================================================
// VALIDATION
// =========================================================

const schema = Yup.object({
  agreement_number: Yup.string()
    .trim()
    .required("Numéro de convention obligatoire")
    .max(150, "150 caractères maximum"),

  title: Yup.string()
    .trim()
    .required("Titre obligatoire")
    .max(255, "255 caractères maximum"),

  start_date: Yup.string().required("Date de début obligatoire"),

  end_date: Yup.string()
    .required("Date de fin obligatoire")
    .test(
      "end-after-start",
      "La date de fin doit être après la date de début",
      function (value) {
        const { start_date } = this.parent;

        if (!value || !start_date) {
          return true;
        }

        return value >= start_date;
      },
    ),

  own_funds: Yup.string()
    .required("Fonds propres obligatoires")
    .test(
      "number",
      "Montant invalide",
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Number.isNaN(Number(value)),
    ),

  organization_contribution: Yup.string()
    .required("Contribution obligatoire")
    .test(
      "number",
      "Montant invalide",
      (value) =>
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !Number.isNaN(Number(value)),
    ),

  status: Yup.string().required("Statut obligatoire"),

  region_id: Yup.string().required("Région obligatoire"),

  district_id: Yup.string().required("District obligatoire"),

  municipality_id: Yup.string().required("Commune obligatoire"),

  landscape_id: Yup.string().required("Paysage obligatoire"),

  sub_landscape_id: Yup.string().required("Sous-paysage obligatoire"),

  support_partner_id: Yup.string().required("Partenaire d'appui obligatoire"),

  local_organization_id: Yup.string().required(
    "Organisation locale obligatoire",
  ),

  strategic_plan_id: Yup.string().required("Plan stratégique obligatoire"),

  topic_ids: Yup.array()
    .of(Yup.string().required())
    .max(4, "4 thématiques maximum"),

  co_funders: Yup.array()
    .of(
      Yup.object({
        co_funder_id: Yup.string().required("Cofinanceur obligatoire"),
        amount: Yup.string()
          .required("Montant obligatoire")
          .test(
            "positive",
            "Le montant doit être supérieur à 0",
            (v) => toCents(v) > 0,
          ),
      }),
    )
    .test(
      "unique-co-funders",
      "Un cofinanceur ne peut apparaître qu'une seule fois",
      (list) => {
        const ids = (list ?? []).map((c) => c.co_funder_id).filter(Boolean);
        return new Set(ids).size === ids.length;
      },
    ),

  granted_project: Yup.object({
    grant_date: Yup.string().test(
      "grant-date-required",
      "Date d'octroi obligatoire",
      function (value) {
        const { grant_amount } = this.parent as { grant_amount?: string };
        return !grant_amount || Boolean(value);
      },
    ),
    grant_amount: Yup.string().test(
      "number",
      "Montant invalide",
      (v) => !v || (!Number.isNaN(Number(v)) && Number(v) > 0),
    ),
  }),
})
  // Règle du financement : fonds propres + cofinanceurs <= montant d'octroi
  .test("funding-rule", "", function (raw) {
    const values = raw as unknown as ProjectRequest;
    const path = "granted_project.grant_amount";
    const b = computeBudget({
      own_funds: values.own_funds ?? "",
      grant_amount: values.granted_project?.grant_amount ?? "",
      co_funders: values.co_funders ?? [],
    });

    if (b.granted === 0) {
      return b.coFunders > 0
        ? this.createError({
            path,
            message:
              "Renseignez le montant d'octroi pour déclarer des cofinanceurs",
          })
        : true;
    }
    if (b.balance < 0) {
      return this.createError({
        path,
        message: `Fonds propres + cofinanceurs dépassent l'octroi de ${formatCents(-b.balance)}`,
      });
    }
    return true;
  });

// =========================================================
// INITIAL VALUES
// =========================================================

const emptyValues: ProjectRequest = {
  agreement_number: "",
  title: "",
  start_date: "",
  end_date: "",
  own_funds: "",
  organization_contribution: "",
  description: "",
  status: "PENDING",

  region_id: "",
  district_id: "",
  municipality_id: "",

  landscape_id: "",
  sub_landscape_id: "",

  support_partner_id: "",
  local_organization_id: "",
  strategic_plan_id: "",

  topic_ids: [],

  co_funders: [],

  granted_project: {
    grant_date: "",
    grant_amount: "",
  },
};

// =========================================================
// HELPERS
// =========================================================

const getId = (item: any) => item?.id ?? "";

const getName = (item: any) =>
  item?.name ?? item?.label ?? item?.title ?? item?.code ?? "";

const MAX_TOPICS = 4;

// N'envoie l'octroi que s'il est renseigné (le service parse ses valeurs sans contrôle)
const buildPayload = (values: ProjectRequest): ProjectRequest => ({
  ...values,
  organization_contribution: values.organization_contribution || "0",
  granted_project: values.granted_project?.grant_amount
    ? values.granted_project
    : undefined,
});

export default function CreateProject() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const location = useLocation();

  const notify = useNotify();

  /*
   * Si tu passes un projet pour modification :
   *
   * navigate("/projects/create", {
   *   state: { project }
   * })
   */

  const editingProject =
    (
      location.state as {
        project?: Project;
      } | null
    )?.project ?? null;

  // =======================================================
  // API
  // =======================================================

  const [createProject, { isLoading: creating }] = useCreateProjectMutation();

  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();

  const isSubmitting = creating || updating;

  // =======================================================
  // LISTES
  // =======================================================

  const { data: regionsData } = useGetRegionsQuery({
    page: 0,
    size: 1000,
  });
  const { data: municipalitiesData } = useGetMunicipalitiesQuery({
    page: 0,
    size: 1000,
  });

  const { data: landscapesData } = useGetLandscapesQuery({
    page: 0,
    size: 1000,
  });

  const { data: subLandscapesData } = useGetSubLandscapesQuery({
    page: 0,
    size: 1000,
  });

  const { data: supportPartners = [] } = useGetAllSupportPartnersQuery();

  const { data: localOrganizations = [] } = useGetAllLocalOrganizationsQuery();

  const { data: strategicPlans = [] } = useGetAllStrategicPlansQuery();

  console.log("Strategic plans :", strategicPlans);

  const { data: topics = [] } = useGetAllTopicsQuery();

  console.log("topics :", topics);

  const { data: coFunders = [] } = useGetAllCoFundersQuery();

  const regions = regionsData?.content ?? [];
  const municipalities = municipalitiesData?.content ?? [];
  const landscapes = landscapesData?.content ?? [];
  const subLandscapes = subLandscapesData?.content ?? [];

  // =======================================================
  // FORM INITIAL VALUES
  // =======================================================

  const initialValues = useMemo<ProjectRequest>(() => {
    if (!editingProject) {
      return emptyValues;
    }

    return {
      ...emptyValues,

      agreement_number: editingProject.agreement_number ?? "",

      title: editingProject.title ?? "",

      start_date: editingProject.start_date ?? "",

      end_date: editingProject.end_date ?? "",

      status: editingProject.status ?? "PENDING",

      support_partner_id: editingProject.support_partner?.id ?? "",

      granted_project: {
        grant_date: editingProject.granted_project?.grant_date ?? "",

        grant_amount: editingProject.granted_project?.grant_amount ?? "",
      },
    };
  }, [editingProject]);

  // =======================================================
  // FORMIK
  // =======================================================

  const formik = useFormik<ProjectRequest>({
    enableReinitialize: true,

    initialValues,

    validationSchema: schema,

    onSubmit: async (values) => {
      const payload = buildPayload(values);
      try {
        if (editingProject) {
          await updateProject({ id: editingProject.id, ...payload }).unwrap();
          notify("Projet modifié avec succès");
        } else {
          await createProject(payload).unwrap();
          notify("Projet créé avec succès");
        }
        navigate("/projects");
      } catch (error) {
        notify(getErrorMessage(error), "error");
      }
    },
  });

  // =======================================================
  // FILTRES LOCALISATION
  // =======================================================

  // Districts de la région choisie (GET /districts/region/{id})
  const { data: districtsByRegion = [], isFetching: loadingDistricts } =
    useGetDistrictsByRegionQuery(formik.values.region_id, {
      skip: !formik.values.region_id,
    });
  const filteredDistricts = formik.values.region_id ? districtsByRegion : [];

  // Parent d'un élément, qu'il soit imbriqué (district: {id}) ou à plat (district_id / districtId)
  const parentIdOf = (item: any, parent: string): string | undefined =>
    item?.[parent]?.id ?? item?.[`${parent}_id`] ?? item?.[`${parent}Id`];

  const filteredMunicipalities = municipalities.filter(
    (m: any) => parentIdOf(m, "district") === formik.values.district_id,
  );

  const filteredSubLandscapes = subLandscapes.filter(
    (s: any) => parentIdOf(s, "landscape") === formik.values.landscape_id,
  );

  // Erreur d'un champ imbriqué (co_funders.0.amount, granted_project.grant_amount…)
  const nestedError = (path: string): string | undefined => {
    const error = getIn(formik.errors, path);
    return getIn(formik.touched, path) && typeof error === "string"
      ? error
      : undefined;
  };

  // Cofinanceurs encore disponibles (évite les doublons entre lignes)
  const availableCoFunders = (current: string) =>
    coFunders.filter(
      (f: any) =>
        getId(f) === current ||
        !formik.values.co_funders.some((row) => row.co_funder_id === getId(f)),
    );

  // =======================================================
  // ERRORS
  // =======================================================

  const fieldError = (field: keyof ProjectRequest) => {
    const touched = formik.touched[field];
    const error = formik.errors[field];

    if (!touched) {
      return undefined;
    }

    return typeof error === "string" ? error : undefined;
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <FormikProvider value={formik}>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title={editingProject ? "Modifier le projet" : "Créer un projet"}
          addLabel=""
          onAdd={() => undefined}
        />
        <Box sx={{ mb: 3 }}>
          <CommonGreyButton
            variant="outlined"
            onClick={() => navigate("/projects")}
            startIcon={<ArrowBackIcon />}
            size="small"
          >
            Retour aux projets
          </CommonGreyButton>
        </Box>
        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={3}>
            {formik.submitCount > 0 && !formik.isValid && (
              <Alert severity="warning">
                Certains champs sont à corriger avant d'enregistrer le projet.
              </Alert>
            )}

            {/* =================================================
              GRANTED PROJECT
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6">Projet accordé</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Informations concernant l'octroi du financement.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <CommonDatePicker
                      label="Date d'octroi"
                      name="granted_project.grant_date"
                      value={formik.values.granted_project?.grant_date}
                      onChange={(value) =>
                        formik.setFieldValue(
                          "granted_project.grant_date",
                          value,
                        )
                      }
                      onBlur={() =>
                        formik.setFieldTouched(
                          "granted_project.grant_date",
                          true,
                        )
                      }
                      error={Boolean(nestedError("granted_project.grant_date"))}
                      helperText={
                        nestedError("granted_project.grant_date") ?? " "
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Montant d'octroi"
                      name="granted_project.grant_amount"
                      value={formik.values.granted_project?.grant_amount ?? ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                      error={Boolean(
                        nestedError("granted_project.grant_amount"),
                      )}
                      helperText={
                        nestedError("granted_project.grant_amount") ?? " "
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </CommonCard>

            {/* =================================================
              INFORMATIONS GÉNÉRALES
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 0.5 }}>
                  Informations générales
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Informations principales du projet.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Numéro de convention"
                      {...formik.getFieldProps("agreement_number")}
                      error={!!fieldError("agreement_number")}
                      helperText={fieldError("agreement_number")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      label="Titre du projet"
                      {...formik.getFieldProps("title")}
                      error={!!fieldError("title")}
                      helperText={fieldError("title")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      minRows={4}
                      label="Description"
                      {...formik.getFieldProps("description")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <CommonDatePicker
                      label="Date de début"
                      name="start_date"
                      value={formik.values.start_date}
                      onChange={(value) =>
                        formik.setFieldValue("start_date", value)
                      }
                      onBlur={() => formik.setFieldTouched("start_date", true)}
                      error={Boolean(nestedError("start_date"))}
                      helperText={nestedError("start_date") ?? " "}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <CommonDatePicker
                      label="Date de fin"
                      value={formik.values.end_date}
                      onChange={(value) =>
                        formik.setFieldValue("end_date", value)
                      }
                      minDate={
                        formik.values.start_date
                          ? dayjs(formik.values.start_date)
                          : undefined
                      }
                      error={Boolean(fieldError("end_date"))}
                      helperText={fieldError("end_date") ?? " "}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Statut"
                      value={formik.values.status}
                      error={!!fieldError("status")}
                      helperText={fieldError("status")}
                      onChange={(event) =>
                        formik.setFieldValue("status", event.target.value)
                      }
                    >
                      <MenuItem value="PENDING">En attente</MenuItem>
                      <MenuItem value="IN_PROGRESS">En cours</MenuItem>
                      <MenuItem value="APPROVED">Approuvé</MenuItem>
                      <MenuItem value="REJECTED">Rejeté</MenuItem>
                      <MenuItem value="RETURNED">Retourné</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </CommonCard>

            {/* =================================================
              FINANCEMENT
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6">Financement</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Montants financiers du projet.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Fonds propres"
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          step: "0.01",
                        },
                      }}
                      {...formik.getFieldProps("own_funds")}
                      error={!!fieldError("own_funds")}
                      helperText={fieldError("own_funds")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      label="Contribution de l'organisation"
                      slotProps={{
                        htmlInput: {
                          min: 0,
                          step: "0.01",
                        },
                      }}
                      {...formik.getFieldProps("organization_contribution")}
                      error={!!fieldError("organization_contribution")}
                      helperText={fieldError("organization_contribution")}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </CommonCard>

            {/* =================================================
              LOCALISATION
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6">Localisation</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Région, district, commune et paysage concernés par le projet.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  {/* REGION */}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Région"
                      value={formik.values.region_id}
                      error={!!fieldError("region_id")}
                      helperText={fieldError("region_id")}
                      onChange={(event) => {
                        formik.setFieldValue("region_id", event.target.value);
                        formik.setFieldValue("district_id", "");
                        formik.setFieldValue("municipality_id", "");
                      }}
                    >
                      {regions.map((region: any) => (
                        <MenuItem key={getId(region)} value={getId(region)}>
                          {getName(region)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* DISTRICT */}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="District"
                      disabled={!formik.values.region_id || loadingDistricts}
                      value={formik.values.district_id}
                      error={!!fieldError("district_id")}
                      helperText={fieldError("district_id")}
                      onChange={(event) => {
                        formik.setFieldValue("district_id", event.target.value);
                        formik.setFieldValue("municipality_id", "");
                      }}
                    >
                      {filteredDistricts.map((district: any) => (
                        <MenuItem key={getId(district)} value={getId(district)}>
                          {getName(district)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* MUNICIPALITY */}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Commune"
                      disabled={!formik.values.district_id}
                      value={formik.values.municipality_id}
                      error={!!fieldError("municipality_id")}
                      helperText={fieldError("municipality_id")}
                      onChange={(event) =>
                        formik.setFieldValue(
                          "municipality_id",
                          event.target.value,
                        )
                      }
                    >
                      {filteredMunicipalities.map((municipality: any) => (
                        <MenuItem
                          key={getId(municipality)}
                          value={getId(municipality)}
                        >
                          {getName(municipality)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* LANDSCAPE */}

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Paysage"
                      value={formik.values.landscape_id}
                      error={!!fieldError("landscape_id")}
                      helperText={fieldError("landscape_id")}
                      onChange={(event) => {
                        formik.setFieldValue(
                          "landscape_id",
                          event.target.value,
                        );
                        formik.setFieldValue("sub_landscape_id", "");
                      }}
                    >
                      {landscapes.map((landscape: any) => (
                        <MenuItem
                          key={getId(landscape)}
                          value={getId(landscape)}
                        >
                          {getName(landscape)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* SUB LANDSCAPE */}

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Sous-paysage"
                      disabled={!formik.values.landscape_id}
                      value={formik.values.sub_landscape_id}
                      error={!!fieldError("sub_landscape_id")}
                      helperText={fieldError("sub_landscape_id")}
                      onChange={(event) =>
                        formik.setFieldValue(
                          "sub_landscape_id",
                          event.target.value,
                        )
                      }
                    >
                      {filteredSubLandscapes.map((subLandscape: any) => (
                        <MenuItem
                          key={getId(subLandscape)}
                          value={getId(subLandscape)}
                        >
                          {getName(subLandscape)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </CommonCard>

            {/* =================================================
              PARTENAIRES
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6">
                  Partenaires et plan stratégique
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Relations institutionnelles du projet.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Partenaire d'appui"
                      value={formik.values.support_partner_id}
                      error={!!fieldError("support_partner_id")}
                      helperText={fieldError("support_partner_id")}
                      onChange={(event) =>
                        formik.setFieldValue(
                          "support_partner_id",
                          event.target.value,
                        )
                      }
                    >
                      {supportPartners.map((partner: any) => (
                        <MenuItem key={getId(partner)} value={getId(partner)}>
                          {getName(partner)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Organisation locale"
                      value={formik.values.local_organization_id}
                      error={!!fieldError("local_organization_id")}
                      helperText={fieldError("local_organization_id")}
                      onChange={(event) =>
                        formik.setFieldValue(
                          "local_organization_id",
                          event.target.value,
                        )
                      }
                    >
                      {localOrganizations.map((organization: any) => (
                        <MenuItem
                          key={getId(organization)}
                          value={getId(organization)}
                        >
                          {getName(organization)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Plan stratégique"
                      value={formik.values.strategic_plan_id}
                      error={!!fieldError("strategic_plan_id")}
                      helperText={fieldError("strategic_plan_id")}
                      onChange={(event) =>
                        formik.setFieldValue(
                          "strategic_plan_id",
                          event.target.value,
                        )
                      }
                    >
                      {strategicPlans.map((plan: any) => (
                        <MenuItem key={getId(plan)} value={getId(plan)}>
                          {getName(plan)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </CommonCard>

            {/* =================================================
              TOPICS
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Typography variant="h6">Thématiques</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Sélectionnez les thématiques associées au projet.
                </Typography>

                <Divider sx={{ mb: 3 }} />

                <FormControl
                  fullWidth
                  error={Boolean(
                    formik.touched.topic_ids && formik.errors.topic_ids,
                  )}
                >
                  <FormLabel
                    sx={{
                      mb: 1.5,
                      fontWeight: 600,
                      color: "text.primary",
                      "&.Mui-focused": {
                        color: "primary.main",
                      },
                    }}
                  >
                    Thématiques
                  </FormLabel>

                  <Paper
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      bgcolor: "transparent",
                      backgroundImage: "none",
                      boxShadow: "none",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 1,
                      }}
                    >
                      {topics.map((topic) => {
                        const checked = formik.values.topic_ids.includes(
                          topic.id,
                        );

                        const disabled =
                          formik.values.topic_ids.length >= MAX_TOPICS &&
                          !checked;

                        return (
                          <Box
                            key={topic.id}
                            onClick={() => {
                              if (disabled) return;

                              const newValues = checked
                                ? formik.values.topic_ids.filter(
                                    (id: string) => id !== topic.id,
                                  )
                                : [...formik.values.topic_ids, topic.id];

                              formik.setFieldValue("topic_ids", newValues);
                            }}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              borderRadius: 1,
                              px: 1,
                              cursor: disabled ? "not-allowed" : "pointer",
                              opacity: disabled ? 0.5 : 1,
                              bgcolor: "transparent",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={checked}
                              disabled={disabled}
                              onChange={() => {
                                const newValues = checked
                                  ? formik.values.topic_ids.filter(
                                      (id: string) => id !== topic.id,
                                    )
                                  : [...formik.values.topic_ids, topic.id];

                                formik.setFieldValue("topic_ids", newValues);
                              }}
                              onClick={(event) => event.stopPropagation()}
                              sx={{
                                color: colors.grey[400],
                                "&.Mui-checked": {
                                  color: colors.bluePrimary[600],
                                },
                                "&.MuiCheckbox-indeterminate": {
                                  color: colors.bluePrimary[600],
                                },
                              }}
                            />

                            <Typography variant="body2">
                              {getName(topic)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Paper>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                    }}
                  >
                    <FormHelperText
                      error={Boolean(
                        formik.touched.topic_ids && formik.errors.topic_ids,
                      )}
                    >
                      {formik.touched.topic_ids &&
                      typeof formik.errors.topic_ids === "string"
                        ? formik.errors.topic_ids
                        : "Sélectionnez les thématiques concernées."}
                    </FormHelperText>

                    <Typography
                      variant="caption"
                      color={
                        formik.values.topic_ids.length >= MAX_TOPICS
                          ? "warning.main"
                          : "text.secondary"
                      }
                      sx={{ fontWeight: 600 }}
                    >
                      {formik.values.topic_ids.length}/{MAX_TOPICS}
                    </Typography>
                  </Box>
                </FormControl>
              </CardContent>
            </CommonCard>

            {/* =================================================
              CO-FUNDERS
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                  sx={{
                    mb: 3,
                    justifyContent: "space-between",
                    alignItems: {
                      xs: "flex-start",
                      sm: "center",
                    },
                  }}
                >
                  <Box>
                    <Typography variant="h6">Cofinanceurs</Typography>

                    <Typography variant="body2" color="text.secondary">
                      Ajoutez les cofinanceurs et leurs montants.
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <FieldArray
                  name="co_funders"
                  render={(arrayHelpers) => (
                    <Stack spacing={2}>
                      {formik.values.co_funders.map((coFunder, index) => (
                        <CommonCard key={index}>
                          <Grid
                            container
                            spacing={2}
                            sx={{ alignItems: "flex-start" }}
                          >
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                select
                                fullWidth
                                size="small"
                                label="Cofinanceur"
                                name={`co_funders.${index}.co_funder_id`}
                                value={coFunder.co_funder_id}
                                error={Boolean(
                                  nestedError(
                                    `co_funders.${index}.co_funder_id`,
                                  ),
                                )}
                                helperText={
                                  nestedError(
                                    `co_funders.${index}.co_funder_id`,
                                  ) ?? " "
                                }
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                              >
                                {availableCoFunders(coFunder.co_funder_id).map(
                                  (funder: any) => (
                                    <MenuItem
                                      key={getId(funder)}
                                      value={getId(funder)}
                                    >
                                      {getName(funder)}
                                    </MenuItem>
                                  ),
                                )}
                              </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, md: 5 }}>
                              <TextField
                                size="small"
                                fullWidth
                                type="number"
                                label="Montant"
                                name={`co_funders.${index}.amount`}
                                value={coFunder.amount}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                slotProps={{
                                  htmlInput: { min: 0, step: "0.01" },
                                }}
                                error={Boolean(
                                  nestedError(`co_funders.${index}.amount`),
                                )}
                                helperText={
                                  nestedError(`co_funders.${index}.amount`) ??
                                  " "
                                }
                              />
                            </Grid>

                            <Grid size={{ xs: 12, md: 1 }}>
                              <IconButton
                                color="error"
                                size="small"
                                aria-label="Retirer ce cofinanceur"
                                onClick={() => arrayHelpers.remove(index)}
                                sx={{
                                  mt: { xs: 0, md: 0.5 },
                                }}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CommonCard>
                      ))}

                      {typeof formik.errors.co_funders === "string" && (
                        <FormHelperText error>
                          {formik.errors.co_funders}
                        </FormHelperText>
                      )}

                      <Box>
                        <CommonBlueButton
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            arrayHelpers.push({ co_funder_id: "", amount: "" })
                          }
                        >
                          Ajouter un cofinanceur
                        </CommonBlueButton>
                      </Box>
                    </Stack>
                  )}
                />
              </CardContent>
            </CommonCard>

            <FundingSummary values={formik.values} />

            {/* =================================================
              ACTIONS
          ================================================= */}

            <CommonCard>
              <CardContent>
                <Stack
                  direction={{
                    xs: "column-reverse",
                    sm: "row",
                  }}
                  sx={{ justifyContent: "flex-end" }}
                  spacing={2}
                >
                  <CommonGreyButton
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={() => navigate("/projects")}
                    size="small"
                  >
                    Retour aux projets
                  </CommonGreyButton>
                  <CommonBlueButton
                    size="small"
                    type="submit"
                    variant="outlined"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <AddIcon />
                      )
                    }
                  >
                    {editingProject
                      ? "Enregistrer les modifications"
                      : "Créer le projet"}
                  </CommonBlueButton>
                </Stack>
              </CardContent>
            </CommonCard>
          </Stack>
        </form>
      </Box>
    </FormikProvider>
  );
}
