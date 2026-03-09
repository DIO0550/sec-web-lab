import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger", "ghost"],
    },
    size: {
      control: "select",
      options: ["sm", "md"],
    },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/* --- variant x size の組み合わせ --- */

export const Primary: Story = {
  args: { variant: "primary", children: "Primary" },
};

export const PrimarySm: Story = {
  args: { variant: "primary", size: "sm", children: "Primary sm" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Secondary" },
};

export const SecondarySm: Story = {
  args: { variant: "secondary", size: "sm", children: "Secondary sm" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Danger" },
};

export const DangerSm: Story = {
  args: { variant: "danger", size: "sm", children: "Danger sm" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Ghost" },
};

export const GhostSm: Story = {
  args: { variant: "ghost", size: "sm", children: "Ghost sm" },
};

/* --- disabled 状態 --- */

export const PrimaryDisabled: Story = {
  args: { variant: "primary", disabled: true, children: "Disabled" },
};

export const SecondaryDisabled: Story = {
  args: { variant: "secondary", disabled: true, children: "Disabled" },
};

export const DangerDisabled: Story = {
  args: { variant: "danger", disabled: true, children: "Disabled" },
};

export const GhostDisabled: Story = {
  args: { variant: "ghost", disabled: true, children: "Disabled" },
};
