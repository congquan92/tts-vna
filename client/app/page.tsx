import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
export default function Home() {
    return (
        <>
            <Container maxWidth="sm">
                <Box sx={{ mt: 10, textAlign: "center" }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Hello MUI! Lên sóng thành công rồi đó 🚀
                    </Typography>
                    <Button variant="contained" color="primary" size="large">
                        Bấm thử coi
                    </Button>
                </Box>
            </Container>
        </>
    );
}
