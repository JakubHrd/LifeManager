import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const menuImg = require("../assets/menu.svg").default;
const financeImg = require("../assets/finance.svg").default;
const trainingPlanImg = require("../assets/trainingPlan.svg").default;
const habitTrackerImg = require("../assets/habitTracker.svg").default;
const landingImage = require("../assets/landing.svg").default;

// Data pro sekce
const features = [
  { 
    title: "Jídelníček", 
    description: "Plánuj své jídlo a sleduj kalorický příjem.",
    image: menuImg, 
    direction: "left" 
  },
  { 
    title: "Tréninkový plán", 
    description: "Vytvářej a sleduj svůj fitness progres.", 
    image: trainingPlanImg,
    direction: "right" 
  },
  { 
    title: "Habit Tracker", 
    description: "Buduj zdravé návyky a sleduj jejich plnění.", 
    image: habitTrackerImg,
    direction: "left" 
  },
  { 
    title: "Správa financí", 
    description: "Měj přehled o svých příjmech a výdajích.", 
    image: financeImg,
    direction: "right" 
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Úvodní sekce */}
      <Container maxWidth="lg">
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems="center"
          justifyContent="space-between"
          height="100vh"
          textAlign="center"
        >
          {/* Levá část - text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              LifeManager
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph>
              Tvůj osobní organizátor financí, jídelníčku a tréninkového plánu.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              onClick={() => navigate("/dashboard")}
            >
              Přejít na můj účet
            </Button>
          </motion.div>

          {/* Pravá část - obrázek */}
          <motion.img
            src={landingImage}
            alt="LifeManager"
            style={{ width: "100%", maxWidth: "500px" }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </Box>
      </Container>

      {/* Sekce s funkcemi aplikace */}
      <Box>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: feature.direction === "left" ? -800 : 800 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            style={{
              display: "flex",
              justifyContent: feature.direction === "left" ? "flex-start" : "flex-end",
              width: "100%",
            }}
          >
            <Container maxWidth={false}>
              <Box
                display="flex"
                flexDirection={feature.direction === "left" ? "row" : "row-reverse"}
                alignItems="center"
                justifyContent="space-between"
                my={5}
                sx={{
                  backgroundColor: "#f9f9f9",
                  p: 5,
                  borderRadius: "10px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
                  width: "60%",
                  marginLeft: feature.direction === "right" ? "auto" : "0",
                  marginRight: feature.direction === "left" ? "auto" : "0",
                }}
              >
                {/* Obrázek */}
                <Box flex={1} textAlign="center" style={{height:"250px" }}>
                  <img
                    src={feature.image}
                    alt={feature.title}
                    style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }}
                  />
                </Box>

                {/* Popis */}
                <Box flex={1} textAlign="center">
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            </Container>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
};

export default LandingPage;
