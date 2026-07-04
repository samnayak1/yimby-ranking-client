import { Tag } from "antd";
import type { Rating } from "../types";

interface Props {
  ratings: Rating[];
}

export default function ScoreBadge({ ratings }: Props) {
  if (!ratings.length) {
    return <span className="text-gray-400">—</span>;
  }

  const latest = ratings.reduce((a, b) => (a.year > b.year ? a : b));

  let color: string;

  if (latest.rating >= 8) {
    color = "success";
  } else if (latest.rating <= 4) {
    color = "error";
  } else {
    color = "warning";
  }

  return (
  <Tag color={color} className="font-semibold px-2 py-0.5">
    <span className="text-xl font-bold">{latest.rating}</span>
    <span className="text-[10px] ml-0.5 opacity-70">/10</span>
  </Tag>
);
}