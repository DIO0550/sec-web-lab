import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import React from "react";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
};

export default meta;
type Story = StoryObj<typeof Card>;

/** default バリアント */
export const Default: Story = {
  args: {
    variant: "default",
    children: React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "font-bold mb-2" }, "カードタイトル"),
      React.createElement("p", null, "カード内のコンテンツです。デフォルトバリアントはボーダーなしの背景のみです。")
    ),
  },
};

/** bordered バリアント */
export const Bordered: Story = {
  args: {
    variant: "bordered",
    children: React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "font-bold mb-2" }, "カードタイトル"),
      React.createElement("p", null, "カード内のコンテンツです。bordered バリアントはボーダー付きで区切りを表現します。")
    ),
  },
};
