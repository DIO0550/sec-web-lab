import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

/** 通常のテキストエリア */
export const Default: Story = {
  args: { placeholder: "自由にテキストを入力..." },
};

/** 等幅フォント（コード入力用） */
export const Mono: Story = {
  args: {
    mono: true,
    rows: 6,
    placeholder: '{"key": "value"}',
  },
};

/** ラベル付き */
export const WithLabel: Story = {
  args: { label: "リクエストボディ", placeholder: "JSON を入力..." },
};
