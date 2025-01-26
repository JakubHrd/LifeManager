import React from "react";
import { Box, Container, Typography, Grid, Paper } from "@mui/material";

const Dashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box my={5}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Tvůj Dashboard
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Přehled tvých aktivit a možností správy.
        </Typography>
      </Box>

      {/* Grid s přehledem funkcí */}
      <Grid container spacing={4}>
        {[
          { title: "Jídelníček", description: "Správa jídel a kalorického příjmu." },
          { title: "Tréninkový plán", description: "Tvorba a sledování tréninků." },
          { title: "Habit Tracker", description: "Sledování a správa návyků." },
          { title: "Finance", description: "Přehled příjmů a výdajů." },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center", borderRadius: 2 }}>
              <Typography variant="h5" fontWeight="bold">
                {item.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard;
