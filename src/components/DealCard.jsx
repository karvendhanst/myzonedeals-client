import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const DealCard = ({ deal }) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        mb: 2.5,
        backgroundColor: "background.paper",
        boxShadow: "0 6px 20px rgba(15,23,42,0.06)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
        },
      }}
    >
      <Box
        component="img"
        src={deal.image}
        alt={deal.title}
        sx={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      />

      <CardContent>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {deal.title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}
          >
            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
            {deal.distance}
          </Typography>

          <Chip
            label={deal.offer}
            size="small"
            sx={{
              backgroundColor: "secondary.main",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default DealCard;
