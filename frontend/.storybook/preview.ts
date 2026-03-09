import "../src/index.css";
import type { Preview } from "@storybook/react";
import React from "react";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme",
      toolbar: {
        title: "Theme",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "light";
      return React.createElement(
        "div",
        {
          className: theme === "dark"
            ? "dark bg-bg-primary text-text-primary"
            : "bg-bg-primary text-text-primary",
          style: { padding: "1rem", minHeight: "100vh" },
        },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;
