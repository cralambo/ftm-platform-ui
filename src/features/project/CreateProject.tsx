import { useMemo } from "react";
import { FieldArray, FormikProvider, getIn, useFormik } from "formik";
import * as Yup from "yup";

import {
  Alert,
  Box,
  Button,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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
import CommonCard from "@/components/CommonCard";

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

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          sx={{ mb: 3 }}
        >
          Retour aux projets
        </Button>

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
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      label="Date d'octroi"
                      name="granted_project.grant_date"
                      value={formik.values.granted_project?.grant_date ?? ""}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      slotProps={{ inputLabel: { shrink: true } }}
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
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      label="Date de début"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      {...formik.getFieldProps("start_date")}
                      error={!!fieldError("start_date")}
                      helperText={fieldError("start_date")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      label="Date de fin"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      {...formik.getFieldProps("end_date")}
                      error={!!fieldError("end_date")}
                      helperText={fieldError("end_date")}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl fullWidth>
                      <InputLabel>Statut</InputLabel>

                      <Select
                        label="Statut"
                        size="small"
                        value={formik.values.status}
                        onChange={(event) =>
                          formik.setFieldValue("status", event.target.value)
                        }
                      >
                        <MenuItem value="PENDING">En attente</MenuItem>

                        <MenuItem value="IN_PROGRESS">En cours</MenuItem>

                        <MenuItem value="APPROVED">Approuvé</MenuItem>

                        <MenuItem value="REJECTED">Rejeté</MenuItem>

                        <MenuItem value="RETURNED">Retourné</MenuItem>
                      </Select>

                      <FormHelperText>{fieldError("status")}</FormHelperText>
                    </FormControl>
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
                    <FormControl fullWidth error={!!fieldError("region_id")}>
                      <InputLabel>Région</InputLabel>

                      <Select
                        size="small"
                        label="Région"
                        value={formik.values.region_id}
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
                      </Select>

                      <FormHelperText>{fieldError("region_id")}</FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* DISTRICT */}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl
                      fullWidth
                      disabled={!formik.values.region_id || loadingDistricts}
                      error={!!fieldError("district_id")}
                    >
                      <InputLabel>District</InputLabel>

                      <Select
                        size="small"
                        label="District"
                        value={formik.values.district_id}
                        onChange={(event) => {
                          formik.setFieldValue(
                            "district_id",
                            event.target.value,
                          );

                          formik.setFieldValue("municipality_id", "");
                        }}
                      >
                        {filteredDistricts.map((district: any) => (
                          <MenuItem
                            key={getId(district)}
                            value={getId(district)}
                          >
                            {getName(district)}
                          </MenuItem>
                        ))}
                      </Select>

                      <FormHelperText>
                        {fieldError("district_id")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* MUNICIPALITY */}

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl
                      fullWidth
                      disabled={!formik.values.district_id}
                      error={!!fieldError("municipality_id")}
                    >
                      <InputLabel>Commune</InputLabel>

                      <Select
                        size="small"
                        label="Commune"
                        value={formik.values.municipality_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("municipality_id")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* LANDSCAPE */}

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth error={!!fieldError("landscape_id")}>
                      <InputLabel>Paysage</InputLabel>

                      <Select
                        size="small"
                        label="Paysage"
                        value={formik.values.landscape_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("landscape_id")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* SUB LANDSCAPE */}

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl
                      fullWidth
                      disabled={!formik.values.landscape_id}
                      error={!!fieldError("sub_landscape_id")}
                    >
                      <InputLabel>Sous-paysage</InputLabel>

                      <Select
                        size="small"
                        label="Sous-paysage"
                        value={formik.values.sub_landscape_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("sub_landscape_id")}
                      </FormHelperText>
                    </FormControl>
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
                    <FormControl
                      fullWidth
                      error={!!fieldError("support_partner_id")}
                    >
                      <InputLabel>Partenaire d'appui</InputLabel>

                      <Select
                        size="small"
                        label="Partenaire d'appui"
                        value={formik.values.support_partner_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("support_partner_id")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl
                      fullWidth
                      error={!!fieldError("local_organization_id")}
                    >
                      <InputLabel>Organisation locale</InputLabel>

                      <Select
                        size="small"
                        label="Organisation locale"
                        value={formik.values.local_organization_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("local_organization_id")}
                      </FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <FormControl
                      fullWidth
                      error={!!fieldError("strategic_plan_id")}
                    >
                      <InputLabel>Plan stratégique</InputLabel>

                      <Select
                        size="small"
                        label="Plan stratégique"
                        value={formik.values.strategic_plan_id}
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
                      </Select>

                      <FormHelperText>
                        {fieldError("strategic_plan_id")}
                      </FormHelperText>
                    </FormControl>
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
                  <InputLabel>Thématiques</InputLabel>

                  <Select
                    size="small"
                    multiple
                    value={formik.values.topic_ids}
                    onChange={(event) => {
                      const value = event.target.value;

                      formik.setFieldValue(
                        "topic_ids",
                        typeof value === "string" ? value.split(",") : value,
                      );
                    }}
                    input={<OutlinedInput label="Thématiques" />}
                    renderValue={(selected) =>
                      topics
                        .filter((topic) => selected.includes(topic.id))
                        .map((topic) => topic.name)
                        .join(", ")
                    }
                  >
                    {topics.map((topic) => (
                      <MenuItem
                        key={topic.id}
                        value={topic.id}
                        disabled={
                          formik.values.topic_ids.length >= MAX_TOPICS &&
                          !formik.values.topic_ids.includes(topic.id)
                        }
                      >
                        {getName(topic)}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText>
                    {typeof formik.errors.topic_ids === "string"
                      ? formik.errors.topic_ids
                      : `${formik.values.topic_ids.length}/${MAX_TOPICS} thématiques`}
                  </FormHelperText>
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
                              <FormControl
                                fullWidth
                                error={Boolean(
                                  nestedError(
                                    `co_funders.${index}.co_funder_id`,
                                  ),
                                )}
                              >
                                <InputLabel>Cofinanceur</InputLabel>
                                <Select
                                  size="small"
                                  label="Cofinanceur"
                                  name={`co_funders.${index}.co_funder_id`}
                                  value={coFunder.co_funder_id}
                                  onChange={formik.handleChange}
                                  onBlur={formik.handleBlur}
                                >
                                  {availableCoFunders(
                                    coFunder.co_funder_id,
                                  ).map((funder: any) => (
                                    <MenuItem
                                      key={getId(funder)}
                                      value={getId(funder)}
                                    >
                                      {getName(funder)}
                                    </MenuItem>
                                  ))}
                                </Select>
                                <FormHelperText>
                                  {nestedError(
                                    `co_funders.${index}.co_funder_id`,
                                  ) ?? " "}
                                </FormHelperText>
                              </FormControl>
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
                              <Button
                                color="error"
                                variant="outlined"
                                fullWidth
                                sx={{ height: 56 }}
                                aria-label="Retirer ce cofinanceur"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <DeleteIcon />
                              </Button>
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
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() =>
                            arrayHelpers.push({ co_funder_id: "", amount: "" })
                          }
                        >
                          Ajouter un cofinanceur
                        </Button>
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
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={isSubmitting}
                    onClick={() => navigate("/projects")}
                  >
                    Annuler
                  </Button>

                  <Button
                    size="small"
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
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
                  </Button>
                </Stack>
              </CardContent>
            </CommonCard>
          </Stack>
        </form>
      </Box>
    </FormikProvider>
  );
}
