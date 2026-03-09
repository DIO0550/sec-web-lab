import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

const sampleOptions = [
  { value: "user", label: "user" },
  { value: "admin", label: "admin" },
  { value: "guest", label: "guest" },
];

/** オプション付き */
export const WithOptions: Story = {
  args: {
    label: "ロール",
    options: sampleOptions,
  },
};

/** disabled 状態 */
export const Disabled: Story = {
  args: {
    label: "ロール",
    options: sampleOptions,
    disabled: true,
  },
};
