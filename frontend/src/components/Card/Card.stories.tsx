import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { Card } from "./Card";
import React from "react";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  decorators: [
    (Story) => React.createElement(MemoryRouter, null, React.createElement(Story)),
  ],
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

/** リンク付き default バリアント（ホバー効果確認用） */
export const LinkedDefault: Story = {
  args: {
    variant: "default",
    to: "/example",
    children: React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "font-bold mb-2" }, "リンク付きカード"),
      React.createElement("p", null, "カード全体がクリック可能です。ホバーすると浮き上がり効果が発生します。")
    ),
  },
};

/** リンク付き bordered バリアント（ホバー効果 + ボーダー色変化確認用） */
export const LinkedBordered: Story = {
  args: {
    variant: "bordered",
    to: "/example",
    children: React.createElement(
      "div",
      null,
      React.createElement("h3", { className: "font-bold mb-2" }, "リンク付きカード (bordered)"),
      React.createElement("p", null, "bordered バリアントではホバー時にボーダー色も変化します。")
    ),
  },
};
