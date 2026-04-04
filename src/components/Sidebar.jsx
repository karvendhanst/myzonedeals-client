import { Box, Typography, Button, styled } from "@mui/material";
import DealCard from "./DealCard";
import "../styles/sidebar.css";

const deals = [
  {
    id: 1,
    title: "Luigi's Italian Kitchen",
    distance: "0.3 mi",
    offer: "40% OFF",
    image:
      "https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: 2,
    title: "Tech Haven Gadgets",
    distance: "0.8 mi",
    offer: "NEW",
    image:
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Urban Style Co.",
    distance: "1.2 mi",
    offer: "50% OFF",
    image:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=800&auto=format&fit=crop",
  },
];

const Puller = styled('div')(({ theme }) => ({
  width: 30,
  height: 6,
  backgroundColor: theme.palette.grey[300],
  borderRadius: 3,
  position: 'absolute',
  top: 8,
  left: 'calc(50% - 15px)',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const Sidebar = ({ isMobile, hideTitle }) => {
  return (
    <Box
      className="custom-scrollbar"
      sx={{
        width: { xs: '100%', md: 360 },
        height: '100%',
        p: { xs: 2, md: 3 },
        pt: { xs: hideTitle ? 1 : 4, md: 3 },
        backgroundColor: "background.default",
        overflowY: "auto",
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {!hideTitle && (
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            color: "primary.main",
          }}
        >
          Nearest Deals
        </Typography>
      )}

      <Box sx={{ flexGrow: 1 }}>
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </Box>

      <Button
        fullWidth
        variant="contained"
        color="secondary"
        sx={{
          mt: 2,
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 600,
          py: 1.2,
          color: "background.paper",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(244,162,97,0.4)",
          },
        }}
      >
        View All Trending Offers
      </Button>
    </Box>
  );
};

export default Sidebar;
