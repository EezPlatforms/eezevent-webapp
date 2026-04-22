import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { helpSections } from "../data/content";

export default function HelpPage() {
  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: { xs: 3, md: 4.5 },
          border: "1px solid rgba(120,147,255,0.22)",
          background:
            "linear-gradient(145deg, rgba(15,26,109,0.9) 0%, rgba(7,11,42,0.96) 100%)",
        }}
      >
        <Stack spacing={2}>
          <Chip
            icon={<HelpOutlineRoundedIcon />}
            label="Help Guide"
            color="primary"
            sx={{ alignSelf: "flex-start" }}
          />
          <Typography variant="h2" sx={{ fontSize: { xs: "2.3rem", md: "3.4rem" } }}>
            Documentation for the EezEvent app.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 900 }}>
            This guide is based on the current mobile app flows for clients, planners, and
            vendors. It covers the live sections already present in the app and the actions users
            can take in each one.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              color="secondary"
              startIcon={<ArrowBackRoundedIcon />}
            >
              Back to home
            </Button>
            <Button
              component="a"
              href="mailto:support@eezevent.com?subject=EezEvent%20help%20request"
              variant="contained"
            >
              Contact support
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(120,147,255,0.18)",
          backgroundColor: "rgba(8, 13, 56, 0.88)",
        }}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="overline" color="primary.light">
              Help Center
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 1.5 }}>
              EezEvent app guide
            </Typography>
            <Typography color="text.secondary">
              Jump directly to the workflow you need. The guide includes both the original
              requested topics and the additional sections already present in the mobile app.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {helpSections.map((section) => (
                <Chip
                  key={section.id}
                  clickable
                  onClick={() => scrollToSection(section.id)}
                  label={section.title.replace(/^\d+\.\s/, "")}
                  sx={{
                    justifyContent: "flex-start",
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {helpSections.map((section) => (
          <Grid key={section.id} id={section.id} size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                border: "1px solid rgba(120,147,255,0.16)",
                backgroundColor: "rgba(15,26,109,0.72)",
                scrollMarginTop: 110,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">{section.title}</Typography>
                <Typography color="text.secondary">{section.intro}</Typography>
                {section.bullets ? (
                  <Box component="ul" sx={{ m: 0, pl: 2.5, color: "text.secondary" }}>
                    {section.bullets.map((item) => (
                      <Box key={item} component="li" sx={{ mb: 1 }}>
                        {item}
                      </Box>
                    ))}
                  </Box>
                ) : null}
                {section.ordered ? (
                  <Box component="ol" sx={{ m: 0, pl: 2.5, color: "text.secondary" }}>
                    {section.ordered.map((item) => (
                      <Box key={item} component="li" sx={{ mb: 1 }}>
                        {item}
                      </Box>
                    ))}
                  </Box>
                ) : null}
                {section.outro ? <Typography color="text.secondary">{section.outro}</Typography> : null}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: 3,
          border: "1px solid rgba(120,147,255,0.18)",
          backgroundColor: "rgba(7,11,42,0.85)",
        }}
      >
        <Stack spacing={2}>
          <Divider />
          <Typography color="text.secondary">
            Need help with a workflow that is not documented here? Contact{" "}
            <Link href="mailto:support@eezevent.com">support@eezevent.com</Link>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            © 2026 EezPlatforms LLC. EezEvent is a product of EezPlatforms LLC. All rights
            reserved.
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}
