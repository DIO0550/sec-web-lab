import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
};

export default meta;
type Story = StoryObj<typeof Alert>;

/* --- 全 variant --- */

export const Success: Story = {
  args: {
    variant: "success",
    title: "ログイン成功",
    children: "認証に成功しました。",
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "ログイン失敗",
    children: "ユーザー名またはパスワードが正しくありません。",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "注意",
    children: "この操作は取り消せません。",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    title: "ヒント",
    children: "SQLインジェクションを試してみましょう。",
  },
};

/* --- title なし --- */

export const SuccessNoTitle: Story = {
  args: {
    variant: "success",
    children: "操作が完了しました。",
  },
};

export const ErrorNoTitle: Story = {
  args: {
    variant: "error",
    children: "エラーが発生しました。",
  },
};

export const WarningNoTitle: Story = {
  args: {
    variant: "warning",
    children: "セッションがまもなく期限切れになります。",
  },
};

export const InfoNoTitle: Story = {
  args: {
    variant: "info",
    children: "新しいバージョンが利用可能です。",
  },
};
