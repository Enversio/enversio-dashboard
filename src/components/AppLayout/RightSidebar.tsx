import { Box } from "@saleor/macaw-ui/next";
import React from "react";

export const RightSidebar = ({ children }) => (
  <Box
    borderStyle="solid"
    borderColor="neutralPlain"
    paddingLeft={6}
    paddingRight={6}
    borderLeftWidth={1}
    height="100vh"
    __paddingBottom={300}
    // @ts-ignore
    __position="sticky"
    __top={0}
    __overflowY="scroll"
    __overflowX="hidden"
    __borderYWidth={0}
    __borderTopWidth={0}
    __borderBottomWidth={0}
    __borderRightWidth={0}
    __scrollbarWidth="none"
    padding={6}
    // @ts-ignore
    __gridArea="right"
  >
    {children}
  </Box>
);