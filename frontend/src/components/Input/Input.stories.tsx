import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

/** 通常のテキスト入力 */
export const Default: Story = {
  args: { placeholder: "テキストを入力..." },
};

/** ラベル付き */
export const WithLabel: Story = {
  args: { label: "ユーザー名", placeholder: "例: admin" },
};

/** エラー表示 */
export const WithError: Story = {
  args: {
    label: "パスワード",
    type: "password",
    error: "パスワードが正しくありません",
  },
};

/** disabled 状態 */
export const Disabled: Story = {
  args: { label: "読み取り専用", value: "変更不可", disabled: true },
};
