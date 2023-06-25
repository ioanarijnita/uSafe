import { Box } from "@mui/material";

export function AuthentificationModal(p: { children: JSX.Element }) {
    return <Box boxShadow={3} style={{
        width: 500,
        backgroundColor: "white",
        borderRadius: 12,
        paddingBottom: 32,
        maxHeight: "calc(100vh - 133px)",
        overflowY: "auto",
    }}>
        {p.children}
    </Box>
}
