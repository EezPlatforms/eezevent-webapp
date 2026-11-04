"use client";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { audiences, benefits, heroStats, launchCards } from "../data/content";
import { useAuth } from "../lib/auth";

const benefitIcons = [HubRoundedIcon, InsightsRoundedIcon, VerifiedRoundedIcon];
const audienceIcons = [PeopleAltOutlinedIcon, SupportAgentOutlinedIcon, StorefrontOutlinedIcon];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          overflow: "hidden",
          border: "1px solid rgba(120,147,255,0.22)",
          background:
            "linear-gradient(145deg, rgba(20,31,163,0.92) 0%, rgba(15,26,109,0.94) 48%, rgba(7,11,42,0.98) 100%)",
          boxShadow: "0 24px 60px rgba(2, 6, 23, 0.45)",
        }}
      >
        <Box
          sx={{
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 5 },
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 15% 18%, rgba(120,147,255,0.22), transparent 24%), radial-gradient(circle at 85% 12%, rgba(255,255,255,0.08), transparent 18%)",
              pointerEvents: "none",
            },
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={2.5}>
                <Typography variant="h1" sx={{ fontSize: { xs: "2.8rem", md: "4.1rem" } }}>
                  Event planning with modern speed and classic discipline.
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 760 }}>
                  EezEvent brings clients, planners, and vendors into one organized workspace to
                  handle outreach, inquiries, quotes, and decisions with clarity.
                </Typography>
                {!isAuthenticated ? (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                      component="a"
                      href="mailto:support@eezevent.com?subject=Get%20started%20with%20EezEvent"
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                    >
                      Get started
                    </Button>
                    <Button
                      component="a"
                      href="mailto:support@eezevent.com?subject=Talk%20to%20the%20EezEvent%20team"
                      variant="outlined"
                      color="secondary"
                    >
                      Talk to the team
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Paper
                sx={{
                  p: 3,
                  height: "100%",
                  border: "1px solid rgba(120,147,255,0.18)",
                  backgroundColor: "rgba(21,28,99,0.62)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="h5" sx={{ mb: 0.5 }}>
                    Operating priorities
                  </Typography>
                  {heroStats.map((item, index) => (
                    <Paper
                      key={item.title}
                      sx={{
                        p: 2.25,
                        borderRadius: 1.5,
                        border: "1px solid rgba(120,147,255,0.16)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            background:
                              "linear-gradient(180deg, rgba(46,53,232,0.9), rgba(37,45,184,0.9))",
                            color: "common.white",
                            fontWeight: 800,
                            fontSize: "0.92rem",
                            boxShadow: "0 10px 18px rgba(46,53,232,0.22)",
                          }}
                        >
                          0{index + 1}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ mb: 0.45, lineHeight: 1.2 }}>
                            {item.title}
                          </Typography>
                          <Typography color="text.secondary" sx={{ lineHeight: 1.5 }}>
                            {item.body}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {launchCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                height: "100%",
                overflow: "hidden",
                border: "1px solid rgba(120,147,255,0.18)",
                backgroundColor: "rgba(15,26,109,0.7)",
              }}
            >
              <Box
                component="img"
                src={card.image}
                alt={card.alt}
                sx={{ width: "100%", height: 220, objectFit: "cover" }}
              />
              <Stack spacing={1.25} sx={{ p: 3 }}>
                <Typography variant="h5">{card.title}</Typography>
                <Typography color="text.secondary">{card.body}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(120,147,255,0.18)",
          backgroundColor: "rgba(8, 13, 56, 0.9)",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="overline" color="primary.light">
              Built For
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              One system for the people actually running the event.
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 420 }}>
              Each workspace is tuned for a different role, but the operating model stays aligned
              across everyone involved in the event.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              {audiences.map((audience, index) => {
                const Icon = audienceIcons[index];

                return (
                  <Grid key={audience.title} size={{ xs: 12, sm: 4 }}>
                    <Paper
                      sx={{
                        p: 2.25,
                        height: "100%",
                        border: "1px solid rgba(120,147,255,0.16)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 1,
                            backgroundColor: "rgba(46,53,232,0.18)",
                            color: "primary.light",
                          }}
                        >
                          <Icon fontSize="small" />
                        </Box>
                        <Typography variant="h6">{audience.title}</Typography>
                        <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                          {audience.body}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Why teams choose EezEvent
        </Typography>
        <Grid container spacing={3}>
          {benefits.map((item, index) => {
            const Icon = benefitIcons[index];
            return (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  sx={{
                    p: 3,
                    height: "100%",
                    border: "1px solid rgba(120,147,255,0.18)",
                    backgroundColor: "rgba(15,26,109,0.74)",
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 1.5,
                        backgroundColor: "rgba(46,53,232,0.22)",
                        color: "#AEB8FF",
                        border: "1px solid rgba(154,168,255,0.18)",
                      }}
                    >
                      <Icon sx={{ color: "inherit", fontSize: 28 }} />
                    </Box>
                    <Typography variant="h5">{item.title}</Typography>
                    <Typography color="text.secondary">{item.body}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(120,147,255,0.22)",
          background:
            "linear-gradient(135deg, rgba(20,31,163,0.82), rgba(7,11,42,0.95) 70%, rgba(255,255,255,0.06))",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h3">A modern platform, built for long-term operations.</Typography>
            <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 720 }}>
              Request early access and we will reach out when your region opens.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction={{ xs: "column", sm: "row", md: "column" }} spacing={1.25}>
              <Button
                component="a"
                href="mailto:support@eezevent.com?subject=Early%20access%20request"
                variant="contained"
                endIcon={<EastRoundedIcon />}
              >
                Request access
              </Button>
              <Button component="a" href="mailto:support@eezevent.com" variant="outlined" color="secondary">
                Contact support
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="space-between"
        sx={{ px: 0.5, pt: 1, color: "text.secondary" }}
      >
        <Typography variant="body2">support@eezevent.com</Typography>
        <Typography variant="body2">
          © 2026 EezPlatforms LLC. EezEvent is a product of EezPlatforms LLC.
        </Typography>
      </Stack>
    </Stack>
  );
}
